"""
Donor API routes - Supabase version
"""

from datetime import date
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, Query

from database import get_supabase
from models.donor import BLOOD_GROUPS, GENDER_OPTIONS, DonorCreate
from utils.distance import calculate_distance

router = APIRouter()


def _format_donor(donor: Dict[str, Any], distance: float | None = None) -> Dict[str, Any]:
    formatted = {
        "id": donor["id"],
        "name": donor["name"],
        "phone": donor["phone"],
        "gender": donor.get("gender"),
        "date_of_birth": donor.get("date_of_birth"),
        "blood_group": donor["blood_group"],
        "address": donor["address"],
        "city": donor["city"],
        "latitude": donor["latitude"],
        "longitude": donor["longitude"],
        "available": donor["available"],
        "created_at": donor.get("created_at"),
    }
    if distance is not None:
        formatted["distance"] = distance
    return formatted


async def _collect_matching_donors(blood: str, lat: float, lng: float, radius: float):
    supabase = get_supabase()

    try:
        result = supabase.rpc(
            "search_nearby_donors",
            {
                "p_blood_group": blood,
                "p_latitude": lat,
                "p_longitude": lng,
                "p_radius_km": radius,
            },
        ).execute()

        return [
            {
                "id": donor["id"],
                "name": donor["name"],
                "phone": donor["phone"],
                "gender": donor.get("gender"),
                "date_of_birth": donor.get("date_of_birth"),
                "blood_group": donor["blood_group"],
                "address": donor["address"],
                "city": donor["city"],
                "latitude": donor["latitude"],
                "longitude": donor["longitude"],
                "available": donor["available"],
                "distance": donor["distance_km"],
            }
            for donor in result.data
        ]
    except Exception:
        return await _fallback_search_donors(blood, lat, lng, radius)


async def _fallback_search_donors(blood: str, lat: float, lng: float, radius: float):
    supabase = get_supabase()

    try:
        result = supabase.table("donors").select(
            "id, name, phone, gender, date_of_birth, blood_group, address, city, latitude, longitude, available"
        ).eq("blood_group", blood).eq("available", True).execute()

        matches = []
        for donor in result.data:
            distance = calculate_distance(lat, lng, donor["latitude"], donor["longitude"])
            if distance <= radius:
                matches.append(
                    {
                        "id": donor["id"],
                        "name": donor["name"],
                        "phone": donor["phone"],
                        "gender": donor.get("gender"),
                        "date_of_birth": donor.get("date_of_birth"),
                        "blood_group": donor["blood_group"],
                        "address": donor["address"],
                        "city": donor["city"],
                        "latitude": donor["latitude"],
                        "longitude": donor["longitude"],
                        "available": donor["available"],
                        "distance": distance,
                    }
                )

        matches.sort(key=lambda item: item["distance"])
        return matches
    except Exception as exc:
        detail = "Donor search is temporarily unavailable. Please try again."
        lowered = str(exc).lower()
        if "getaddrinfo" in lowered or "connecterror" in lowered:
            detail = "Could not reach database service. Check internet/DNS and try again."
        raise HTTPException(status_code=503, detail=detail)


@router.post("/register")
async def register_donor(donor: DonorCreate):
    if donor.blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    if donor.gender not in GENDER_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid gender")

    today = date.today()
    age = today.year - donor.date_of_birth.year - ((today.month, today.day) < (donor.date_of_birth.month, donor.date_of_birth.day))
    if age < 18:
        raise HTTPException(status_code=400, detail="You must be 18 or older to register as a donor")

    if not (-90 <= donor.latitude <= 90) or not (-180 <= donor.longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")

    supabase = get_supabase()
    donor_dict = {
        "name": donor.name,
        "email": donor.email,
        "phone": donor.phone,
        "gender": donor.gender,
        "date_of_birth": donor.date_of_birth.isoformat(),
        "blood_group": donor.blood_group,
        "address": donor.address,
        "city": donor.city,
        "latitude": donor.latitude,
        "longitude": donor.longitude,
        "available": donor.available,
    }

    result = supabase.table("donors").insert(donor_dict).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to register donor")

    return {"message": "Donor registered successfully", "donor_id": result.data[0]["id"]}


@router.get("/search")
async def search_donors(
    blood: str = Query(..., description="Blood group"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(5.0, description="Search radius in km"),
):
    if blood not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")

    results = await _collect_matching_donors(blood, lat, lng, radius)
    return {"blood_group": blood, "search_radius": radius, "donors_found": len(results), "donors": results}


@router.get("/emergency-search")
async def emergency_search(
    blood: str = Query(..., description="Blood group"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
):
    if blood not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    for radius in [5, 10, 20]:
        results = await _collect_matching_donors(blood, lat, lng, radius)
        if results:
            return {
                "blood_group": blood,
                "search_radius": radius,
                "donors_found": len(results),
                "message": f"No donors in 5km. Expanded search to {radius}km." if radius > 5 else "Donors found",
                "donors": results,
            }

    return {"blood_group": blood, "donors_found": 0, "message": "No donors found even in 20km radius", "donors": []}


@router.get("/all")
async def get_all_donors():
    supabase = get_supabase()
    result = supabase.table("donors").select("*").execute()

    formatted_donors = [_format_donor(donor) for donor in result.data]
    return {"total_donors": len(formatted_donors), "donors": formatted_donors}


@router.put("/update-status/{donor_id}")
async def update_donor_status(donor_id: str, available: bool):
    supabase = get_supabase()

    try:
        result = supabase.table("donors").update({"available": available}).eq("id", donor_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Donor not found")

        return {"message": "Donor status updated successfully", "donor_id": donor_id, "available": available}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/donor/{donor_id}")
async def get_donor(donor_id: str):
    supabase = get_supabase()

    try:
        result = supabase.table("donors").select("*").eq("id", donor_id).execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Donor not found")

        return _format_donor(result.data[0])
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))

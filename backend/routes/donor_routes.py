"""
Donor API routes - Supabase version
"""

from fastapi import APIRouter, HTTPException, Query
import socket
from database import get_supabase
from models.donor import DonorCreate, DonorResponse, SearchQuery, EmergencyAlertRequest, BLOOD_GROUPS, GENDER_OPTIONS
from utils.distance import calculate_distance, is_within_radius
from utils.notifications import send_emergency_sms_to_donors
from datetime import date, datetime
from typing import List, Dict, Any

router = APIRouter()


def _format_donor(donor: Dict[str, Any], distance: float = None) -> Dict[str, Any]:
    """Format donor data for response"""
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
    """Find matching donors within radius"""
    supabase = get_supabase()
    
    try:
        # Try using the PostGIS function first (fastest if available)
        result = supabase.rpc(
            'search_nearby_donors',
            {
                'p_blood_group': blood,
                'p_latitude': lat,
                'p_longitude': lng,
                'p_radius_km': radius
            }
        ).execute()
        
        matches = []
        for donor in result.data:
            matches.append({
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
            })
        
        return matches
    except Exception as e:
        # If RPC fails, fall back to client-side filtering (slower but works)
        print(f"⚠️ RPC search failed: {str(e)[:200]}. Falling back to client-side search.")
        return await _fallback_search_donors(blood, lat, lng, radius)

async def _fallback_search_donors(blood: str, lat: float, lng: float, radius: float):
    """Fallback donor search using client-side distance calculation"""
    from utils.distance import calculate_distance
    
    supabase = get_supabase()
    
    try:
        # Get all donors with matching blood group and available status
        result = supabase.table("donors").select(
            "id, name, phone, gender, date_of_birth, blood_group, address, city, latitude, longitude, available"
        ).eq("blood_group", blood).eq("available", True).execute()
        
        matches = []
        for donor in result.data:
            # Calculate distance client-side
            distance = calculate_distance(lat, lng, donor["latitude"], donor["longitude"])
            
            # Only include donors within radius
            if distance <= radius:
                matches.append({
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
                })
        
        # Sort by distance
        matches.sort(key=lambda x: x["distance"])
        return matches
    except Exception as e:
        print(f"✗ Fallback search also failed: {str(e)[:200]}")
        detail = "Donor search is temporarily unavailable. Please try again."
        lowered = str(e).lower()
        if isinstance(e, socket.gaierror) or "getaddrinfo" in lowered or "connecterror" in lowered:
            detail = "Could not reach database service. Check internet/DNS and try again."
        raise HTTPException(status_code=503, detail=detail)


async def _collect_all_available_donors(lat: float, lng: float):
    """Fetch all available donors and sort by distance from requester location."""
    supabase = get_supabase()

    try:
        result = supabase.table("donors").select(
            "id, name, phone, gender, date_of_birth, blood_group, address, city, latitude, longitude, available"
        ).eq("available", True).execute()

        donors = []
        for donor in result.data:
            distance = calculate_distance(lat, lng, donor["latitude"], donor["longitude"])
            donors.append({
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
            })

        donors.sort(key=lambda x: x.get("distance", float("inf")))
        return donors
    except Exception as e:
        print(f"✗ Failed to load available donors: {str(e)[:200]}")
        detail = "Donor notification is temporarily unavailable. Please try again."
        lowered = str(e).lower()
        if isinstance(e, socket.gaierror) or "getaddrinfo" in lowered or "connecterror" in lowered:
            detail = "Could not reach database service. Check internet/DNS and try again."
        raise HTTPException(status_code=503, detail=detail)

@router.post("/register")
async def register_donor(donor: DonorCreate):
    """
    Register a new blood donor
    
    Args:
        donor: Donor details
    """
    # Validate blood group
    if donor.blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    if donor.gender not in GENDER_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid gender")

    today = date.today()
    age = today.year - donor.date_of_birth.year - (
        (today.month, today.day) < (donor.date_of_birth.month, donor.date_of_birth.day)
    )
    if age < 18:
        raise HTTPException(status_code=400, detail="You must be 18 or older to register as a donor")
    
    # Validate coordinates
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
    
    return {
        "message": "Donor registered successfully",
        "donor_id": result.data[0]["id"]
    }

@router.get("/search")
async def search_donors(
    blood: str = Query(..., description="Blood group"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius: float = Query(5.0, description="Search radius in km")
):
    """
    Search for available donors by blood group within radius
    
    Args:
        blood: Required blood group
        lat: Patient latitude
        lng: Patient longitude
        radius: Search radius in km (default 5)
    """
    # Validate blood group
    if blood not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")
    
    # Validate coordinates
    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    results = await _collect_matching_donors(blood, lat, lng, radius)
    
    return {
        "blood_group": blood,
        "search_radius": radius,
        "donors_found": len(results),
        "donors": results
    }

@router.get("/emergency-search")
async def emergency_search(
    blood: str = Query(..., description="Blood group"),
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    """
    Emergency search - returns all donors within 20km sorted by distance
    
    Args:
        blood: Required blood group
        lat: Patient latitude
        lng: Patient longitude
    """
    if blood not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    if not (-90 <= lat <= 90) or not (-180 <= lng <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    # Use single query with max radius instead of loop
    results = await _collect_matching_donors(blood, lat, lng, 20)
    
    # Sort by distance
    results_sorted = sorted(results, key=lambda x: x.get("distance", float('inf')))
    
    # Determine effective radius based on results
    if results_sorted:
        max_distance = results_sorted[-1]["distance"] if results_sorted else 20
        effective_radius = min(max_distance + 1, 20)
    else:
        effective_radius = 20
    
    return {
        "blood_group": blood,
        "search_radius": effective_radius,
        "donors_found": len(results_sorted),
        "message": "Donors found" if results_sorted else "No donors found in 20km radius",
        "donors": results_sorted
    }


@router.post("/emergency-alert")
async def emergency_alert(payload: EmergencyAlertRequest):
    """Find nearby donors and send emergency SMS alerts to registered phones."""
    if payload.blood_group not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")

    if not (-90 <= payload.latitude <= 90) or not (-180 <= payload.longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")

    # Notify all currently available registered donors, sorted by distance.
    matched_donors = await _collect_all_available_donors(
        payload.latitude,
        payload.longitude,
    )
    selected_radius = None

    if not matched_donors:
        return {
            "status": "no-donors",
            "message": "No available registered donors found",
            "blood_group": payload.blood_group,
            "search_radius": selected_radius,
            "donors_found": 0,
            "notifications_sent": 0,
            "notifications_failed": 0,
            "donors": [],
        }

    summary = send_emergency_sms_to_donors(
        donors=matched_donors,
        blood_group=payload.blood_group,
        requester_name=payload.requester_name or "A patient",
        custom_message=payload.message or "",
    )

    return {
        "status": "sent" if summary["sent"] > 0 else "failed",
        "message": "Emergency alert processed",
        "blood_group": payload.blood_group,
        "search_radius": selected_radius,
        "donors_found": len(matched_donors),
        "notifications_sent": summary["sent"],
        "notifications_failed": summary["failed"],
        "notification_failures": summary["failures"],
        "donors": matched_donors,
    }

@router.get("/all")
async def get_all_donors():
    """Get all registered donors"""
    supabase = get_supabase()
    result = supabase.table("donors").select("*").execute()
    
    formatted_donors = []
    for donor in result.data:
        formatted_donors.append({
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
            "created_at": donor.get("created_at")
        })
    
    return {
        "total_donors": len(formatted_donors),
        "donors": formatted_donors
    }

@router.put("/update-status/{donor_id}")
async def update_donor_status(donor_id: str, available: bool):
    """
    Update donor availability status
    
    Args:
        donor_id: Donor UUID
        available: Availability status
    """
    supabase = get_supabase()
    
    try:
        result = supabase.table("donors").update(
            {"available": available}
        ).eq("id", donor_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Donor not found")
        
        return {
            "message": "Donor status updated successfully",
            "donor_id": donor_id,
            "available": available
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/donor/{donor_id}")
async def get_donor(donor_id: str):
    """Get specific donor by ID"""
    supabase = get_supabase()
    
    try:
        result = supabase.table("donors").select("*").eq("id", donor_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Donor not found")
        
        donor = result.data[0]
        return {
            "id": donor["id"],
            "name": donor["name"],
            "phone": donor["phone"],
            "blood_group": donor["blood_group"],
            "address": donor["address"],
            "city": donor["city"],
            "latitude": donor["latitude"],
            "longitude": donor["longitude"],
            "available": donor["available"],
            "created_at": donor.get("created_at")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

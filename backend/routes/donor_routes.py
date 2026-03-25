"""
Donor API routes
"""

from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from database import get_donors_collection
from models.donor import DonorCreate, DonorResponse, SearchQuery, BLOOD_GROUPS
from utils.distance import calculate_distance, is_within_radius
from datetime import datetime

router = APIRouter()

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
    
    # Validate coordinates
    if not (-90 <= donor.latitude <= 90) or not (-180 <= donor.longitude <= 180):
        raise HTTPException(status_code=400, detail="Invalid coordinates")
    
    collection = await get_donors_collection()
    
    donor_dict = {
        **donor.dict(),
        "location": {
            "type": "Point",
            "coordinates": [donor.longitude, donor.latitude]  # GeoJSON format
        },
        "created_at": datetime.utcnow()
    }
    
    result = await collection.insert_one(donor_dict)
    
    return {
        "message": "Donor registered successfully",
        "donor_id": str(result.inserted_id)
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
    
    collection = await get_donors_collection()
    
    # Query for donors with matching blood group and available status
    donors = await collection.find({
        "blood_group": blood,
        "available": True
    }).to_list(length=100)
    
    # Calculate distance and filter by radius
    results = []
    for donor in donors:
        distance = calculate_distance(
            lat, lng,
            donor["latitude"], donor["longitude"]
        )
        
        if is_within_radius(distance, radius):
            donor_data = {
                "id": str(donor["_id"]),
                "name": donor["name"],
                "phone": donor["phone"],
                "blood_group": donor["blood_group"],
                "address": donor["address"],
                "city": donor["city"],
                "latitude": donor["latitude"],
                "longitude": donor["longitude"],
                "available": donor["available"],
                "distance": distance
            }
            results.append(donor_data)
    
    # Sort by distance
    results.sort(key=lambda x: x["distance"])
    
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
    Emergency search - expands radius if no donors found
    Increases search radius: 5km -> 10km -> 20km
    
    Args:
        blood: Required blood group
        lat: Patient latitude
        lng: Patient longitude
    """
    if blood not in BLOOD_GROUPS:
        raise HTTPException(status_code=400, detail="Invalid blood group")
    
    radii = [5, 10, 20]  # Progressive radius expansion
    
    for radius in radii:
        collection = await get_donors_collection()
        donors = await collection.find({
            "blood_group": blood,
            "available": True
        }).to_list(length=100)
        
        results = []
        for donor in donors:
            distance = calculate_distance(
                lat, lng,
                donor["latitude"], donor["longitude"]
            )
            
            if is_within_radius(distance, radius):
                donor_data = {
                    "id": str(donor["_id"]),
                    "name": donor["name"],
                    "phone": donor["phone"],
                    "blood_group": donor["blood_group"],
                    "address": donor["address"],
                    "city": donor["city"],
                    "latitude": donor["latitude"],
                    "longitude": donor["longitude"],
                    "available": donor["available"],
                    "distance": distance
                }
                results.append(donor_data)
        
        if results:
            results.sort(key=lambda x: x["distance"])
            return {
                "blood_group": blood,
                "search_radius": radius,
                "donors_found": len(results),
                "message": f"No donors in 5km. Expanded search to {radius}km.",
                "donors": results
            }
    
    return {
        "blood_group": blood,
        "donors_found": 0,
        "message": "No donors found even in 20km radius",
        "donors": []
    }

@router.get("/all")
async def get_all_donors():
    """Get all registered donors"""
    collection = await get_donors_collection()
    donors = await collection.find().to_list(length=None)
    
    formatted_donors = []
    for donor in donors:
        formatted_donors.append({
            "id": str(donor["_id"]),
            "name": donor["name"],
            "phone": donor["phone"],
            "blood_group": donor["blood_group"],
            "address": donor["address"],
            "city": donor["city"],
            "latitude": donor["latitude"],
            "longitude": donor["longitude"],
            "available": donor["available"],
            "created_at": donor["created_at"]
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
        donor_id: Donor MongoDB ID
        available: Availability status
    """
    collection = await get_donors_collection()
    
    try:
        result = await collection.update_one(
            {"_id": ObjectId(donor_id)},
            {"$set": {"available": available}}
        )
        
        if result.matched_count == 0:
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
    collection = await get_donors_collection()
    
    try:
        donor = await collection.find_one({"_id": ObjectId(donor_id)})
        
        if not donor:
            raise HTTPException(status_code=404, detail="Donor not found")
        
        return {
            "id": str(donor["_id"]),
            "name": donor["name"],
            "phone": donor["phone"],
            "blood_group": donor["blood_group"],
            "address": donor["address"],
            "city": donor["city"],
            "latitude": donor["latitude"],
            "longitude": donor["longitude"],
            "available": donor["available"],
            "created_at": donor["created_at"]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

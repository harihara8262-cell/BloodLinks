"""
Donor model and validation schemas
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"]

class DonorBase(BaseModel):
    """Base donor model"""
    name: str
    email: Optional[EmailStr] = None
    phone: str
    gender: str
    date_of_birth: date
    blood_group: str
    address: str
    city: str
    latitude: float
    longitude: float
    available: bool = True

class DonorCreate(DonorBase):
    """Donor creation model"""
    pass

class DonorUpdate(BaseModel):
    """Donor update model"""
    available: bool
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class DonorResponse(DonorBase):
    """Donor response model"""
    id: Optional[str] = Field(None, alias="_id")
    created_at: datetime
    email_verified: bool = False
    distance: Optional[float] = None  # Will be calculated on search
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "name": "Arun Kumar",
                "phone": "9876543210",
                "gender": "Male",
                "date_of_birth": "1998-06-15",
                "blood_group": "A+",
                "address": "Anna Nagar",
                "city": "Chennai",
                "latitude": 13.0827,
                "longitude": 80.2707,
                "available": True,
                "created_at": "2024-01-15T10:30:00"
            }
        }

class SearchQuery(BaseModel):
    """Search query model"""
    blood_group: str
    latitude: float
    longitude: float
    radius: float = 5.0  # Default 5 km


class EmergencyAlertRequest(BaseModel):
    """Emergency alert payload"""
    blood_group: str
    latitude: float
    longitude: float
    message: Optional[str] = None
    requester_name: Optional[str] = None

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

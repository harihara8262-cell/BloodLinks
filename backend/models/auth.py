"""
Authentication models for username/password flow
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    username: str
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    username: str
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        populate_by_name = True


class AuthResponse(BaseModel):
    message: str
    user: UserResponse
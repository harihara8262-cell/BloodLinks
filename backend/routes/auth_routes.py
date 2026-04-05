"""
Authentication routes for signup and login - Supabase version
"""

from datetime import datetime
import hashlib
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_supabase

router = APIRouter()


class AuthRequest(BaseModel):
    username: str
    password: str


def _hash_password(password: str, salt: str) -> str:
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 150000)
    return digest.hex()


def _verify_password(password: str, user: dict) -> bool:
    stored_hash = user.get("password_hash", "")
    salt = user.get("password_salt", "")

    if not stored_hash:
        legacy_plain = user.get("password")
        return isinstance(legacy_plain, str) and legacy_plain == password

    # Current format - fast path, check this first
    if _hash_password(password, salt) == stored_hash:
        return True
    
    # Only attempt backward compatibility if current format fails
    # and we have old salt/hash data
    if salt and len(stored_hash) == 64:  # SHA256 hex length
        # Backward compatibility for older hashing strategies (minimal checks)
        if hashlib.sha256(password.encode("utf-8")).hexdigest() == stored_hash:
            return True
        if hashlib.sha256((salt + password).encode("utf-8")).hexdigest() == stored_hash:
            return True

    return False


@router.post("/register")
async def register(payload: AuthRequest):
    username = payload.username.strip().lower()
    password = payload.password

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters")

    supabase = get_supabase()
    
    # Check if user exists (case-sensitive for better performance)
    existing = supabase.table("users").select("*").eq("username", username).execute()
    
    if existing.data:
        # Update existing user's password
        reset_salt = os.urandom(16).hex()
        supabase.table("users").update({
            "username": username,
            "password_salt": reset_salt,
            "password_hash": _hash_password(password, reset_salt),
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", existing.data[0]["id"]).execute()
        
        return {
            "message": "Password updated for existing user",
            "username": username,
            "updated": True,
        }

    salt = os.urandom(16).hex()
    password_hash = _hash_password(password, salt)

    result = supabase.table("users").insert({
        "username": username,
        "password_salt": salt,
        "password_hash": password_hash,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()

    return {
        "message": "User registered successfully",
        "user_id": result.data[0]["id"],
        "username": username,
        "updated": False,
    }


@router.post("/login")
async def login(payload: AuthRequest):
    username = payload.username.strip().lower()
    password = payload.password

    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters")

    supabase = get_supabase()
    user_result = supabase.table("users").select("*").ilike("username", username).execute()

    if not user_result.data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    user = user_result.data[0]

    if user.get("google_id") and not user.get("password_hash") and not user.get("password"):
        raise HTTPException(status_code=401, detail="This account uses Google login only")

    if not user.get("password_hash") and not user.get("password"):
        raise HTTPException(status_code=401, detail="Account exists but password is not configured")

    if not _verify_password(password, user):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # Normalize old records to current hashing strategy after successful login.
    current_hash = user.get("password_hash", "")
    current_salt = user.get("password_salt", "")
    if current_hash != _hash_password(password, current_salt):
        new_salt = os.urandom(16).hex()
        supabase.table("users").update({
            "username": username,
            "password_salt": new_salt,
            "password_hash": _hash_password(password, new_salt),
        }).eq("id", user["id"]).execute()

    return {
        "message": "Login successful",
        "username": username,
    }

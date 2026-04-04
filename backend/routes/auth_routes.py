"""
Authentication routes for signup and login.
"""

from datetime import datetime
import hashlib
import os
import re

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database import get_users_collection

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

    # Current format
    if _hash_password(password, salt) == stored_hash:
        return True

    # Backward compatibility for older hashing strategies.
    old_pbkdf2 = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000).hex()
    if old_pbkdf2 == stored_hash:
        return True

    if hashlib.sha256(password.encode("utf-8")).hexdigest() == stored_hash:
        return True

    if salt:
        if hashlib.sha256((salt + password).encode("utf-8")).hexdigest() == stored_hash:
            return True
        if hashlib.sha256((password + salt).encode("utf-8")).hexdigest() == stored_hash:
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

    users = await get_users_collection()
    existing = await users.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})
    if existing:
        reset_salt = os.urandom(16).hex()
        await users.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "username": username,
                    "password_salt": reset_salt,
                    "password_hash": _hash_password(password, reset_salt),
                    "updated_at": datetime.utcnow(),
                },
                "$unset": {"password": ""},
            },
        )
        return {
            "message": "Password updated for existing user",
            "username": username,
            "updated": True,
        }

    salt = os.urandom(16).hex()
    password_hash = _hash_password(password, salt)

    result = await users.insert_one(
        {
            "username": username,
            "password_salt": salt,
            "password_hash": password_hash,
            "created_at": datetime.utcnow(),
        }
    )

    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id),
        "username": username,
        "updated": False,
    }


@router.post("/login")
async def login(payload: AuthRequest):
    username = payload.username.strip().lower()
    password = payload.password

    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must contain at least 8 characters")

    users = await get_users_collection()
    user = await users.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

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
        await users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "username": username,
                    "password_salt": new_salt,
                    "password_hash": _hash_password(password, new_salt),
                },
                "$unset": {"password": ""},
            },
        )

    return {
        "message": "Login successful",
        "username": username,
    }

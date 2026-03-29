"""
Username/password authentication routes
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from database import get_db
from models.auth import UserRegister, UserLogin, AuthResponse, UserResponse
from utils.password import hash_password, verify_password

router = APIRouter()


@router.post("/register", response_model=AuthResponse)
async def register_user(payload: UserRegister):
    username = payload.username.strip().lower()
    if len(username) < 4:
        raise HTTPException(status_code=400, detail="Username must be at least 4 characters")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    db = get_db()
    users = db["users"]

    existing = await users.find_one({"username": username})
    if existing:
        raise HTTPException(status_code=409, detail="Username already exists")

    password_hash, salt = hash_password(payload.password)
    user_doc = {
        "username": username,
        "full_name": payload.full_name.strip() if payload.full_name else None,
        "password_hash": password_hash,
        "password_salt": salt,
        "created_at": datetime.utcnow(),
    }
    result = await users.insert_one(user_doc)
    saved = await users.find_one({"_id": result.inserted_id})

    return AuthResponse(
        message="User registered successfully",
        user=UserResponse(
            id=str(saved["_id"]),
            username=saved["username"],
            full_name=saved.get("full_name"),
            created_at=saved["created_at"],
        ),
    )


@router.post("/login", response_model=AuthResponse)
async def login_user(payload: UserLogin):
    username = payload.username.strip().lower()
    db = get_db()
    users = db["users"]

    user = await users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    ok = verify_password(payload.password, user["password_hash"], user["password_salt"])
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return AuthResponse(
        message="Login successful",
        user=UserResponse(
            id=str(user["_id"]),
            username=user["username"],
            full_name=user.get("full_name"),
            created_at=user["created_at"],
        ),
    )
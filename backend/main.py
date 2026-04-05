"""
BloodConnect - Blood Donor Finder Backend
Main FastAPI application entry point
"""

from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_supabase, close_supabase_connection
from routes.donor_routes import router as donor_router
from routes.email_routes import router as email_router
from routes.auth_routes import router as auth_router


def _get_allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGINS", "").strip()
    if configured:
        origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
        if origins:
            return origins

    return [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ]

app = FastAPI(
    title="BloodConnect API",
    description="Smart Nearby Blood Donor Finder",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection events
@app.on_event("startup")
async def startup():
    await connect_to_supabase()

@app.on_event("shutdown")
async def shutdown():
    await close_supabase_connection()

# Include routes
app.include_router(donor_router, prefix="/api/donor", tags=["Donor"])
app.include_router(email_router, prefix="/api/email", tags=["Email Verification"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to BloodConnect API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

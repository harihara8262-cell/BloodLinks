"""
BloodConnect - Blood Donor Finder Backend
Main FastAPI application entry point
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_to_supabase, close_supabase_connection
from routes.donor_routes import router as donor_router
from routes.email_routes import router as email_router
from routes.auth_routes import router as auth_router


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"), override=True)


def _get_allowed_origins() -> list[str]:
    local_defaults = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ]

    configured = os.getenv("FRONTEND_ORIGINS", "").strip()
    if configured:
        configured_origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
        origins = list(dict.fromkeys(local_defaults + configured_origins))
        if origins:
            return origins

    return local_defaults

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

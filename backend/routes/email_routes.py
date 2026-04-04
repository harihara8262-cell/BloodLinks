"""
Email-related routes placeholder.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def email_health():
    """Health endpoint for email route group."""
    return {"status": "ok", "service": "email-routes"}

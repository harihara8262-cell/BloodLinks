"""
Email verification routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from utils.email import generate_otp, send_verification_email, verify_otp

router = APIRouter()

class SendOTPRequest(BaseModel):
    """Request to send OTP"""
    email: EmailStr
    name: str

class VerifyOTPRequest(BaseModel):
    """Request to verify OTP"""
    email: EmailStr
    otp: str

@router.post("/send-otp")
async def send_otp(request: SendOTPRequest):
    """
    Send OTP to email for verification
    
    Args:
        email: User's email address
        name: User's name
    
    Returns:
        Success message
    """
    try:
        # Generate OTP
        otp = generate_otp()
        
        # Send email
        success = send_verification_email(request.email, otp, request.name)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send verification email")
        
        # Save OTP to store
        from utils.email import save_otp
        save_otp(request.email, otp)
        
        return {
            "status": "success",
            "message": f"Verification code sent to {request.email}",
            "expires_in": "10 minutes"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/verify-otp")
async def verify_email_otp(request: VerifyOTPRequest):
    """
    Verify OTP sent to email
    
    Args:
        email: User's email
        otp: 6-digit OTP code
    
    Returns:
        Verification result
    """
    try:
        is_valid, message = verify_otp(request.email, request.otp)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        return {
            "status": "success",
            "message": message,
            "email_verified": True
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/resend-otp")
async def resend_otp(request: SendOTPRequest):
    """Resend OTP to email"""
    from utils.email import clear_otp
    clear_otp(request.email)
    
    return await send_otp(request)

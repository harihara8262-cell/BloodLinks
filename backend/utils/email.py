"""
Email sending and OTP verification utilities
"""

import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional

# Gmail SMTP Configuration
GMAIL_SENDER = "your_email@gmail.com"  # Change this
GMAIL_APP_PASSWORD = "your_app_password"  # Change this (16-char app password from Gmail)

# Store OTPs in memory (in production, use Redis or Database)
otp_store = {}

def generate_otp(length: int = 6) -> str:
    """Generate a 6-digit numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))


def send_verification_email(email: str, otp: str, name: str) -> bool:
    """
    Send OTP verification email
    
    Args:
        email: Recipient email
        otp: 6-digit OTP code
        name: Recipient name
    
    Returns:
        True if sent successfully, False otherwise
    """
    try:
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "bloodlink - Email Verification Code"
        message["From"] = GMAIL_SENDER
        message["To"] = email

        # HTML email body
        html = f"""\
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <h2 style="color: #d32f2f; text-align: center;">🩸 bloodlink</h2>
      <h3 style="color: #333; text-align: center;">Email Verification</h3>
      
      <p style="color: #666; font-size: 16px;">Hi <strong>{name}</strong>,</p>
      
      <p style="color: #666; font-size: 16px;">
        Thank you for registering with bloodlink. Your verification code is:
      </p>
      
      <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
        <p style="font-size: 32px; font-weight: bold; color: #d32f2f; letter-spacing: 5px; margin: 0;">
          {otp}
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px;">
        This code expires in <strong>10 minutes</strong>.
      </p>
      
      <p style="color: #666; font-size: 14px;">
        If you didn't register for bloodlink, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      
      <p style="color: #999; font-size: 12px; text-align: center;">
        © 2024 bloodlink. Connecting lives through blood donation.
      </p>
    </div>
  </body>
</html>
"""
        
        # Create email body
        part = MIMEText(html, "html")
        message.attach(part)

        # Connect to Gmail SMTP server and send
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_SENDER, email, message.as_string())
        
        print(f"✓ Verification email sent to {email}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send email: {e}")
        return False


def save_otp(email: str, otp: str) -> None:
    """Save OTP with expiration time (10 minutes)"""
    otp_store[email] = {
        "otp": otp,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(minutes=10),
        "attempts": 0
    }


def verify_otp(email: str, otp: str) -> tuple[bool, str]:
    """
    Verify OTP
    
    Returns:
        (is_valid: bool, message: str)
    """
    if email not in otp_store:
        return False, "No OTP found. Please request a new verification code."
    
    otp_data = otp_store[email]
    
    # Check if expired
    if datetime.now() > otp_data["expires_at"]:
        del otp_store[email]
        return False, "OTP expired. Please request a new verification code."
    
    # Check attempts (max 5)
    if otp_data["attempts"] >= 5:
        del otp_store[email]
        return False, "Too many attempts. Please request a new verification code."
    
    # Check OTP
    if otp_data["otp"] != otp:
        otp_data["attempts"] += 1
        return False, f"Invalid OTP. {5 - otp_data['attempts']} attempts remaining."
    
    # OTP is valid - delete it
    del otp_store[email]
    return True, "Email verified successfully!"


def clear_otp(email: str) -> None:
    """Clear OTP for an email"""
    if email in otp_store:
        del otp_store[email]

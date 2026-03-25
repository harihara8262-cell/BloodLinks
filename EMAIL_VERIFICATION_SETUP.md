# Email Verification Setup Guide

## Overview
Your bloodlink app now has **2-factor email verification**:
1. Users register with their email
2. They receive a 6-digit OTP via email
3. They must verify the OTP before accessing the app

## Setup Instructions

### Step 1: Enable Gmail App Password

This feature uses Gmail SMTP to send emails. You'll need a Gmail app password (2-factor authentication required).

**Prerequisites:**
- Gmail account with 2-factor authentication enabled
- Alternative: Use a Google Workspace account (simpler setup)

**To get an App Password:**

1. Go to: https://myaccount.google.com/security
2. Find "App passwords" (appears when 2FA is enabled)
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Copy this password (you'll use it in step 2)

### Step 2: Configure Email Credentials

**In `backend/utils/email.py`:**

Find these lines and update them:

```python
# Gmail SMTP Configuration
GMAIL_SENDER = "your_email@gmail.com"  # ← Change this to your Gmail address
GMAIL_APP_PASSWORD = "your_app_password"  # ← Change this to your 16-char app password
```

**Example:**
```python
GMAIL_SENDER = "harih.sk@gmail.com"
GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop"  # 16-character app password
```

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This installs `email-validator` which is needed for email validation.

## How It Works

### Registration Flow:
1. User fills registration form (now includes email)
2. User clicks "Get My Location" to auto-fill address
3. User clicks "Register as Donor"
4. Donor record is created in MongoDB
5. **User is redirected to Verify page**

### Email Verification Flow:
1. **OTP Email is sent** to user's email address
2. User enters 6-digit OTP they received
3. OTP is verified on backend
4. User is redirected to home page
5. User can now register/search for blood donors

### API Endpoints:

**Send OTP:**
```
POST /api/email/send-otp
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Verify OTP:**
```
POST /api/email/verify-otp
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Resend OTP:**
```
POST /api/email/resend-otp
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

## Testing

### Test Mode (Without Real Email)

To test without setting up Gmail, you can temporarily modify `email.py`:

```python
def send_verification_email(email: str, otp: str, name: str) -> bool:
    # For testing, just print the OTP
    print(f"[TEST] OTP for {email}: {otp}")
    return True
```

Then the OTP will appear in your backend console (terminal) instead of being emailed.

### Test Email Sending

1. Refresh http://127.0.0.1:3001
2. Go to "Register as Donor"
3. Fill in all details (name, email, phone, address, city)
4. Click "Register"
5. You'll be redirected to verification page
6. Check your email inbox (or terminal if in test mode)
7. Enter the 6-digit OTP
8. Click "Verify OTP"
9. You'll be directed back to home page!

## Features

✅ **Email Validation** - Validates email format before sending
✅ **OTP Expiration** - OTP expires after 10 minutes
✅ **Attempt Limiting** - Max 5 attempts before requiring new OTP
✅ **Resend Option** - Users can request new OTP with 60-second cooldown
✅ **HTML Email** - Professional formatted emails with branding
✅ **Error Handling** - Clear error messages for each scenario
✅ **Mobile Friendly** - Verification page works on all devices

## Troubleshooting

### "Failed to send verification email"
- Check Gmail sender address spelling
- Check app password is correct (from Gmail app passwords page)
- Ensure 2FA is enabled on your Gmail account
- Check backend logs for detailed error

### OTP Not Received
- Check spam/junk folder
- Wait 1-2 minutes for email delivery
- Click "Resend OTP" to request new code
- Verify email address was typed correctly

### OTP Always Shows as Invalid
- Make sure you're entering exactly 6 digits
- Check that code hasn't expired (10 minute limit)
- Copy-paste from email rather than typing manually

## Security Notes

⚠️ **Production Warning:**
- Current OTP storage is in-memory (resets on server restart)
- For production, use Redis or database to store OTPs
- For production, use environment variables for Gmail credentials (not hardcoded)
- Consider using SendGrid or other email service for scale

**For production**, update `backend/utils/email.py` to use:
```python
import os

GMAIL_SENDER = os.getenv("GMAIL_SENDER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")
```

Then add to `.env`:
```
GMAIL_SENDER=your@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

## File Changes Made

- **Added:** `backend/utils/email.py` - Email and OTP utilities
- **Added:** `backend/routes/email_routes.py` - Email verification endpoints
- **Added:** `frontend/src/pages/Verify.jsx` - OTP verification page
- **Modified:** `backend/models/donor.py` - Added email field
- **Modified:** `backend/main.py` - Added email routes
- **Modified:** `backend/requirements.txt` - Added email-validator
- **Modified:** `frontend/src/pages/Register.jsx` - Added email input and redirect
- **Modified:** `frontend/src/App.jsx` - Added /verify route

## Next Steps

1. ✅ Update email credentials in `backend/utils/email.py`
2. ✅ Restart backend server (`start-backend.bat`)
3. ✅ Test registration and email verification
4. ✅ Celebrate! Your app now has email verification! 🎉

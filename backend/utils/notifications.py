"""
Notification helpers for emergency alerts.
"""
import re
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException


def _normalize_to_e164(phone: str, default_country_code: str = "+91"):
    """Normalize common user-entered phone formats to E.164 for Twilio.

    Returns a tuple of (normalized_phone or None, reason_if_invalid or None).
    """
    if not phone:
        return None, "No phone number on file"

    raw = str(phone).strip()
    has_plus = raw.startswith("+")
    digits = re.sub(r"\D", "", raw)

    if not digits:
        return None, "Phone number has no digits"

    normalized = None

    if has_plus:
        normalized = f"+{digits}"
    elif len(digits) == 10:
        # Common local format in India; convert to +91XXXXXXXXXX.
        normalized = f"{default_country_code}{digits}"
    elif len(digits) == 11 and digits.startswith("0"):
        normalized = f"{default_country_code}{digits[1:]}"
    elif len(digits) >= 11:
        # Assume this already includes country code, just add +.
        normalized = f"+{digits}"

    if not normalized:
        return None, "Could not infer country code. Use E.164 format like +919876543210"

    e164_digits = normalized[1:] if normalized.startswith("+") else normalized
    if not (8 <= len(e164_digits) <= 15):
        return None, "Phone number must be 8 to 15 digits in E.164 format"

    return normalized, None


def send_emergency_sms_to_donors(donors, blood_group, requester_name, custom_message):
    """Send emergency SMS alerts to nearby donors using Twilio."""
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID", "").strip()
    
    if not account_sid or not auth_token:
        return {
            "sent": 0,
            "failed": len(donors),
            "failures": [
                {
                    "donor_id": donor.get("id"),
                    "phone": donor.get("phone"),
                    "reason": "Missing Twilio credentials (TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN)",
                }
                for donor in donors
            ],
        }
    
    # Check if messaging_service_sid is a placeholder or invalid
    if messaging_service_sid and (messaging_service_sid.startswith("PASTE_") or messaging_service_sid.startswith("YOUR_")):
        messaging_service_sid = ""
    
    if not from_number and not messaging_service_sid:
        return {
            "sent": 0,
            "failed": len(donors),
            "failures": [
                {
                    "donor_id": donor.get("id"),
                    "phone": donor.get("phone"),
                    "reason": "Missing TWILIO_FROM_NUMBER or valid TWILIO_MESSAGING_SERVICE_SID configuration",
                }
                for donor in donors
            ],
        }
    
    client = Client(account_sid, auth_token)
    sent_count = 0
    failed_donors = []
    
    message_body = f"URGENT: {requester_name} needs {blood_group} blood donation."
    if custom_message:
        message_body += f" Details: {custom_message}"
    
    for donor in donors:
        try:
            phone = donor.get("phone")
            normalized_phone, normalize_error = _normalize_to_e164(phone)

            if normalize_error:
                failed_donors.append({
                    "donor_id": donor.get("id"),
                    "phone": phone,
                    "reason": normalize_error,
                })
                continue
            
            if messaging_service_sid:
                client.messages.create(
                    body=message_body,
                    to=normalized_phone,
                    messaging_service_sid=messaging_service_sid,
                )
            else:
                client.messages.create(
                    body=message_body,
                    from_=from_number,
                    to=normalized_phone,
                )
            sent_count += 1
        except TwilioRestException as e:
            error_code = str(getattr(e, "code", "") or "")
            twilio_message = str(getattr(e, "msg", "") or str(e)).strip()

            if error_code == "21608":
                reason = "Twilio trial account cannot send SMS to unverified recipient numbers. Verify this number in Twilio or upgrade the account."
            elif error_code == "21211":
                reason = "Recipient phone number is invalid for SMS delivery."
            elif twilio_message:
                reason = twilio_message
            else:
                reason = f"Twilio error ({error_code})" if error_code else "Twilio SMS send failed"

            failed_donors.append({
                "donor_id": donor.get("id"),
                "phone": donor.get("phone"),
                "reason": reason,
            })
        except Exception as e:
            failed_donors.append({
                "donor_id": donor.get("id"),
                "phone": donor.get("phone"),
                "reason": str(e),
            })
    
    return {
        "sent": sent_count,
        "failed": len(failed_donors),
        "failures": failed_donors,
    }

"""
SMS notification utilities for emergency alerts
"""

import os
import re
from typing import Dict, List, Tuple

try:
    from twilio.rest import Client as TwilioClient
except Exception:  # pragma: no cover - optional dependency
    TwilioClient = None


def _normalize_phone_number(phone: str) -> str:
    digits = "".join(ch for ch in str(phone) if ch.isdigit())
    # Common local format in India: 0XXXXXXXXXX -> +91XXXXXXXXXX
    if len(digits) == 11 and digits.startswith("0"):
        return f"+91{digits[1:]}"
    if len(digits) == 10:
        return f"+91{digits}"
    if len(digits) == 12 and digits.startswith("91"):
        return f"+{digits}"
    if str(phone).startswith("+"):
        return str(phone)
    return f"+{digits}" if digits else str(phone)


def _is_valid_e164_phone(phone: str) -> bool:
    # Generic E.164 check: + followed by 8-15 digits.
    if not re.fullmatch(r"\+[1-9]\d{7,14}", phone or ""):
        return False

    # India mobile numbers should start with 6-9 after country code +91.
    if phone.startswith("+91"):
        local = phone[3:]
        return len(local) == 10 and local[0] in "6789"

    return True


def _clean_error_text(text: str) -> str:
    # Remove ANSI escape sequences from Twilio exceptions.
    ansi_pattern = re.compile(r"\x1B\[[0-?]*[ -/]*[@-~]")
    return ansi_pattern.sub("", text or "").strip()


def _friendly_twilio_error(text: str) -> str:
    cleaned = _clean_error_text(text)
    lowered = cleaned.lower()
    if "63038" in cleaned or "exceeded the 50 daily messages limit" in lowered:
        return "Twilio daily message limit reached (50/day). Try again tomorrow or upgrade the Twilio account."
    return cleaned


def _is_http_url(value: str) -> bool:
    return bool(re.fullmatch(r"https?://\S+", value or ""))


def _send_sms_twilio(to_phone: str, text: str, logo_url: str = "") -> Tuple[bool, str]:
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_phone = os.getenv("TWILIO_FROM_NUMBER", "")
    messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID", "")

    missing = []
    if not account_sid:
        missing.append("TWILIO_ACCOUNT_SID")
    if not auth_token:
        missing.append("TWILIO_AUTH_TOKEN")
    if not from_phone and not messaging_service_sid:
        missing.append("TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID")

    if missing:
        return False, f"Missing Twilio config: {', '.join(missing)}"

    if TwilioClient is None:
        return False, "twilio package is not installed"

    client = TwilioClient(account_sid, auth_token)
    payload = {
        "body": text,
        "to": to_phone,
    }
    # Twilio uses media_url for MMS/WhatsApp-style rich messages.
    # If media fails, fall back to plain text SMS so alerts still go out.
    if _is_http_url(logo_url):
        payload["media_url"] = [logo_url]

    if messaging_service_sid:
        payload["messaging_service_sid"] = messaging_service_sid
    else:
        payload["from_"] = from_phone

    try:
        client.messages.create(**payload)
        return True, "sent"
    except Exception as first_exc:
        if payload.get("media_url"):
            payload_without_media = dict(payload)
            payload_without_media.pop("media_url", None)
            try:
                client.messages.create(**payload_without_media)
                return True, "sent_without_logo"
            except Exception as second_exc:
                combined = (
                    f"Media send failed: {_friendly_twilio_error(str(first_exc))}; "
                    f"SMS fallback failed: {_friendly_twilio_error(str(second_exc))}"
                )
                return False, combined

        return False, _friendly_twilio_error(str(first_exc))


def send_emergency_sms_to_donors(
    donors: List[Dict],
    blood_group: str,
    requester_name: str = "A patient",
    custom_message: str = "",
) -> Dict:
    """Send emergency SMS to a donor list and return delivery summary."""
    sent_count = 0
    failed_count = 0
    failures = []

    app_name = (os.getenv("NOTIFICATION_APP_NAME", "BloodLinks") or "BloodLinks").strip()
    logo_url = (os.getenv("NOTIFICATION_LOGO_URL", "") or "").strip()

    base_text = (
        f"{app_name} EMERGENCY: {requester_name} needs {blood_group} blood urgently nearby. "
        "Please respond if you can donate now."
    )

    if _is_http_url(logo_url):
        base_text = f"{base_text} Logo: {logo_url}"

    message_text = f"{base_text} {custom_message}".strip()

    for donor in donors:
        normalized_phone = _normalize_phone_number(donor.get("phone", ""))

        if not _is_valid_e164_phone(normalized_phone):
            failed_count += 1
            failures.append(
                {
                    "name": donor.get("name", "Unknown"),
                    "phone": normalized_phone,
                    "reason": "Invalid recipient phone number format",
                }
            )
            continue

        ok, info = _send_sms_twilio(normalized_phone, message_text, logo_url=logo_url)
        if ok:
            sent_count += 1
        else:
            failed_count += 1
            failures.append(
                {
                    "name": donor.get("name", "Unknown"),
                    "phone": normalized_phone,
                    "reason": info,
                }
            )

    return {
        "sent": sent_count,
        "failed": failed_count,
        "failures": failures,
    }

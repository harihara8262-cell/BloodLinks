"""
Password hashing helpers
"""

import hashlib
import secrets


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    """Hash password using PBKDF2-SHA256 and return (hash_hex, salt_hex)."""
    salt_hex = salt or secrets.token_hex(16)
    salt_bytes = bytes.fromhex(salt_hex)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 120000)
    return digest.hex(), salt_hex


def verify_password(password: str, expected_hash: str, salt: str) -> bool:
    """Verify a plain password against stored hash and salt."""
    computed_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(computed_hash, expected_hash)
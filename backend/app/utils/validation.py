"""Validation utilities for Signal Console."""
import re
from typing import Optional


BANK_NAME_PATTERN = re.compile(r'^[a-zA-Z0-9_-]+$')
BANK_NAME_MAX_LENGTH = 100
BANK_DESCRIPTION_MAX_LENGTH = 500


def validate_bank_name(name: str) -> Optional[str]:
    """Validate a bank name. Returns error message if invalid, None if valid."""
    if not name:
        return "Bank name is required"
    if len(name) > BANK_NAME_MAX_LENGTH:
        return f"Bank name must be at most {BANK_NAME_MAX_LENGTH} characters"
    if not BANK_NAME_PATTERN.match(name):
        return "Bank name can only contain alphanumeric characters, underscores, and hyphens"
    return None


def validate_bank_description(description: Optional[str]) -> Optional[str]:
    """Validate a bank description. Returns error message if invalid, None if valid."""
    if description is not None and len(description) > BANK_DESCRIPTION_MAX_LENGTH:
        return f"Description must be at most {BANK_DESCRIPTION_MAX_LENGTH} characters"
    return None


def sanitize_bank_name(name: str) -> str:
    """Sanitize a bank name by removing invalid characters."""
    return re.sub(r'[^a-zA-Z0-9_-]', '', name)


def truncate_string(s: str, max_length: int, suffix: str = "...") -> str:
    """Truncate a string to max_length, adding suffix if truncated."""
    if len(s) <= max_length:
        return s
    return s[:max_length - len(suffix)] + suffix
"""Datetime utilities for Signal Console."""
from datetime import datetime, timezone
from typing import Optional


def utc_now() -> datetime:
    """Get current UTC datetime with timezone info."""
    return datetime.now(timezone.utc)


def format_iso(dt: datetime) -> str:
    """Format datetime as ISO 8601 string."""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def parse_iso(iso_string: str) -> Optional[datetime]:
    """Parse ISO 8601 string to datetime."""
    try:
        return datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
    except (ValueError, AttributeError):
        return None


def ensure_utc(dt: datetime) -> datetime:
    """Ensure datetime has UTC timezone."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def datetime_to_timestamp(dt: datetime) -> int:
    """Convert datetime to Unix timestamp."""
    return int(ensure_utc(dt).timestamp())


def timestamp_to_datetime(ts: int) -> datetime:
    """Convert Unix timestamp to UTC datetime."""
    return datetime.fromtimestamp(ts, tz=timezone.utc)
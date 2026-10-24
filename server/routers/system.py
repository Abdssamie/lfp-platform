"""System health and status endpoints."""

from typing import Dict
from fastapi import APIRouter

router = APIRouter(tags=["System"])


@router.get("/api/health")
def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy", "service": "lfp-platform-fastapi"}

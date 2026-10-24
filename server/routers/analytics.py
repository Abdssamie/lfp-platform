"""Defect screening and statistical process control (SPC) endpoints."""

from fastapi import APIRouter
from server.schemas import ScreeningScatterResponse, SPCSummaryResponse
from server.services.batch_service import (
    get_screening_scatter as fetch_screening_scatter,
    get_spc_summary as fetch_spc_summary,
)

router = APIRouter(tags=["Analytics"])


@router.get("/api/screening/scatter", response_model=ScreeningScatterResponse)
def get_screening_scatter() -> ScreeningScatterResponse:
    """Retrieve K-value vs DCIR defect screening coordinates for all cells in batch."""
    return fetch_screening_scatter()


@router.get("/api/spc/summary", response_model=SPCSummaryResponse)
def get_spc_summary() -> SPCSummaryResponse:
    """Retrieve Shewhart X-bar control chart parameters and channel points."""
    return fetch_spc_summary()

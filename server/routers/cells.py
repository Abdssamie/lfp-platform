"""Individual cell telemetry and curve endpoints."""

from fastapi import APIRouter
from server.schemas import CellDetailResponse
from server.services.batch_service import get_cell_detail as fetch_cell_detail

router = APIRouter(tags=["Cell Telemetry"])


@router.get("/api/cells/{cell_id}", response_model=CellDetailResponse)
def get_cell_detail(cell_id: str) -> CellDetailResponse:
    """Retrieve high-fidelity telemetry, V-Q curves, and dQ/dV phase peaks for an individual cell."""
    return fetch_cell_detail(cell_id)

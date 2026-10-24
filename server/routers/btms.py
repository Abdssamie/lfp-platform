"""Battery Thermal Management System (BTMS) simulation endpoints."""

from fastapi import APIRouter
from server.schemas import BTMSRequest, BTMSResponse
from server.services.btms_service import run_btms_simulation

router = APIRouter(tags=["BTMS Thermal Simulator"])


@router.post("/api/btms/simulate", response_model=BTMSResponse)
def simulate_btms(request: BTMSRequest) -> BTMSResponse:
    """Execute coupled 1D two-state electrochemical-thermal BTMS cooling simulation."""
    return run_btms_simulation(request)

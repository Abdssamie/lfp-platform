"""Batch operations and cycler dataset ingestion endpoints."""

from fastapi import APIRouter
from server.schemas import BatchRunRequest, BatchSummaryResponse
from server.services.batch_service import (
    build_batch_summary,
    get_or_create_active_batch,
    load_neware_batch,
    load_novonix_batch,
    run_batch as execute_run_batch,
)

router = APIRouter(tags=["Batch Operations"])


@router.get("/api/batch/current", response_model=BatchSummaryResponse)
def get_current_batch() -> BatchSummaryResponse:
    """Retrieve active lot QC summary and cell evaluations."""
    active = get_or_create_active_batch()
    return build_batch_summary(active)


@router.post("/api/batch/run", response_model=BatchSummaryResponse)
def run_batch(request: BatchRunRequest) -> BatchSummaryResponse:
    """Trigger automated formation batch simulation and quality analytics."""
    return execute_run_batch(request)


@router.post("/api/batch/load-novonix", response_model=BatchSummaryResponse)
def load_novonix_dataset() -> BatchSummaryResponse:
    """Parse and process the 114MB SINTEF Novonix UHPC cycler dataset."""
    return load_novonix_batch()


@router.post("/api/batch/load-neware", response_model=BatchSummaryResponse)
def load_neware_dataset() -> BatchSummaryResponse:
    """Parse and process the SINTEF Neware cycler dataset into the active batch inspection cabinet."""
    return load_neware_batch()

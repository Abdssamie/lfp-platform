"""FastAPI Server for LFP Battery Formation & Aging SPC Analytics Platform.

Provides high-throughput cycler telemetry ingestion, Savitzky-Golay dQ/dV analytics,
K-value / DCIR defect screening, and automotive IATF 16949 SPC endpoints.
"""

import os
from contextlib import asynccontextmanager
from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server import state
from server.routers import (
    analytics_router,
    batch_router,
    btms_router,
    cells_router,
    datasets_router,
    system_router,
)
from server.services.batch_service import (
    build_batch_summary as _build_batch_summary,
    format_cell_evaluation as _format_cell_evaluation,
    format_spc_summary as _format_spc_summary,
    get_or_create_active_batch,
    run_batch_internal as _run_batch_internal,
)
from server.services.btms_service import prewarm_btms_cache
from server.services.lfp_service import load_lfp_data as _load_lfp_data
from server.services.neware_service import load_neware_data as _load_neware_data
from server.services.novonix_service import load_novonix_data as _load_novonix_data
from server.utils import find_dataset_file as _find_dataset_file


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize default formation batch and pre-load Novonix, Neware & LG Chem LFP datasets on startup."""
    get_or_create_active_batch()
    try:
        _load_lfp_data()
    except Exception as e:
        print(f"LFP preload note: {e}")
    try:
        _load_neware_data()
    except Exception as e:
        print(f"Neware preload note: {e}")
    try:
        _load_novonix_data()
    except Exception as e:
        print(f"Novonix preload note: {e}")
    try:
        prewarm_btms_cache()
    except Exception as e:
        print(f"BTMS prewarm note: {e}")
    yield


app = FastAPI(
    title="LFP Battery Formation & Aging SPC API",
    description="High-Throughput Cycler Telemetry, dQ/dV, Defect Screening & IATF 16949 SPC Backend",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins_env = os.getenv("CORS_ORIGINS", "*")
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://lfp.moondesk.tech",
    "https://api.lfp.moondesk.tech",
]
if cors_origins_env and cors_origins_env != "*":
    for origin in cors_origins_env.split(","):
        trimmed = origin.strip()
        if trimmed and trimmed not in allowed_origins:
            allowed_origins.append(trimmed)

# Enable CORS for frontend, cross-subdomain API calls, and Dokploy deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if cors_origins_env == "*" else allowed_origins,
    allow_origin_regex=r"https://.*\.moondesk\.tech|http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoint routers
app.include_router(system_router)
app.include_router(batch_router)
app.include_router(cells_router)
app.include_router(analytics_router)
app.include_router(datasets_router)
app.include_router(btms_router)


def __getattr__(name: str) -> Any:
    """Backwards-compatibility accessor for legacy module-level variables."""
    if name == "_ACTIVE_BATCH":
        return state.active_batch
    if name == "_NOVONIX_CACHE":
        return state.novonix_cache
    if name == "_NEWARE_CACHE":
        return state.neware_cache
    if name == "_LFP_CACHE":
        return state.lfp_cache
    raise AttributeError(f"module '{__name__}' has no attribute '{name}'")

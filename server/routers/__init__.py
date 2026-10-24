"""Routers package for API endpoints."""

from server.routers.analytics import router as analytics_router
from server.routers.batch import router as batch_router
from server.routers.btms import router as btms_router
from server.routers.cells import router as cells_router
from server.routers.datasets import router as datasets_router
from server.routers.system import router as system_router

__all__ = [
    "analytics_router",
    "batch_router",
    "btms_router",
    "cells_router",
    "datasets_router",
    "system_router",
]

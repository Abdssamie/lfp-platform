"""In-memory state and dataset cache management."""

from typing import Optional
from lfp_platform.pipeline import BatchAnalysisResult
from server.schemas import (
    BTMSResponse,
    LfpDatasetResponse,
    NewareDatasetResponse,
    NovonixDatasetResponse,
)

# In-memory storage for active cycler batch analysis and dataset caches
active_batch: Optional[BatchAnalysisResult] = None
novonix_cache: Optional[NovonixDatasetResponse] = None
neware_cache: Optional[NewareDatasetResponse] = None
lfp_cache: Optional[LfpDatasetResponse] = None
btms_cache: Optional[BTMSResponse] = None

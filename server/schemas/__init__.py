"""Pydantic schemas for the LFP Battery Formation & Aging SPC API."""

from server.schemas.batch import (
    BatchRunRequest,
    BatchSummaryResponse,
    CellEvaluationSchema,
    CellGradeEnum,
    MicroShortAlertSchema,
    ScreeningScatterPoint,
    ScreeningScatterResponse,
    SPCMetricSummarySchema,
    SPCPositionPoint,
    SPCSummaryResponse,
)
from server.schemas.btms import (
    BTMSRequest,
    BTMSResponse,
    BTMSSimulationPoint,
)
from server.schemas.cell import (
    CellDetailResponse,
    DQDVPeakSchema,
    DQDVPhaseCurve,
    TelemetryPoint,
    VQCurvePoint,
)
from server.schemas.lfp import (
    LfpDatasetResponse,
    LfpDQDVResponse,
    LfpDriveProfilePoint,
    LfpGittCurvePoint,
    LfpGittPoint,
    LfpMetadataSchema,
    LfpStepSummary,
    LfpTelemetryPoint,
    LfpVQPoint,
)
from server.schemas.neware import (
    NewareDatasetResponse,
    NewareDQDVResponse,
    NewareMetadataSchema,
    NewareRateCurvePoint,
    NewareRateRetentionPoint,
    NewareStepSummary,
    NewareTelemetryPoint,
)
from server.schemas.novonix import (
    NovonixDatasetResponse,
    NovonixDCIRPulse,
    NovonixDQDVResponse,
    NovonixMetadataSchema,
    NovonixStepSummary,
    NovonixTelemetryPoint,
    NovonixVQPoint,
)

__all__ = [
    # Batch & SPC
    "CellGradeEnum",
    "BatchRunRequest",
    "CellEvaluationSchema",
    "SPCMetricSummarySchema",
    "MicroShortAlertSchema",
    "BatchSummaryResponse",
    "ScreeningScatterPoint",
    "ScreeningScatterResponse",
    "SPCPositionPoint",
    "SPCSummaryResponse",
    # Cell details
    "TelemetryPoint",
    "VQCurvePoint",
    "DQDVPeakSchema",
    "DQDVPhaseCurve",
    "CellDetailResponse",
    # BTMS
    "BTMSRequest",
    "BTMSSimulationPoint",
    "BTMSResponse",
    # Novonix
    "NovonixMetadataSchema",
    "NovonixTelemetryPoint",
    "NovonixVQPoint",
    "NovonixDQDVResponse",
    "NovonixDCIRPulse",
    "NovonixStepSummary",
    "NovonixDatasetResponse",
    # Neware
    "NewareMetadataSchema",
    "NewareTelemetryPoint",
    "NewareRateCurvePoint",
    "NewareDQDVResponse",
    "NewareRateRetentionPoint",
    "NewareStepSummary",
    "NewareDatasetResponse",
    # LFP
    "LfpMetadataSchema",
    "LfpTelemetryPoint",
    "LfpVQPoint",
    "LfpDQDVResponse",
    "LfpStepSummary",
    "LfpGittPoint",
    "LfpGittCurvePoint",
    "LfpDriveProfilePoint",
    "LfpDatasetResponse",
]

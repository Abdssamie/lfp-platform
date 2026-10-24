"""Reference cycler datasets (LG Chem LFP, Novonix UHPC, Neware BTS) endpoints."""

from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from server.schemas import (
    LfpDatasetResponse,
    NewareDatasetResponse,
    NovonixDatasetResponse,
)
from server.services.lfp_service import load_lfp_data
from server.services.neware_service import load_neware_data
from server.services.novonix_service import load_novonix_data

router = APIRouter()

RAW_FILES = {
    "cc_c12": {
        "path": Path("data/lfp_lg_chem_csv/const_current/cc_0_08.csv"),
        "filename": "LG_Chem_LFP_50Ah_CC_0_08C_FullCycle.csv",
    },
    "cc_c6": {
        "path": Path("data/lfp_lg_chem_csv/const_current/cc_0_17.csv"),
        "filename": "LG_Chem_LFP_50Ah_CC_0_17C_Benchmark.csv",
    },
    "gitt_033c": {
        "path": Path("data/lfp_lg_chem_csv/gitt/gitt_0_33C.csv"),
        "filename": "LG_Chem_LFP_50Ah_GITT_0_33C_Titration.csv",
    },
    "profile_1": {
        "path": Path("data/lfp_lg_chem_csv/real_world_profiles/profile_1.csv"),
        "filename": "LG_Chem_LFP_50Ah_EV_Dynamic_Drive_Profile_1.csv",
    },
}


@router.get("/api/lfp/dataset", response_model=LfpDatasetResponse, tags=["LG Chem LFP"])
def get_lfp_dataset() -> LfpDatasetResponse:
    """Retrieve full analysis of true LG Chem 50Ah LiFePO4 / Graphite cell dataset: telemetry, 3.42V V-Q curves, dQ/dV phase peaks, and protocol steps."""
    return load_lfp_data()


@router.get("/api/lfp/raw/{file_key}", tags=["LG Chem LFP"])
def download_lfp_raw_file(file_key: str):
    """Download authentic raw cycler test bench CSV files (C/12, C/6, GITT 0.33C, EV Dynamic Drive)."""
    if file_key not in RAW_FILES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fichier brut '{file_key}' non trouvé. Choix possibles: {list(RAW_FILES.keys())}",
        )
    info = RAW_FILES[file_key]
    path = info["path"]
    if not path.exists():
        alt_path = Path("/home/abdssamie/Projects/lfp-platform") / path
        if alt_path.exists():
            path = alt_path
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Fichier de données {info['filename']} introuvable sur le disque.",
            )
    return FileResponse(
        path=path,
        media_type="text/csv",
        filename=info["filename"],
    )


@router.get("/api/novonix/dataset", response_model=NovonixDatasetResponse, tags=["Novonix UHPC"])
def get_novonix_dataset() -> NovonixDatasetResponse:
    """Retrieve full analysis of 114MB SINTEF Novonix UHPC dataset: telemetry, 0.1C V-Q, dQ/dV, DCIR pulses, and protocol steps."""
    return load_novonix_data()


@router.get("/api/neware/dataset", response_model=NewareDatasetResponse, tags=["Neware BTS"])
def get_neware_dataset() -> NewareDatasetResponse:
    """Retrieve full analysis of SINTEF Neware Rate Capability dataset (0.1C to 9C) with Time Bug resolution."""
    return load_neware_data()


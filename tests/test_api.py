"""Tests for the FastAPI formation QC and SPC analytics service."""

import pytest
from fastapi.testclient import TestClient
from server.main import app

client = TestClient(app)


def test_health():
    """Verify health endpoint."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_get_current_batch():
    """Verify current batch summary endpoint."""
    response = client.get("/api/batch/current")
    assert response.status_code == 200
    data = response.json()
    assert "batch_id" in data
    assert data["total_cells"] == 24
    assert len(data["evaluations"]) == 24
    assert "spc_capacity" in data
    assert "yield_pct" in data
    assert "micro_short_alert" in data


def test_run_batch():
    """Verify triggering a new batch run with custom parameters."""
    payload = {
        "batch_id": "BATCH_TEST_CUSTOM",
        "num_cells": 12,
        "micro_short_rate": 0.0,
        "high_dcir_rate": 0.0,
        "low_capacity_rate": 0.0,
    }
    response = client.post("/api/batch/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["batch_id"] == "BATCH_TEST_CUSTOM"
    assert data["total_cells"] == 12
    assert len(data["evaluations"]) == 12


def test_get_cell_detail():
    """Verify retrieving detailed cell telemetry and curves."""
    current = client.get("/api/batch/current").json()
    cell_id = current["evaluations"][0]["cell_id"]

    response = client.get(f"/api/cells/{cell_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["evaluation"]["cell_id"] == cell_id
    assert len(data["telemetry"]) > 0
    assert len(data["vq_curve"]) > 0
    assert data["dqdv_curve"] is not None
    assert len(data["dqdv_curve"]["v_grid"]) > 0


def test_get_screening_scatter():
    """Verify screening scatter endpoint."""
    response = client.get("/api/screening/scatter")
    assert response.status_code == 200
    data = response.json()
    assert data["k_threshold_mv_day"] == 0.50
    assert data["dcir_threshold_mohm"] == 35.0
    assert len(data["cells"]) > 0


def test_get_spc_summary():
    """Verify SPC summary and data points."""
    response = client.get("/api/spc/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["metric_name"] == "Formation Capacity"
    assert data["usl"] == 3.35
    assert data["lsl"] == 3.05
    assert len(data["data_points"]) > 0


def test_get_novonix_dataset():
    """Verify loading real Novonix UHPC 114MB dataset."""
    response = client.get("/api/novonix/dataset")
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["cell_id"] == "SLPBA842124HV-06"
    assert data["metadata"]["total_steps"] == 274
    assert len(data["telemetry"]) > 0
    assert len(data["vq_curve"]) > 0
    assert len(data["dcir_pulses"]) == 114
    assert len(data["steps"]) == 274



def test_get_neware_dataset():
    """Verify loading real SINTEF Neware Rate Capability dataset with time bug fix."""
    response = client.get("/api/neware/dataset")
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["cell_id"] == "SINTEF__SLPBA842124HV"
    assert data["metadata"]["time_bug_resolved"] is True
    assert len(data["telemetry"]) > 0
    assert len(data["rate_curves"]) > 0
    assert len(data["rate_retention"]) == 5
    assert len(data["steps"]) == 20


def test_get_lfp_dataset():
    """Verify loading true LG Chem 50Ah LiFePO4 (LFP) / Graphite dataset."""
    response = client.get("/api/lfp/dataset")
    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["cell_id"] == "LG_Chem__LiFePO4_50Ah"
    assert data["metadata"]["positive_electrode"] == "LiFePO4"
    assert data["metadata"]["nominal_capacity_ah"] == 49.0
    assert data["metadata"]["nominal_voltage_v"] == 3.2
    assert len(data["telemetry"]) > 0
    assert len(data["vq_curves"]) > 0
    assert data["dqdv_curve"]["charge_peak_v"] > 3.30
    assert data["dqdv_curve"]["discharge_peak_v"] > 3.28
    assert len(data["steps"]) >= 4
    assert len(data["gitt_pulses"]) > 0
    assert len(data["drive_profile"]) > 0


def test_download_lfp_raw_file():
    """Verify downloading raw cycler test bench CSV datasets."""
    response = client.get("/api/lfp/raw/cc_c12")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert "LG_Chem_LFP_50Ah_CC_0_08C_FullCycle.csv" in response.headers.get("content-disposition", "")
    assert len(response.content) > 1000

    # 404 for invalid key
    err_res = client.get("/api/lfp/raw/invalid_key")
    assert err_res.status_code == 404



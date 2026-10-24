"""Tests for physics-grounded Battery Thermal Management System (BTMS) simulation."""

import pytest
from fastapi.testclient import TestClient

from lfp_platform.analytics.btms import simulate_btms_cooling
from server.main import app

client = TestClient(app)


def test_standard_1c_charge_compliance():
    """Verify standard 1C charge at 25°C maintains a compliant thermal gradient (< 1.5°C)."""
    res = simulate_btms_cooling(
        c_rate=1.0,
        ambient_temp_c=25.0,
        coolant_flow_lpm=4.0,
        duration_s=1200.0,
        cell_capacity_ah=50.0,
    )

    assert res.max_thermal_gradient_c < 1.5
    assert res.max_surface_temp_c < 45.0
    assert res.is_compliant is True
    assert "COMPLIANT" in res.summary_verdict
    assert len(res.time_series) == 100

    first_pt = res.time_series[0]
    last_pt = res.time_series[-1]
    assert first_pt["time_s"] == 0.0
    assert last_pt["time_s"] == 1200.0
    assert last_pt["soc"] > first_pt["soc"]


def test_3c_fast_charge_low_flow_hazard():
    """Verify 3C fast charge at 40°C with low flow (1 L/min) exceeds 3°C thermal gradient."""
    res = simulate_btms_cooling(
        c_rate=3.0,
        ambient_temp_c=40.0,
        coolant_flow_lpm=1.0,
        duration_s=1200.0,
        cell_capacity_ah=50.0,
    )

    # Low flow (1 LPM) cannot extract heat, gradient exceeds 3°C threshold
    assert res.max_thermal_gradient_c > 3.0
    assert res.is_compliant is False
    assert "NON-COMPLIANT HAZARD" in res.summary_verdict


def test_3c_fast_charge_high_flow_recovery():
    """Verify 3C fast charge at 40°C with high flow (8 L/min) recovers compliance."""
    res = simulate_btms_cooling(
        c_rate=3.0,
        ambient_temp_c=40.0,
        coolant_flow_lpm=8.0,
        duration_s=1200.0,
        cell_capacity_ah=50.0,
    )

    # High flow (8 LPM) restores thermal boundary layer and recovers compliance
    assert res.max_thermal_gradient_c < 3.0
    assert res.max_surface_temp_c < 45.0
    assert res.is_compliant is True
    assert "COMPLIANT" in res.summary_verdict


def test_api_btms_endpoint():
    """Verify FastAPI POST /api/btms/simulate endpoint."""
    payload = {
        "c_rate": 2.0,
        "ambient_temp_c": 30.0,
        "coolant_flow_lpm": 5.0,
        "cell_capacity_ah": 50.0,
        "duration_s": 900.0,
    }
    response = client.post("/api/btms/simulate", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "params" in data
    assert data["params"]["c_rate"] == 2.0
    assert "max_core_temp_c" in data
    assert "max_surface_temp_c" in data
    assert "max_thermal_gradient_c" in data
    assert "is_compliant" in data
    assert "summary_verdict" in data
    assert len(data["time_series"]) == 100
    assert data["time_series"][0]["q_joule_w"] > 0.0

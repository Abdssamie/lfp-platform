"""Precision Plotly chart builders for LFP Battery Formation & Aging Instrumentation Console."""

import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from typing import Dict, List, Tuple
from lfp_platform.models import CellEvaluation, CellGrade, SPCMetricSummary, DQDVPeak


INSTRUMENT_LAYOUT = {
    "paper_bgcolor": "#0e1117",
    "plot_bgcolor": "#131720",
    "font": {"color": "#cbd5e1", "family": "Inter, -apple-system, system-ui, sans-serif", "size": 11},
    "xaxis": {
        "gridcolor": "#1e2634",
        "zerolinecolor": "#283446",
        "tickfont": {"color": "#64748b", "size": 10},
        "title_font": {"color": "#94a3b8", "size": 11},
    },
    "yaxis": {
        "gridcolor": "#1e2634",
        "zerolinecolor": "#283446",
        "tickfont": {"color": "#64748b", "size": 10},
        "title_font": {"color": "#94a3b8", "size": 11},
    },

    "margin": {"l": 55, "r": 35, "t": 35, "b": 40},
}


def create_telemetry_fig(df_cell) -> go.Figure:
    """Dual-axis time-series chart of cycler Voltage and Current with phase bands."""
    t = df_cell["timestamp_s"].to_numpy() / 60.0  # minutes
    v = df_cell["voltage_v"].to_numpy()
    i = df_cell["current_a"].to_numpy()

    fig = make_subplots(specs=[[{"secondary_y": True}]])

    # Voltage trace (Lithium Cyan)
    fig.add_trace(
        go.Scatter(
            x=t,
            y=v,
            name="Terminal Voltage (V)",
            line=dict(color="#38bdf8", width=2.0),
            hovertemplate="Time: %{x:.1f} min<br>Voltage: %{y:.4f} V<extra></extra>",
        ),
        secondary_y=False,
    )

    # Current trace (Pulse Amber)
    fig.add_trace(
        go.Scatter(
            x=t,
            y=i,
            name="Current (A)",
            line=dict(color="#f59e0b", width=1.5, dash="dot"),
            hovertemplate="Time: %{x:.1f} min<br>Current: %{y:.2f} A<extra></extra>",
        ),
        secondary_y=True,
    )

    fig.update_layout(
        **INSTRUMENT_LAYOUT,
        title=dict(
            text="Cycler Telemetry Profile (Voltage & Current vs. Time)",
            font=dict(size=13, color="#f1f5f9"),
            x=0.01,
        ),
        hovermode="x unified",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    fig.update_xaxes(title_text="Cycle Elapsed Time (min)")
    fig.update_yaxes(title_text="Voltage (V)", secondary_y=False, range=[2.35, 3.75])
    fig.update_yaxes(title_text="Current (A)", secondary_y=True, range=[-12.0, 3.0])

    return fig


def create_vq_fig(df_cell) -> go.Figure:
    """Voltage vs. Capacity curve showing the LFP 3.42V two-phase plateau."""
    fig = go.Figure()

    # CC Charge
    df_chg = df_cell.filter(df_cell["step_type"].is_in(["CC_CHG", "CV_CHG"]))
    if not df_chg.is_empty():
        fig.add_trace(
            go.Scatter(
                x=df_chg["capacity_ah"].to_numpy(),
                y=df_chg["voltage_v"].to_numpy(),
                name="Charge (C/3 + CV)",
                line=dict(color="#00e5a3", width=2.2),
                hovertemplate="Capacity: %{x:.3f} Ah<br>Voltage: %{y:.3f} V<extra></extra>",
            )
        )

    # CC Discharge
    df_dchg = df_cell.filter(df_cell["step_type"] == "CC_DCHG")
    if not df_dchg.is_empty():
        fig.add_trace(
            go.Scatter(
                x=df_dchg["capacity_ah"].to_numpy(),
                y=df_dchg["voltage_v"].to_numpy(),
                name="Discharge (1.0A)",
                line=dict(color="#f43f5e", width=2.2),
                hovertemplate="Discharge Q: %{x:.3f} Ah<br>Voltage: %{y:.3f} V<extra></extra>",
            )
        )

    # Reference thermodynamic two-phase line
    fig.add_hline(
        y=3.42,
        line_dash="dot",
        line_color="#475569",
        annotation_text="LiFePO4 ↔ FePO4 Two-Phase Equilibrium (3.42V)",
        annotation_position="bottom right",
        annotation_font=dict(size=9, color="#64748b"),
    )

    fig.update_layout(
        **INSTRUMENT_LAYOUT,
        title=dict(
            text="Voltage vs. Capacity Characteristic (Plateau Phase Equilibrium)",
            font=dict(size=13, color="#f1f5f9"),
            x=0.01,
        ),
        xaxis_title="Accumulated Capacity (Ah)",
        yaxis_title="Potential (V)",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    return fig


def create_dqdv_fig(v_grid: np.ndarray, dqdv_smooth: np.ndarray, peaks: List[DQDVPeak], cell_id: str) -> go.Figure:
    """Differential Capacity Analysis (dQ/dV) plot with identified phase peaks."""
    fig = go.Figure()

    if len(v_grid) > 0 and len(dqdv_smooth) > 0:
        fig.add_trace(
            go.Scatter(
                x=v_grid,
                y=dqdv_smooth,
                name="Savitzky-Golay dQ/dV",
                line=dict(color="#818cf8", width=2.4),
                fill="tozeroy",
                fillcolor="rgba(129, 140, 248, 0.12)",
                hovertemplate="Voltage: %{x:.3f} V<br>dQ/dV: %{y:.2f} Ah/V<extra></extra>",
            )
        )

        for p in peaks:
            fig.add_trace(
                go.Scatter(
                    x=[p.peak_voltage_v],
                    y=[p.peak_height],
                    mode="markers+text",
                    name=f"Phase Peak ({p.peak_voltage_v:.3f}V)",
                    text=[f"{p.peak_voltage_v:.3f} V | LLI: {p.area:.2f}"],
                    textposition="top center",
                    textfont=dict(size=9, color="#fbbf24"),
                    marker=dict(size=10, color="#fbbf24", symbol="diamond", line=dict(color="#ffffff", width=1)),
                    hovertemplate=f"Phase Transition: {p.phase_transition}<br>Peak Potential: {p.peak_voltage_v} V<br>Peak Height: {p.peak_height:.2f}<br>Active Lithium Area: {p.area:.3f}<extra></extra>",
                )
            )

    fig.update_layout(
        **INSTRUMENT_LAYOUT,
        title=dict(
            text=f"Differential Capacity dQ/dV Phase Fingerprint // {cell_id}",
            font=dict(size=13, color="#f1f5f9"),
            x=0.01,
        ),
        xaxis_title="Electrode Potential vs. Li/Li⁺ (V)",
        yaxis_title="Differential Capacity dQ/dV (Ah/V)",
        showlegend=False,
    )
    return fig


def create_screening_scatter_fig(evaluations: List[CellEvaluation]) -> go.Figure:
    """2D defect screening scatter plot: K-value (mV/day) vs DCIR (mOhm)."""
    fig = go.Figure()

    # Red danger zone background for micro-short risk (K >= 0.50 mV/day)
    max_dcir = max([e.dcir_mohm for e in evaluations] + [60.0]) + 5.0
    max_k = max([e.k_value_mv_day for e in evaluations] + [5.0]) + 0.5

    fig.add_shape(
        type="rect",
        x0=0,
        y0=0.50,
        x1=max_dcir,
        y1=max_k,
        fillcolor="rgba(244, 63, 94, 0.08)",
        line=dict(width=0),
        layer="below",
    )

    grades = {
        CellGrade.GRADE_A: ("#00e5a3", "circle", "Grade A (EV Pack Certified)"),
        CellGrade.GRADE_B_ESS: ("#f59e0b", "square", "Grade B (ESS Rerouted)"),
        CellGrade.SCRAP: ("#f43f5e", "x", "Scrap / Quarantine (Defect Hazard)"),
    }

    for grade, (color, symbol, label) in grades.items():
        sub = [e for e in evaluations if e.grade == grade]
        if sub:
            fig.add_trace(
                go.Scatter(
                    x=[e.dcir_mohm for e in sub],
                    y=[e.k_value_mv_day for e in sub],
                    mode="markers",
                    name=label,
                    marker=dict(color=color, symbol=symbol, size=9, line=dict(width=1, color="#1e2634")),
                    text=[f"Cell: {e.cell_id}<br>Channel: CH {e.channel_id:02d}<br>DCIR: {e.dcir_mohm:.1f} mΩ<br>K-value: {e.k_value_mv_day:.3f} mV/d<br>Grade: {e.grade.value}" for e in sub],
                    hovertemplate="%{text}<extra></extra>",
                )
            )

    fig.add_hline(
        y=0.50,
        line_dash="dash",
        line_color="#f43f5e",
        annotation_text="Micro-short Limit (K >= 0.50 mV/d)",
        annotation_position="top left",
        annotation_font=dict(size=9, color="#f43f5e"),
    )
    fig.add_vline(
        x=35.0,
        line_dash="dash",
        line_color="#f59e0b",
        annotation_text="DCIR Automotive Ceiling (35 mΩ)",
        annotation_position="top right",
        annotation_font=dict(size=9, color="#f59e0b"),
    )

    fig.update_layout(
        **INSTRUMENT_LAYOUT,
        title=dict(
            text="Defect Screening Map (Self-Discharge K-Value vs. Internal Resistance DCIR)",
            font=dict(size=13, color="#f1f5f9"),
            x=0.01,
        ),
        xaxis_title="DC Internal Resistance (mΩ)",
        yaxis_title="Self-Discharge Rate K = dV/dt (mV/day)",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    return fig


def create_spc_xbar_fig(evaluations: List[CellEvaluation], spc: SPCMetricSummary) -> go.Figure:
    """Shewhart X-bar control chart with UCL, LCL, and process center line."""
    fig = go.Figure()

    channels = [e.channel_id for e in evaluations]
    capacities = [e.actual_capacity_ah for e in evaluations]

    # Individual channel capacity points
    fig.add_trace(
        go.Scatter(
            x=channels,
            y=capacities,
            mode="lines+markers",
            name="Formation Capacity (Ah)",
            line=dict(color="#38bdf8", width=1.8),
            marker=dict(size=7, color="#38bdf8"),
            hovertemplate="Channel %{x:02d}: %{y:.4f} Ah<extra></extra>",
        )
    )

    # Process Mean (Center Line)
    fig.add_hline(
        y=spc.mean,
        line_color="#00e5a3",
        line_width=1.8,
        annotation_text=f"CL Mean = {spc.mean:.3f} Ah",
        annotation_position="bottom right",
        annotation_font=dict(size=9, color="#00e5a3"),
    )

    # Upper and Lower Control Limits (UCL / LCL at +/- 3 sigma)
    fig.add_hline(
        y=spc.ucl,
        line_dash="dash",
        line_color="#f43f5e",
        line_width=1.5,
        annotation_text=f"UCL {spc.ucl:.3f} Ah",
        annotation_position="top right",
        annotation_font=dict(size=9, color="#f43f5e"),
    )
    fig.add_hline(
        y=spc.lcl,
        line_dash="dash",
        line_color="#f43f5e",
        line_width=1.5,
        annotation_text=f"LCL {spc.lcl:.3f} Ah",
        annotation_position="bottom right",
        annotation_font=dict(size=9, color="#f43f5e"),
    )

    # Specification limits (USL / LSL)
    fig.add_hline(
        y=spc.usl,
        line_dash="dot",
        line_color="#475569",
        annotation_text=f"USL {spc.usl:.2f} Ah",
        annotation_position="top left",
        annotation_font=dict(size=9, color="#64748b"),
    )
    fig.add_hline(
        y=spc.lsl,
        line_dash="dot",
        line_color="#475569",
        annotation_text=f"LSL {spc.lsl:.2f} Ah",
        annotation_position="bottom left",
        annotation_font=dict(size=9, color="#64748b"),
    )

    fig.update_layout(
        **INSTRUMENT_LAYOUT,
        title=dict(
            text=f"Shewhart X-bar Quality Control Chart // IATF 16949 (Cpk = {spc.cpk:.2f})",
            font=dict(size=13, color="#f1f5f9"),
            x=0.01,
        ),
        xaxis_title="Cycler Channel Hardware Address",
        yaxis_title="Formation Discharge Capacity (Ah)",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=10, color="#94a3b8"),
        ),
    )
    return fig

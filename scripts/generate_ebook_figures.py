#!/usr/bin/env python3
"""
Generate publication-quality figures for the LFP Technology & Diagnostics Monograph.
Uses matplotlib and numpy to synthesize physical electrochemical models.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, FancyBboxPatch

# Set publication style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['DejaVu Sans', 'Arial', 'Helvetica'],
    'font.size': 10,
    'axes.labelsize': 11,
    'axes.titlesize': 12,
    'axes.titleweight': 'bold',
    'xtick.labelsize': 9.5,
    'ytick.labelsize': 9.5,
    'legend.fontsize': 9.5,
    'figure.titlesize': 13,
    'figure.titleweight': 'bold',
    'lines.linewidth': 2.0,
    'grid.alpha': 0.4,
    'grid.linestyle': '--',
})

OUTPUT_DIR = "docs/ebook/figures"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -----------------------------------------------------------------------------
# FIGURE 1: Thermodynamic Potential Balance & Gibbs Phase Rule
# -----------------------------------------------------------------------------
def generate_figure_1():
    print("Generating Figure 1: Thermodynamic Potential Balance...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.2), gridspec_kw={'width_ratios': [1.3, 1]})

    soc = np.linspace(0.01, 0.99, 500)

    # 1. Cathode potential (LFP flat plateau at ~3.425 V vs Li/Li+)
    v_cathode = 3.425 + 0.08 * (soc - 0.5)**5 + 0.12 * np.exp((soc - 0.98)*35) - 0.25 * np.exp(-soc * 35)

    # 2. Anode potential (Graphite stages: 0.21V, 0.13V, 0.08V vs Li/Li+)
    # Staging transition steps
    v_anode = (
        0.08 
        + 0.05 / (1 + np.exp((soc - 0.50) / 0.04))
        + 0.09 / (1 + np.exp((soc - 0.25) / 0.04))
        + 0.60 * np.exp(-soc * 25)
    )

    # 3. Full cell voltage
    v_cell = v_cathode - v_anode

    # Plot on ax1
    ax1.plot(soc * 100, v_cathode, color="#0284c7", label=r"Cathode: $\mathrm{LiFePO}_4$ ($E^0 \approx 3.425\,\mathrm{V}$)", lw=2.5)
    ax1.plot(soc * 100, v_anode, color="#ea580c", label=r"Anode: Graphite ($E_{\mathrm{anode}}$ staging)", lw=2.2)
    ax1.plot(soc * 100, v_cell, color="#0f172a", label=r"Full Cell: $V_{\mathrm{cell}} = V_{\mathrm{cathode}} - V_{\mathrm{anode}}$", lw=2.8)

    # Highlight flat plateau region
    ax1.axvspan(15, 85, color="#f0fdf4", alpha=0.8, zorder=0)
    ax1.text(50, 3.52, r"Gibbs Two-Phase Plateau ($F = C - P = 0$)" "\n" r"Cathode potential strictly pinned $\approx 3.425\,\mathrm{V}$",
             ha="center", va="center", color="#166534", fontsize=9.5, fontweight="bold",
             bbox=dict(boxstyle="round,pad=0.3", fc="#dcfce7", ec="#86efac", lw=1))

    # Annotate staging steps on anode
    ax1.annotate(r"Stage 4 $\to$ 3L" "\n" r"($\approx 0.21\,\mathrm{V}$)", xy=(18, 0.22), xytext=(8, 0.55),
                 arrowprops=dict(arrowstyle="->", color="#c2410c", lw=1.2), fontsize=8.5, color="#c2410c")
    ax1.annotate(r"Stage 3L $\to$ 2" "\n" r"($\approx 0.13\,\mathrm{V}$)", xy=(38, 0.13), xytext=(28, 0.40),
                 arrowprops=dict(arrowstyle="->", color="#c2410c", lw=1.2), fontsize=8.5, color="#c2410c")
    ax1.annotate(r"Stage 2 $\to$ 1 ($\mathrm{LiC}_6$)" "\n" r"($\approx 0.08\,\mathrm{V}$)", xy=(75, 0.08), xytext=(65, 0.32),
                 arrowprops=dict(arrowstyle="->", color="#c2410c", lw=1.2), fontsize=8.5, color="#c2410c")

    ax1.set_xlabel("State of Charge (SOC %)")
    ax1.set_ylabel(r"Electrode & Cell Potential vs. $\mathrm{Li/Li^+}$ (V)")
    ax1.set_title("Electrochemical Half-Cell Potentials vs. Full-Cell Voltage")
    ax1.set_xlim(0, 100)
    ax1.set_ylim(-0.05, 3.9)
    ax1.legend(loc="center left", bbox_to_anchor=(0.02, 0.58), frameon=True, facecolor="white", edgecolor="#cbd5e1")

    # Panel 2: Latent Heat / Two Phase Conceptual Model
    ax2.set_facecolor("#fafafa")
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.axis('off')

    # Draw phase equilibrium box
    box_phase = FancyBboxPatch((1.0, 5.2), 8.0, 4.0, boxstyle="round,pad=0.2",
                               fc="#f8fafc", ec="#0284c7", lw=1.5)
    ax2.add_patch(box_phase)
    ax2.text(5.0, 8.7, r"$\mathbf{LiFePO_4 \leftrightarrow FePO_4}$ Miscibility Gap", ha="center", fontsize=11, color="#0f172a")
    ax2.text(5.0, 8.0, r"Gibbs Phase Rule: $F = C - P + 1 = 2 - 2 + 0 = \mathbf{0}$", ha="center", fontsize=10, color="#0284c7", fontweight="bold")
    
    # Phase domains
    rect_triphylite = Rectangle((1.5, 5.7), 3.3, 1.8, facecolor="#bae6fd", edgecolor="#0284c7", lw=1.2)
    rect_heterosite = Rectangle((5.2, 5.7), 3.3, 1.8, facecolor="#fed7aa", edgecolor="#ea580c", lw=1.2)
    ax2.add_patch(rect_triphylite)
    ax2.add_patch(rect_heterosite)
    ax2.text(3.15, 6.7, r"$\alpha$-Triphylite" "\n" r"($\mathrm{Li_{1-\alpha}FePO_4}$)" "\n" r"$\mathrm{Fe^{2+}}$ state", ha="center", va="center", fontsize=8.5, color="#0369a1")
    ax2.text(6.85, 6.7, r"$\beta$-Heterosite" "\n" r"($\mathrm{Li_{\beta}FePO_4}$)" "\n" r"$\mathrm{Fe^{3+}}$ state", ha="center", va="center", fontsize=8.5, color="#c2410c")

    # Latent heat analogy box
    box_ice = FancyBboxPatch((1.0, 0.6), 8.0, 3.8, boxstyle="round,pad=0.2",
                             fc="#f0fdf4", ec="#16a34a", lw=1.5)
    ax2.add_patch(box_ice)
    ax2.text(5.0, 3.9, "Thermodynamic Analogy: Latent Heat of Ice", ha="center", fontsize=10.5, color="#14532d", fontweight="bold")
    ax2.text(5.0, 2.9, r"Adding heat to ice at $0^\circ\mathrm{C}$ melts crystal structure" "\n" r"without raising temperature ($T = \mathrm{constant}$).",
             ha="center", va="center", fontsize=9, color="#166534")
    ax2.text(5.0, 1.4, r"Injecting charge ($Q = \int I\,dt$) converts crystal phases" "\n" r"without altering chemical potential ($\mu_{\mathrm{Li}} = \mathrm{constant}$).",
             ha="center", va="center", fontsize=9, color="#14532d", fontweight="bold")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig1_thermodynamic_plateau.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

# -----------------------------------------------------------------------------
# FIGURE 2: Differential Capacity Analysis (dQ/dV) as Electrochemical MRI
# -----------------------------------------------------------------------------
def generate_figure_2():
    print("Generating Figure 2: dQ/dV Electrochemical MRI...")
    fig, ax = plt.subplots(figsize=(10, 5.5))

    v = np.linspace(3.05, 3.55, 1000)

    # 3 distinct graphite staging peaks reflected through flat LFP cathode
    # Peak 1: 3.24 V (Stage 4 -> 3L)
    # Peak 2: 3.31 V (Stage 3L -> 2)
    # Peak 3: 3.35 V (Stage 2 -> 1, LiC6 saturation)
    base = 0.5 + 0.2 * (v - 3.05)
    p1 = 3.2 * np.exp(-((v - 3.24) / 0.022)**2)
    p2 = 5.8 * np.exp(-((v - 3.31) / 0.018)**2)
    p3 = 8.5 * np.exp(-((v - 3.348) / 0.015)**2)
    dqdv = base + p1 + p2 + p3

    # Plot line
    ax.plot(v, dqdv, color="#1e293b", lw=2.8, label="LFP Full-Cell $dQ/dV$ Profile (C/20 rate)")
    ax.fill_between(v, dqdv, base, color="#0284c7", alpha=0.15)

    # Shaded peaks with individual colors
    ax.fill_between(v, base + p1, base, where=(v >= 3.20) & (v <= 3.28), color="#38bdf8", alpha=0.4)
    ax.fill_between(v, base + p2, base, where=(v >= 3.28) & (v <= 3.33), color="#818cf8", alpha=0.4)
    ax.fill_between(v, base + p3, base, where=(v >= 3.33) & (v <= 3.38), color="#c084fc", alpha=0.4)

    # Annotate peaks
    ax.annotate("Peak 1: Stage 4 $\\to$ 3L\nDilute $\\to \\mathrm{LiC_{30}}$\n($\\approx 3.24\\,\\mathrm{V}$)", 
                xy=(3.24, 3.8), xytext=(3.12, 6.5),
                arrowprops=dict(facecolor="#0284c7", edgecolor="#0284c7", arrowstyle="->", lw=1.5),
                fontsize=9, fontweight="bold", color="#0369a1",
                bbox=dict(boxstyle="round,pad=0.3", fc="#f0f9ff", ec="#bae6fd", lw=1))

    ax.annotate("Peak 2: Stage 3L $\\to$ 2\n$\\mathrm{LiC_{18} \\to LiC_{12}}$\n($\\approx 3.31\\,\\mathrm{V}$)", 
                xy=(3.31, 6.4), xytext=(3.24, 8.8),
                arrowprops=dict(facecolor="#4f46e5", edgecolor="#4f46e5", arrowstyle="->", lw=1.5),
                fontsize=9, fontweight="bold", color="#3730a3",
                bbox=dict(boxstyle="round,pad=0.3", fc="#eef2ff", ec="#c7d2fe", lw=1))

    ax.annotate("Peak 3: Stage 2 $\\to$ 1\n$\\mathrm{LiC_{12} \\to LiC_6}$ (Full)\n($\\approx 3.35\\,\\mathrm{V}$)", 
                xy=(3.348, 9.1), xytext=(3.39, 9.5),
                arrowprops=dict(facecolor="#7c3aed", edgecolor="#7c3aed", arrowstyle="->", lw=1.5),
                fontsize=9, fontweight="bold", color="#5b21b6",
                bbox=dict(boxstyle="round,pad=0.3", fc="#f5f3ff", ec="#ddd6fe", lw=1))

    # Mirror Proof Callout Box
    ax.text(3.40, 4.0, 
            r"$\mathbf{The\ Mathematical\ Mirror\ Proof:}$" "\n"
            r"$\frac{dV_{\mathrm{cathode}}}{dQ} \approx 0 \quad \Rightarrow \quad \frac{dQ}{dV_{\mathrm{cell}}} \approx -\frac{dQ}{dV_{\mathrm{anode}}}$" "\n\n"
            r"Because the $\mathrm{LiFePO}_4$ cathode potential" "\n"
            r"is flat, it functions as a motionless mirror." "\n"
            r"Every peak directly reflects graphite staging.",
            fontsize=9.5, color="#0f172a",
            bbox=dict(boxstyle="round,pad=0.5", fc="#f8fafc", ec="#64748b", lw=1.2))

    ax.set_xlabel("Full-Cell Terminal Voltage (V)")
    ax.set_ylabel("Differential Capacity $dQ/dV$ (Ah / V)")
    ax.set_title("Deconvoluting Graphite Intercalation via Full-Cell LFP $dQ/dV$ Analysis")
    ax.set_xlim(3.08, 3.52)
    ax.set_ylim(0, 11)
    ax.legend(loc="upper left", frameon=True, facecolor="white", edgecolor="#cbd5e1")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig2_dqdv_electrochemical_mri.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

# -----------------------------------------------------------------------------
# FIGURE 3: Degradation Modes Deconvolution on dQ/dV
# -----------------------------------------------------------------------------
def generate_figure_3():
    print("Generating Figure 3: Degradation Modes on dQ/dV...")
    fig, axes = plt.subplots(2, 2, figsize=(12, 9), sharex=True, sharey=True)

    v = np.linspace(3.10, 3.52, 600)
    base = 0.4 + 0.15 * (v - 3.10)

    # 1. Baseline Pristine
    p1_0 = 3.0 * np.exp(-((v - 3.24) / 0.022)**2)
    p2_0 = 5.5 * np.exp(-((v - 3.31) / 0.018)**2)
    p3_0 = 8.2 * np.exp(-((v - 3.348) / 0.015)**2)
    pristine = base + p1_0 + p2_0 + p3_0

    # Panel (a): Pristine Baseline
    ax_a = axes[0, 0]
    ax_a.plot(v, pristine, color="#0f172a", lw=2.5, label="Pristine State of Health (100% SOH)")
    ax_a.fill_between(v, pristine, base, color="#94a3b8", alpha=0.25)
    ax_a.set_title("(a) Pristine Cell Baseline", color="#0f172a")
    ax_a.text(3.12, 7.8, "• Balanced active materials\n• Full lithium inventory\n• Standard 3 graphite staging peaks",
              fontsize=9, bbox=dict(boxstyle="round,pad=0.3", fc="#f8fafc", ec="#cbd5e1"))
    ax_a.legend(loc="upper right", frameon=True, facecolor="white")

    # Panel (b): Loss of Lithium Inventory (LLI)
    ax_b = axes[0, 1]
    # LLI causes uniform peak shrinkage & horizontal translation due to SEI lithium consumption
    p1_lli = 2.1 * np.exp(-((v - 3.248) / 0.022)**2)
    p2_lli = 3.8 * np.exp(-((v - 3.318) / 0.018)**2)
    p3_lli = 5.6 * np.exp(-((v - 3.356) / 0.015)**2)
    lli = base + p1_lli + p2_lli + p3_lli
    ax_b.plot(v, pristine, color="#94a3b8", lw=1.5, ls="--", label="Pristine reference")
    ax_b.plot(v, lli, color="#ea580c", lw=2.5, label="Loss of Lithium Inventory (LLI)")
    ax_b.fill_between(v, lli, base, color="#ea580c", alpha=0.15)
    ax_b.annotate("Uniform peak height reduction\n& horizontal phase shift", xy=(3.356, 6.0), xytext=(3.34, 8.2),
                 arrowprops=dict(arrowstyle="->", color="#c2410c", lw=1.5), fontsize=8.5, color="#c2410c",
                 bbox=dict(boxstyle="round,pad=0.3", fc="#fff7ed", ec="#fed7aa"))
    ax_b.set_title("(b) Loss of Lithium Inventory (LLI)", color="#c2410c")
    ax_b.legend(loc="upper right", frameon=True, facecolor="white")

    # Panel (c): Loss of Active Anode Material (LAM_NE)
    ax_c = axes[1, 0]
    # LAM Anode contracts peak spacing and truncates Peak 3 (Stage 1 LiC6 cannot fit)
    p1_lam = 2.8 * np.exp(-((v - 3.245) / 0.021)**2)
    p2_lam = 5.0 * np.exp(-((v - 3.308) / 0.017)**2)
    p3_lam = 3.5 * np.exp(-((v - 3.340) / 0.014)**2)  # severely truncated
    lam_ne = base + p1_lam + p2_lam + p3_lam
    ax_c.plot(v, pristine, color="#94a3b8", lw=1.5, ls="--", label="Pristine reference")
    ax_c.plot(v, lam_ne, color="#16a34a", lw=2.5, label="Loss of Active Material Anode ($LAM_{NE}$)")
    ax_c.fill_between(v, lam_ne, base, color="#16a34a", alpha=0.15)
    ax_c.annotate("Stage 1 ($LiC_6$) truncated:\nGraphite sites exhausted", xy=(3.34, 4.0), xytext=(3.36, 6.5),
                 arrowprops=dict(arrowstyle="->", color="#15803d", lw=1.5), fontsize=8.5, color="#15803d",
                 bbox=dict(boxstyle="round,pad=0.3", fc="#f0fdf4", ec="#bbf7d0"))
    ax_c.set_title("(c) Loss of Active Anode Material ($LAM_{NE}$)", color="#15803d")
    ax_c.legend(loc="upper right", frameon=True, facecolor="white")

    # Panel (d): Cold Metallic Lithium Plating
    ax_d = axes[1, 1]
    # In discharge, lithium stripping forms a distinct rogue shoulder at onset (~3.40 V)
    p_strip = 3.2 * np.exp(-((v - 3.41) / 0.018)**2)
    plating = base + p1_0*0.75 + p2_0*0.75 + p3_0*0.75 + p_strip
    ax_d.plot(v, pristine, color="#94a3b8", lw=1.5, ls="--", label="Pristine reference")
    ax_d.plot(v, plating, color="#dc2626", lw=2.5, label="Discharge with Plated Lithium")
    ax_d.fill_between(v, plating, base, color="#dc2626", alpha=0.15)
    ax_d.annotate("Rogue Stripping Shoulder:\nZero-valent $Li^0$ dendrites\nstripping before intercalation", 
                 xy=(3.41, 4.3), xytext=(3.25, 7.5),
                 arrowprops=dict(arrowstyle="->", color="#b91c1c", lw=1.5), fontsize=8.5, color="#b91c1c",
                 bbox=dict(boxstyle="round,pad=0.3", fc="#fef2f2", ec="#fecaca"))
    ax_d.set_title("(d) Cold-Weather Metallic Lithium Plating ($Li^0$)", color="#b91c1c")
    ax_d.legend(loc="upper right", frameon=True, facecolor="white")

    for ax in axes.flat:
        ax.set_xlim(3.12, 3.48)
        ax.set_ylim(0, 11.2)

    axes[1, 0].set_xlabel("Full-Cell Terminal Voltage (V)")
    axes[1, 1].set_xlabel("Full-Cell Terminal Voltage (V)")
    axes[0, 0].set_ylabel("Differential Capacity $dQ/dV$ (Ah/V)")
    axes[1, 0].set_ylabel("Differential Capacity $dQ/dV$ (Ah/V)")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig3_degradation_modes_dqdv.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

# -----------------------------------------------------------------------------
# FIGURE 4: Electrochemical Hysteresis & Round-Trip Energy Losses
# -----------------------------------------------------------------------------
def generate_figure_4():
    print("Generating Figure 4: Electrochemical Hysteresis...")
    fig, ax = plt.subplots(figsize=(10, 5.5))

    v = np.linspace(3.15, 3.48, 800)
    base = 0.5 + 0.1 * (v - 3.15)

    # Charge peaks (higher voltage)
    p1_c = 2.8 * np.exp(-((v - 3.250) / 0.020)**2)
    p2_c = 5.4 * np.exp(-((v - 3.320) / 0.016)**2)
    p3_c = 8.6 * np.exp(-((v - 3.360) / 0.014)**2)
    charge = base + p1_c + p2_c + p3_c

    # Discharge peaks (lower voltage due to hysteresis + IR)
    # Hysteresis offset approx 28 mV
    shift = 0.028
    p1_d = 2.8 * np.exp(-((v - (3.250 - shift)) / 0.020)**2)
    p2_d = 5.4 * np.exp(-((v - (3.320 - shift)) / 0.016)**2)
    p3_d = 8.6 * np.exp(-((v - (3.360 - shift)) / 0.014)**2)
    discharge = base + p1_d + p2_d + p3_d

    # Plot
    ax.plot(v, charge, color="#dc2626", lw=2.5, label="Charge $dQ/dV$ Curve (Lithiation of Anode)")
    ax.plot(v, discharge, color="#0284c7", lw=2.5, label="Discharge $dQ/dV$ Curve (Delithiation of Anode)")

    # Fill hysteresis region between main peaks
    ax.fill_between(v, np.minimum(charge, discharge), base, color="#f1f5f9", alpha=0.5)

    # Measure hysteresis gap on Peak 3
    ax.annotate("", xy=(3.360 - shift, 8.8), xytext=(3.360, 8.8),
                arrowprops=dict(arrowstyle="<->", color="#0f172a", lw=2.0))
    ax.text(3.360 - shift/2, 9.3, r"$\mathbf{\Delta V_{\mathrm{hysteresis}} \approx 28\,\mathrm{mV}}$", 
            ha="center", fontsize=9.5, fontweight="bold", color="#0f172a",
            bbox=dict(boxstyle="round,pad=0.25", fc="#fef08a", ec="#eab308"))

    # Annotate on Peak 2 as well
    ax.annotate("", xy=(3.320 - shift, 5.6), xytext=(3.320, 5.6),
                arrowprops=dict(arrowstyle="<->", color="#0f172a", lw=1.6))
    ax.text(3.320 - shift/2, 6.0, r"$\Delta V_{\mathrm{hysteresis}}$", 
            ha="center", fontsize=8.5, color="#0f172a")

    # Explanation Callout
    ax.text(3.16, 5.5,
            r"$\mathbf{Physics\ of\ Electrochemical\ Hysteresis:}$" "\n\n"
            r"1. $\mathbf{Nucleation\ Barrier:}$ Phase transition requires" "\n"
            r"   overcoming interfacial lattice mismatch strains." "\n"
            r"2. $\mathbf{Kinetic\ Overpotentials:}$" "\n"
            r"   $V = V_{\mathrm{OCV}} \pm I R_0 \pm \eta_{\mathrm{ct}} \pm \eta_{\mathrm{diff}}$" "\n"
            r"3. $\mathbf{Thermal\ Dissipation:}$" "\n"
            r"   $E_{\mathrm{waste}} = \Delta V_{\mathrm{hysteresis}} \times Q_{\mathrm{cycle}}$",
            fontsize=9.5, color="#0f172a",
            bbox=dict(boxstyle="round,pad=0.4", fc="#f8fafc", ec="#94a3b8", lw=1.2))

    ax.set_xlabel("Full-Cell Terminal Voltage (V)")
    ax.set_ylabel("Differential Capacity $dQ/dV$ (Ah/V)")
    ax.set_title("Electrochemical Hysteresis Between Charge and Discharge in LFP/Graphite")
    ax.set_xlim(3.15, 3.45)
    ax.set_ylim(0, 11.2)
    ax.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#cbd5e1")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig4_electrochemical_hysteresis.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

# -----------------------------------------------------------------------------
# FIGURE 5: DC Internal Resistance (DCIR) Dynamics & The Bathtub Curve
# -----------------------------------------------------------------------------
def generate_figure_5():
    print("Generating Figure 5: DCIR Pulse Dynamics & Bathtub Curve...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.2))

    # Panel 1: HPPC Pulse Response Decomposition
    t = np.linspace(-2, 25, 1000)
    v_base = 3.320
    i_pulse = 20.0  # Amperes
    r0 = 0.007      # 7 mOhm
    r_ct = 0.005    # 5 mOhm
    tau_ct = 0.5    # 0.5 sec
    r_diff = 0.006  # 6 mOhm
    tau_diff = 6.0  # 6 sec

    # Voltage response under discharge pulse from t=0 to t=10
    v_resp = np.full_like(t, v_base)
    in_pulse = (t >= 0) & (t <= 10)
    post_pulse = t > 10

    # During pulse
    t_p = t[in_pulse]
    v_resp[in_pulse] = (
        v_base 
        - i_pulse * r0 
        - i_pulse * r_ct * (1 - np.exp(-t_p / tau_ct))
        - i_pulse * r_diff * (1 - np.exp(-t_p / tau_diff))
    )

    # Post pulse relaxation
    t_post = t[post_pulse] - 10
    v_end_pulse = v_resp[in_pulse][-1]
    v_resp[post_pulse] = (
        v_base 
        - (v_base - v_end_pulse - i_pulse * r0) * np.exp(-t_post / tau_diff)
    )

    ax1.plot(t, v_resp, color="#0f172a", lw=2.5, label="Terminal Voltage $V(t)$")
    ax1.axhline(v_base, color="#94a3b8", ls="--", lw=1.2, label=r"Pre-pulse Open Circuit Voltage ($V_{\mathrm{pre}}$)")

    # Annotate R0 instantaneous drop
    ax1.annotate(r"$\mathbf{Ohmic\ Step\ (\Delta V_0 = I R_0)}$" "\n" r"Foil, tabs, bulk electrolyte ($< 1\,\mathrm{ms}$)",
                 xy=(0.1, v_base - i_pulse * r0), xytext=(2.0, 3.28),
                 arrowprops=dict(arrowstyle="->", color="#dc2626", lw=1.5), fontsize=8.5, color="#dc2626")

    # Annotate Charge-transfer activation
    ax1.annotate(r"$\mathbf{Charge\ Transfer\ (\eta_{\mathrm{ct}})}$" "\n" r"SEI desolvation ($1\,\mathrm{ms} - 1\,\mathrm{s}$)",
                 xy=(1.5, v_base - i_pulse * (r0 + r_ct)), xytext=(4.5, 3.23),
                 arrowprops=dict(arrowstyle="->", color="#ea580c", lw=1.5), fontsize=8.5, color="#ea580c")

    # Annotate Diffusion relaxation
    ax1.annotate(r"$\mathbf{Diffusion\ Polarization\ (\eta_{\mathrm{diff}})}$" "\n" r"Fickian solid-state transport ($1 - 30\,\mathrm{s}$)",
                 xy=(9.8, v_resp[in_pulse][-1]), xytext=(7.0, 3.02),
                 arrowprops=dict(arrowstyle="->", color="#0284c7", lw=1.5), fontsize=8.5, color="#0284c7")

    # Pulse duration bar
    ax1.axvspan(0, 10, color="#fef08a", alpha=0.25, label="20 A Discharge Pulse ($10\\,\\mathrm{s}$)")
    ax1.set_xlabel("Time (seconds)")
    ax1.set_ylabel("Terminal Voltage (V)")
    ax1.set_title("HPPC Pulse Voltage Response & Resistance Deconvolution")
    ax1.set_xlim(-2, 22)
    ax1.set_ylim(2.95, 3.35)
    ax1.legend(loc="lower right", frameon=True, facecolor="white", fontsize=8.5)

    # Panel 2: Bathtub Curve vs SOC
    soc = np.linspace(2, 98, 500)
    # Bathtub shape: high at low SOC, low middle, slight rise at high SOC
    dcir = 6.8 + 0.8 * np.exp((soc - 85) / 8.0) + 12.0 * np.exp(-soc / 5.0)

    ax2.plot(soc, dcir, color="#0284c7", lw=2.8, label=r"Measured $R_{\mathrm{DCIR}}$ vs. SOC")
    ax2.fill_between(soc, dcir, 6.0, color="#0284c7", alpha=0.15)

    # Highlight Optimal Flat Floor
    ax2.axvspan(20, 85, color="#f0fdf4", alpha=0.8, zorder=0)
    ax2.text(52, 8.5, r"$\mathbf{Optimal\ Power\ Delivery\ Zone}$" "\n" r"Low, flat impedance ($6.8 - 7.5\,\mathrm{m\Omega}$)" "\n" r"Balanced vacancy and ion flux",
             ha="center", va="center", color="#166534", fontsize=9,
             bbox=dict(boxstyle="round,pad=0.3", fc="#dcfce7", ec="#86efac", lw=1))

    # Highlight Inverter Derating Zone
    ax2.axvspan(0, 12, color="#fef2f2", alpha=0.8, zorder=0)
    ax2.text(12, 16.5, r"$\mathbf{BMS\ Inverter\ Power\ Derating\ Zone}$" "\n"
                       r"• Resistance spikes $> 18\,\mathrm{m\Omega}$" "\n"
                       r"• Cathode particle saturation" "\n"
                       r"• Rapid voltage crash beneath $2.5\,\mathrm{V}$ cutoff",
             ha="left", va="center", color="#991b1b", fontsize=8.5,
             bbox=dict(boxstyle="round,pad=0.3", fc="#fee2e2", ec="#fca5a5", lw=1))

    ax2.set_xlabel("State of Charge (SOC %)")
    ax2.set_ylabel(r"Direct-Current Internal Resistance $R_{\mathrm{DCIR}}\ (\mathrm{m\Omega})$")
    ax2.set_title("The DCIR 'Bathtub Curve' Across State of Charge")
    ax2.set_xlim(0, 100)
    ax2.set_ylim(4, 22)
    ax2.legend(loc="upper right", frameon=True, facecolor="white")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig5_dcir_pulse_and_bathtub.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

# -----------------------------------------------------------------------------
# FIGURE 6: Forensic Chemistry Mismatch: LFP vs Kokam High-Voltage Cell
# -----------------------------------------------------------------------------
def generate_figure_6():
    print("Generating Figure 6: Forensic Chemistry Comparison...")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5.2))

    # Panel 1: Voltage vs Capacity profile
    cap = np.linspace(0.01, 0.99, 500)

    # True LFP: Flat 3.25V plateau, 2.5V - 3.65V window
    v_lfp = 3.25 + 0.08 * (cap - 0.5)**5 + 0.15 * np.exp((cap - 0.98)*35) - 0.35 * np.exp(-cap * 35)

    # Kokam SLPBA842124HV: High-Voltage NMC/LCO, 3.0V - 4.35V window, sloping profile
    v_kokam = 3.0 + 1.25 * cap + 0.05 * np.sin(cap * 3 * np.pi) + 0.10 * np.exp((cap - 0.98)*30)

    ax1.plot(cap * 100, v_lfp, color="#16a34a", lw=2.8, label=r"True LFP Cell ($\mathrm{LiFePO}_4$/Graphite, 3.2V nom)")
    ax1.plot(cap * 100, v_kokam, color="#ea580c", lw=2.8, label="Kokam SLPBA842124HV (NMC/LCO Blend, 4.35V max)")

    ax1.axhline(3.65, color="#16a34a", ls=":", lw=1.2, label=r"LFP Upper Cutoff ($3.65\,\mathrm{V}$)")
    ax1.axhline(4.35, color="#ea580c", ls=":", lw=1.2, label=r"Kokam HV Upper Cutoff ($4.35\,\mathrm{V}$)")

    ax1.set_xlabel("Normalized Capacity / SOC (%)")
    ax1.set_ylabel("Terminal Voltage (V)")
    ax1.set_title("Operating Voltage Windows: Flat Plateau vs. Sloping Oxide")
    ax1.set_xlim(0, 100)
    ax1.set_ylim(2.3, 4.5)
    ax1.legend(loc="lower right", frameon=True, facecolor="white", edgecolor="#cbd5e1")

    # Panel 2: dQ/dV forensic comparison
    v_span = np.linspace(3.0, 4.35, 1000)

    # LFP dQ/dV concentrated at 3.2 - 3.4V
    dq_lfp = 0.2 + 8.5 * np.exp(-((v_span - 3.34) / 0.03)**2) + 3.0 * np.exp(-((v_span - 3.24) / 0.03)**2)

    # Kokam High-Voltage peaks at 3.855 V, 3.99 V, 4.10 V
    dq_kokam = (
        0.3 
        + 4.8 * np.exp(-((v_span - 3.855) / 0.045)**2)
        + 6.2 * np.exp(-((v_span - 3.990) / 0.040)**2)
        + 5.1 * np.exp(-((v_span - 4.100) / 0.040)**2)
    )

    ax2.plot(v_span, dq_lfp, color="#16a34a", lw=2.5, label="True LFP: Peak centered at $\\approx 3.34\\,\\mathrm{V}$")
    ax2.plot(v_span, dq_kokam, color="#ea580c", lw=2.5, label="Kokam SLPB: 3 High-Voltage Peaks ($3.85-4.10\\,\\mathrm{V}$)")

    ax2.fill_between(v_span, dq_lfp, 0, color="#16a34a", alpha=0.15)
    ax2.fill_between(v_span, dq_kokam, 0, color="#ea580c", alpha=0.15)

    # Annotations
    ax2.annotate("LFP Two-Phase Transition\n($\\approx 3.34\\,\\mathrm{V}$)", xy=(3.34, 8.5), xytext=(3.05, 7.5),
                 arrowprops=dict(arrowstyle="->", color="#15803d", lw=1.5), fontsize=8.5, color="#15803d",
                 bbox=dict(boxstyle="round,pad=0.3", fc="#f0fdf4", ec="#bbf7d0"))

    ax2.annotate("Kokam High-Voltage Peaks:\n$3.855\\,\\mathrm{V},\\ 3.990\\,\\mathrm{V},\\ 4.100\\,\\mathrm{V}$\n(Layered Oxide Phase Transitions)", 
                 xy=(3.99, 6.3), xytext=(3.65, 8.5),
                 arrowprops=dict(arrowstyle="->", color="#c2410c", lw=1.5), fontsize=8.5, color="#c2410c",
                 bbox=dict(boxstyle="round,pad=0.3", fc="#fff7ed", ec="#fed7aa"))

    ax2.set_xlabel("Cell Terminal Voltage (V)")
    ax2.set_ylabel("Differential Capacity $dQ/dV$ (Arb. Units)")
    ax2.set_title("Forensic $dQ/dV$ Proof: Resolving the Chemistry Mismatch")
    ax2.set_xlim(3.0, 4.35)
    ax2.set_ylim(0, 11)
    ax2.legend(loc="upper right", frameon=True, facecolor="white", edgecolor="#cbd5e1")

    plt.tight_layout()
    filepath = os.path.join(OUTPUT_DIR, "fig6_chemistry_forensic_comparison.png")
    fig.savefig(filepath, dpi=300)
    plt.close(fig)
    print(f"Saved: {filepath}")

if __name__ == "__main__":
    generate_figure_1()
    generate_figure_2()
    generate_figure_3()
    generate_figure_4()
    generate_figure_5()
    generate_figure_6()
    print("All figures successfully synthesized!")

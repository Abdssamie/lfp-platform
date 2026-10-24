# LFP Battery Formation & Aging SPC Analytics Platform

A high-throughput telemetry pipeline and real-time dashboard for **commercial Lithium Iron Phosphate ($\text{LiFePO}_4$)** cell formation quality control, differential capacity ($dQ/dV$) analytics, micro-short screening, and automotive **IATF 16949** Statistical Process Control (SPC).

---

## ⚡ Core Capabilities

1. **Multi-Channel Cycler Ingestion**
   - High-throughput pipeline powered by **Polars** and **Apache Arrow**.
   - Normalizes heterogeneous cycler formats (Arbin, Neware BTS-4000/8000, BioLogic via `galvani`) into canonical time-series schemas.

2. **Automated Differential Capacity Analysis ($dQ/dV$)**
   - Resolves the flat $\sim 3.42\,\text{V}$ LFP two-phase plateau ($\text{FePO}_4 \leftrightarrow \text{LiFePO}_4$).
   - PCHIP shape-preserving monotonic spline resampling followed by **Savitzky-Golay filtering** (`scipy.signal.savgol_filter`).
   - Automated peak identification, tracking overpotential/polarization shifts, and quantifying Loss of Lithium Inventory (LLI) via peak area integration.

3. **Automated Defect Screening: $K$-Value & DCIR**
   - **Self-Discharge Rate ($K = dV/dt$)**: Linear regression over post-formation open-circuit rest periods to isolate separator pinholes and internal micro-short hazards ($K \ge 0.50\,\text{mV/day}$).
   - **Direct Current Internal Resistance (DCIR)**: Sub-second ohmic pulse extraction ($\Delta V / \Delta I$) isolating contact tab weld defects and bulk electrolyte transport limitations.

4. **Automated SPC & IATF 16949 Grading**
   - Shewhart $\bar{X}$-$R$ control charts with standard ASTM/ISO subgrouping ($A_2, D_3, D_4, d_2$).
   - Process Capability and Performance indices ($C_p, C_{pk}, P_p, P_{pk}$).
   - Automated multi-tier cell grading:
     - **Grade A**: Within $3\sigma$ control limits and IATF 16949 tolerances ($C_{pk} \ge 1.33$) $\rightarrow$ approved for EV pack assembly.
     - **Grade B**: Minor capacity or DCIR variance $\rightarrow$ rerouted to stationary Energy Storage Systems (ESS).
     - **Scrap / Quarantined**: Micro-short hazard or extreme impedance $\rightarrow$ immediate quarantine.

5. **Full-Stack Decoupled Architecture (FastAPI + Next.js + shadcn/ui)**
   - **FastAPI Backend Server**: Contract-first Pydantic v2 schemas, REST endpoints for batch simulation, individual channel telemetry, dQ/dV curves, and SPC analytics.
   - **Next.js & shadcn/ui Frontend**: Managed via **pnpm**, featuring dark-theme industrial instrumentation, hardware channel rack, and interactive Recharts visualizations.

---

## 🛠️ Repository Architecture

```
lfp-platform/
├── lfp_platform/               # Core analytics package
│   ├── models.py               # Pydantic data schemas & enum types
│   ├── generator.py            # Vectorized physics-grounded LFP cycler generator
│   ├── pipeline.py             # Batch processing & evaluation coordinator
│   ├── analytics/
│   │   ├── dqdv.py             # Spline resampling + Savitzky-Golay dQ/dV engine
│   │   ├── screening.py        # K-value (dV/dt) & DCIR pulse calculator
│   │   └── spc.py              # Shewhart X-bar/R charts, Cpk/Ppk & IATF grading
│   └── parsers/
│       ├── base.py             # Abstract base cycler parser & canonical schema
│       ├── arbin.py            # Arbin CSV / binary normalization
│       └── neware.py           # Neware BTS CSV normalization
├── server/                     # FastAPI Backend Server
│   ├── main.py                 # FastAPI application, CORS, and endpoint routes
│   └── schemas.py              # Request/Response Pydantic schemas
├── frontend/                   # Next.js Frontend Application (pnpm)
│   ├── src/
│   │   ├── app/                # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/         # Workstation UI components
│   │   │   ├── ui/             # Official shadcn UI components (badge, card, tabs, table, etc.)
│   │   │   ├── charts/         # Interactive Recharts (Telemetry, VQ, dQ/dV, Screening, SPC)
│   │   │   ├── ChannelRack.tsx # 24-channel hardware cabinet rack
│   │   │   ├── CellSummaryStrip.tsx # Active channel key telemetry strip
│   │   │   ├── CellAuditCard.tsx # Detailed electrochemical audit
│   │   │   ├── TriageRibbon.tsx  # KPI summary blocks & safety quarantine alarm
│   │   │   ├── Header.tsx        # Machined console header & batch trigger
│   │   │   └── BatchLedger.tsx   # Lot inspection table with filtering
│   │   ├── lib/api.ts          # Typed API client for FastAPI backend
│   │   └── types/api.ts        # TypeScript schemas (No 'any' typing)
│   ├── components.json         # shadcn configuration
│   └── package.json            # Managed by pnpm
├── tests/                      # Pytest test suite
│   ├── test_pipeline.py        # Algorithmic & physics verification
│   ├── test_parsers.py         # Cycler log ingestion tests
│   └── test_api.py             # FastAPI endpoint contract tests
├── main.py                     # Convenience launcher for FastAPI backend
└── pyproject.toml              # Python dependencies & build config (managed by uv)
```

---

## 🚀 Quickstart

### Prerequisites
- Python $\ge 3.13$ with [uv](https://github.com/astral-sh/uv)
- Node.js $\ge 20$ with [pnpm](https://pnpm.io/)

### 1. Run Python Test Suite
Verify backend algorithms, parsers, and FastAPI endpoints:
```bash
uv run pytest -v
```

### 2. Launch FastAPI Backend
Start the analytical server on port 8000:
```bash
uv run python main.py
# Or directly via uvicorn:
uv run uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive OpenAPI documentation will be accessible at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Launch Next.js Dashboard
In a separate terminal, start the Next.js workstation (port 3000):
```bash
cd frontend
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

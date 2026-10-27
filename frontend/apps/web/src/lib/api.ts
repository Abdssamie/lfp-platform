import type {
  BatchRunRequest,
  BatchSummaryResponse,
  CellDetailResponse,
  ScreeningScatterResponse,
  SPCSummaryResponse,
  NovonixDatasetResponse,
  NewareDatasetResponse,
  LfpDatasetResponse,
  BTMSRequest,
  BTMSResponse,
} from "@/types/api";
import { solveBTMSSimulation } from "./btms-solver";

function getApiBase(): string {
  if (typeof window !== "undefined") {
    const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
    return envUrl ? envUrl.replace(/\/$/, "") : "";
  }

  // Server-side / SSR resolution
  return (
    process.env.FASTAPI_INTERNAL_URL ||
    process.env.VITE_API_URL ||
    "http://backend:8000"
  ).replace(/\/$/, "");
}

const API_BASE = getApiBase();

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    const cleanError =
      errorText.includes("<!DOCTYPE") || errorText.includes("<html")
        ? res.statusText || `HTTP ${res.status}`
        : errorText.slice(0, 140);
    throw new Error(`API Error ${res.status}: ${cleanError}`);
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const previewText = await res.text();
    throw new Error(
      `Invalid API response format: received ${contentType || "HTML"} instead of JSON (${previewText.slice(0, 60)}...)`
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchBatchCurrent(): Promise<BatchSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/batch/current`, { cache: "no-store" });
  return handleResponse<BatchSummaryResponse>(res);
}

export async function runBatchPipeline(
  params?: Partial<BatchRunRequest>
): Promise<BatchSummaryResponse> {
  const payload: BatchRunRequest = {
    batch_id: params?.batch_id ?? "BATCH_202610A",
    num_cells: params?.num_cells ?? 24,
    micro_short_rate: params?.micro_short_rate ?? 0.08,
    high_dcir_rate: params?.high_dcir_rate ?? 0.08,
    low_capacity_rate: params?.low_capacity_rate ?? 0.08,
  };

  const res = await fetch(`${API_BASE}/api/batch/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<BatchSummaryResponse>(res);
}

export async function fetchCellDetail(cellId: string): Promise<CellDetailResponse> {
  const res = await fetch(`${API_BASE}/api/cells/${encodeURIComponent(cellId)}`, {
    cache: "no-store",
  });
  return handleResponse<CellDetailResponse>(res);
}

export async function fetchScreeningScatter(): Promise<ScreeningScatterResponse> {
  const res = await fetch(`${API_BASE}/api/screening/scatter`, { cache: "no-store" });
  return handleResponse<ScreeningScatterResponse>(res);
}

export async function fetchSPCSummary(): Promise<SPCSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/spc/summary`, { cache: "no-store" });
  return handleResponse<SPCSummaryResponse>(res);
}

export async function loadNovonixDataset(): Promise<BatchSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/batch/load-novonix`, {
    method: "POST",
  });
  return handleResponse<BatchSummaryResponse>(res);
}

export async function fetchNovonixDataset(): Promise<NovonixDatasetResponse> {
  const res = await fetch(`${API_BASE}/api/novonix/dataset`, {
    cache: "no-store",
  });
  return handleResponse<NovonixDatasetResponse>(res);
}


export async function fetchNewareDataset(): Promise<NewareDatasetResponse> {
  const res = await fetch(`${API_BASE}/api/neware/dataset`, {
    cache: "no-store",
  });
  return handleResponse<NewareDatasetResponse>(res);
}

export async function loadNewareDataset(): Promise<BatchSummaryResponse> {
  const res = await fetch(`${API_BASE}/api/batch/load-neware`, {
    method: "POST",
  });
  return handleResponse<BatchSummaryResponse>(res);
}

export async function fetchLfpDataset(): Promise<LfpDatasetResponse> {
  const res = await fetch(`${API_BASE}/api/lfp/dataset`, {
    cache: "no-store",
  });
  return handleResponse<LfpDatasetResponse>(res);
}

export async function simulateBTMS(payload: BTMSRequest): Promise<BTMSResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/btms/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse<BTMSResponse>(res);
  } catch (err) {
    console.warn("FastAPI backend unreachable, calculating using embedded RK4 solver:", err);
    return solveBTMSSimulation(payload);
  }
}



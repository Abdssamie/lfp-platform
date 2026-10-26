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

const API_BASE =
  typeof window !== "undefined"
    ? ""
    : process.env.FASTAPI_INTERNAL_URL || "http://127.0.0.1:8000";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
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
  const res = await fetch(`${API_BASE}/api/btms/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<BTMSResponse>(res);
}



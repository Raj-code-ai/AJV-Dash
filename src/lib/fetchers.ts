import type { ApiResponse } from "@/types";

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:5000"
  );
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = path.startsWith("http") ? path : `${getBaseUrl()}${path}`;
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      cache: options.cache ?? "no-store",
      signal: options.signal ?? controller.signal,
    }).finally(() => clearTimeout(timeout));

    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!json) {
      return {
        success: false,
        error: res.ok ? "Invalid response" : `Request failed (${res.status})`,
      };
    }

    return json;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}

export async function apiGet<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, { ...options, method: "GET" });
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    ...options,
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, {
    ...options,
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export async function apiDelete<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(path, { ...options, method: "DELETE" });
}

export async function uploadImage(
  file: File,
  folder = "department-cms"
): Promise<ApiResponse<{ url: string; publicId: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  return apiPost<{ url: string; publicId: string }>(
    "/api/admin/upload",
    formData
  );
}

export function formatDate(value?: string | Date | null, opts?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...opts,
  });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

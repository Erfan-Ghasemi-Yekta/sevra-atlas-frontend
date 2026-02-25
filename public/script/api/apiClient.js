// File: /public/script/api/apiClient.js

/**
 * Centralized API client for Sevra Atlas Frontend
 * - Change BASE_URL here and everything updates.
 * - Provides a small, consistent wrapper around fetch + API envelope { success, data, ... }.
 *
 * Based on atlas-API.yaml (servers.url = /api/v1)
 */

const DEFAULT_BASE_URL = "https://atom-game.ir/api/v1";
const STORAGE_KEY = "SEVRA_API_BASE_URL";


function readInitialBaseUrl() {
  try {
    const fromGlobal = typeof window !== "undefined" ? window.__SEVRA_API_BASE_URL__ : null;
    const fromStorage = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const candidate = fromGlobal || fromStorage || DEFAULT_BASE_URL;
    return String(candidate || "").replace(/\/+$/, "") || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

let BASE_URL = readInitialBaseUrl();

export function setApiBaseUrl(nextBaseUrl, { persist = false } = {}) {
  const cleaned = String(nextBaseUrl || "").replace(/\/+$/, "") || DEFAULT_BASE_URL;
  BASE_URL = cleaned;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, cleaned);
    } catch {
      // ignore
    }
  }
}

export function clearApiBaseUrl() {
  BASE_URL = DEFAULT_BASE_URL;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getApiBaseUrl() {
  return BASE_URL;
}

export class ApiError extends Error {
  constructor(message, { status, code, details, url } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

function buildUrl(path, query) {
  const base = getApiBaseUrl().replace(/\/+$/, "");
  const p = String(path || "").startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${p}`, window.location.origin);

  if (query && typeof query === "object") {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }

  return url;
}

async function safeReadJson(res) {
  // Some endpoints may return 204 or empty bodies.
  if (res.status === 204) return null;

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  // fallback: try parse anyway
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { __rawText: text };
  }
}

/**
 * apiRequest(path, options)
 * - Automatically handles JSON + FormData
 * - Normalizes API envelope: { success, data, ... }
 */
export async function apiRequest(
  path,
  {
    method = "GET",
    query,
    body,
    headers,
    signal,
    authToken, // optional; for protected endpoints
    credentials = "same-origin", // can be overridden (e.g. "include")
  } = {}
) {
  const url = buildUrl(path, query);

  const finalHeaders = new Headers({
    Accept: "application/json",
    ...(headers || {}),
  });

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  if (authToken) finalHeaders.set("Authorization", `Bearer ${authToken}`);

  let finalBody = undefined;
  if (hasBody) {
    if (isForm) {
      finalBody = body; // browser sets boundary
    } else if (typeof body === "string") {
      finalBody = body;
      if (!finalHeaders.has("Content-Type")) finalHeaders.set("Content-Type", "text/plain;charset=UTF-8");
    } else {
      finalBody = JSON.stringify(body);
      if (!finalHeaders.has("Content-Type")) finalHeaders.set("Content-Type", "application/json;charset=UTF-8");
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: finalHeaders,
    body: finalBody,
    signal,
    credentials,
  });

  const payload = await safeReadJson(res);

  // Non-2xx
  if (!res.ok) {
    const msg =
      (payload && payload.message) ||
      (payload && payload.error) ||
      `HTTP ${res.status} (${res.statusText})`;
    throw new ApiError(msg, { status: res.status, details: payload, url: url.toString() });
  }

  // Envelope failure (most endpoints in atlas-API.yaml use this)
  if (payload && payload.success === false) {
    const msg = payload.message || "API returned success=false";
    throw new ApiError(msg, {
      status: res.status,
      code: payload.code,
      details: payload,
      url: url.toString(),
    });
  }

  return payload;
}

// ---------- Domain APIs (small, clean, modular) ----------

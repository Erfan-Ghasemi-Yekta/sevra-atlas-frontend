// File: /public/script/api/apiClient.js

/**
 * Centralized API client for Sevra Atlas Frontend
 * - Change BASE_URL here and everything updates.
 * - Provides a small, consistent wrapper around fetch + API envelope { success, data, ... }.
 */

const DEFAULT_BASE_URL = "https://atom-game.ir/api/v1"; // مطابق atlas-API.yaml -> servers.url
let BASE_URL = DEFAULT_BASE_URL;

export function setApiBaseUrl(nextBaseUrl) {
  BASE_URL = String(nextBaseUrl || "").replace(/\/+$/, "") || DEFAULT_BASE_URL;
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
      if (v === undefined || v === null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url;
}

async function safeReadJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  // fallback: try parse anyway
  const text = await res.text();
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
    authToken, // optional; if you ever need protected endpoints
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
    credentials: "same-origin",
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

  // Envelope failure
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

export const salonsApi = {
  async getByIdOrSlug(idOrSlug) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}`);
    return res?.data ?? res;
  },
};

export const servicesApi = {
  async listCategories() {
    const res = await apiRequest(`/services`);
    return res?.data ?? res;
  },
};

// ---------- Artists APIs ----------

export const artistsApi = {
  /**
   * Get artist (staff) by id or slug
   * GET /artists/{idOrSlug}
   */
  async getByIdOrSlug(idOrSlug) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}`);
    return res?.data ?? res;
  },

  /**
   * List reviews for an artist
   * GET /artists/{idOrSlug}/reviews
   */
  async listReviews(idOrSlug, { page, limit } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/reviews`, {
      query: { page, limit },
    });
    return res?.data ?? res;
  },

  /**
   * (Needs backend) List gallery items for an artist
   * Expected GET /artists/{idOrSlug}/gallery
   * Recommended response:
   *  - { items: Media[], total: number } OR Media[]
   */
  async listGallery(idOrSlug, { page, limit } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/gallery`, {
      query: { page, limit },
    });
    return res?.data ?? res;
  },

  /**
   * (Needs backend) List specialties for an artist
   * Expected GET /artists/{idOrSlug}/specialties
   */
  async listSpecialties(idOrSlug) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/specialties`);
    return res?.data ?? res;
  },
};

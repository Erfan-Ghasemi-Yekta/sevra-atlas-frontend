// public/script/api/landingApi.js
// Page-level data loaders + mappers for Landing (Home) page.
// Keeps UI components "dumb": they only render what we pass.

import { apiRequest, getApiBaseUrl } from "/public/script/api/apiClient.js";

// ---- Endpoints (اگر مسیرهای API شما فرق دارد، فقط این دو تا را عوض کن) ----
const SALONS_LIST_PATH = "/salons";
const ARTISTS_LIST_PATH = "/artists";

// --- Helpers ---

function getApiOrigin() {
  try {
    const base = new URL(getApiBaseUrl());
    return base.origin;
  } catch {
    return window.location.origin;
  }
}

function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

/**
 * resolveMediaUrl(mediaOrUrl)
 * Accepts:
 * - media object: { url: "..." }
 * - raw string url
 * Returns a usable absolute URL when possible.
 */
export function resolveMediaUrl(mediaOrUrl) {
  const raw =
    typeof mediaOrUrl === "string"
      ? mediaOrUrl
      : mediaOrUrl && typeof mediaOrUrl === "object"
        ? mediaOrUrl.url
        : "";

  const u = String(raw || "").trim();
  if (!u) return "";

  if (isAbsoluteUrl(u)) return u;

  // If server returns "/uploads/..." we should resolve against API origin,
  // NOT the current frontend origin.
  try {
    return new URL(u, getApiOrigin()).toString();
  } catch {
    return u;
  }
}

function buildSalonHref(salon) {
  const idOrSlug = salon?.slug || salon?.id;
  if (!idOrSlug) return "/public/salon.html";
  return `/public/salon.html?salon=${encodeURIComponent(String(idOrSlug))}`;
}

function buildArtistHref(artist) {
  const idOrSlug = artist?.slug || artist?.id;
  if (!idOrSlug) return "/public/staff.html";
  return `/public/staff.html?artist=${encodeURIComponent(String(idOrSlug))}`;
}

function chunk(arr, size) {
  const safe = Array.isArray(arr) ? arr : [];
  const n = Math.max(1, Number(size) || 1);
  const out = [];
  for (let i = 0; i < safe.length; i += n) out.push(safe.slice(i, i + n));
  return out;
}

/**
 * normalizeListPayload(payload)
 * ساپورت چند فرم رایج:
 * - { success:true, data: [...] }
 * - { success:true, data: { items:[...] } }
 * - { items:[...] }
 * - [...]
 */
function normalizeListPayload(payload) {
  const root = payload?.data ?? payload;

  if (Array.isArray(root)) return root;
  if (Array.isArray(root?.items)) return root.items;

  // بعضی APIها: { data: { rows: [] } } یا ...
  if (Array.isArray(root?.rows)) return root.rows;

  return [];
}

// --- Mappers (API -> UI props) ---

export function mapSalonToPopularCard(salon, idx) {
  const cityName = salon?.city?.nameFa || salon?.city?.nameEn || "";

  return {
    rank: idx + 1,
    city: cityName || "—",
    // API does not expose "views" in schema; closest meaningful metric on list is reviewCount.
    views: Number(salon?.reviewCount ?? 0) || 0,
    name: salon?.name || "—",
    subtitle: salon?.summary || salon?.addressLine || salon?.fullAddress || "",
    imageSrc: resolveMediaUrl(salon?.avatar),
    href: buildSalonHref(salon),
    detailsText: "جزئیات",
  };
}

export function mapArtistToTopStaffCard(artist) {
  const cityName = artist?.city?.nameFa || artist?.city?.nameEn || "";

  return {
    name: artist?.fullName || "—",
    rating: Number(artist?.avgRating ?? 0) || 0,
    reviewsCount: artist?.reviewCount,
    // در API فیلدی برای تعداد خدمات انجام‌شده نداریم (حداقل در اسکیمای فعلی)
    jobsDoneText: "",
    specialty: artist?.summary || cityName || "",
    imageSrc: resolveMediaUrl(artist?.avatar),
    profileHref: buildArtistHref(artist),
  };
}

// --- Loaders (fetch + map) ---

/**
 * loadPopularSalons({ q, city, limit, signal })
 * - q: optional search query
 * - limit: number of cards for slider
 */
export async function loadPopularSalons({ q, city, limit = 8, signal } = {}) {
  const payload = await apiRequest(SALONS_LIST_PATH, {
    method: "GET",
    query: {
      q: q || undefined,
      city: city || undefined,
      sort: "popular",
      page: 1,
      pageSize: limit,
    },
    signal,
  });

  const rows = normalizeListPayload(payload);
  return rows.slice(0, limit).map(mapSalonToPopularCard);
}

/**
 * loadTopStaff({ q, city, limit, perSlide, signal })
 * Returns slides format expected by mountTopStaff: [ [card, card], [card, card], ... ]
 */
export async function loadTopStaff({ q, city, limit = 8, perSlide = 2, signal } = {}) {
  const payload = await apiRequest(ARTISTS_LIST_PATH, {
    method: "GET",
    query: {
      q: q || undefined,
      city: city || undefined,
      sort: q ? "popular" : "rating",
      page: 1,
      pageSize: limit,
    },
    signal,
  });

  const rows = normalizeListPayload(payload);
  const cards = rows.slice(0, limit).map(mapArtistToTopStaffCard);
  return chunk(cards, perSlide);
}
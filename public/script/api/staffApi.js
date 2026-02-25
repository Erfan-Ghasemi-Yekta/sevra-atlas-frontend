// File: /public/script/api/staffApi.js
import { apiRequest } from "/public/script/api/apiClient.js";

/**
 * Staff/Artist domain API (page-level module)
 * Keeps staff-related endpoints out of apiClient.js (transport-only).
 */
export const staffApi = {
  /**
   * List artists (staff)
   * GET /artists
   */
  async list(filters = {}, { signal } = {}) {
    const res = await apiRequest(`/artists`, {
      query: {
        q: filters.q,
        city: filters.city,
        neighborhood: filters.neighborhood,
        specialty: filters.specialty,
        verified: filters.verified,
        minRating: filters.minRating,
        minReviewCount: filters.minReviewCount,
        sort: filters.sort,
        page: filters.page,
        pageSize: filters.pageSize,
      },
      signal,
    });
    return res?.data ?? res;
  },

  /**
   * Get artist (staff) by id or slug
   * GET /artists/{idOrSlug}
   */
  async getByIdOrSlug(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}`, { signal });
    return res?.data ?? res;
  },

  /**
   * List reviews for an artist
   * GET /artists/{idOrSlug}/reviews
   */
  async listReviews(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/reviews`, { signal });
    return res?.data ?? res;
  },

  /**
   * List gallery items for an artist
   * GET /artists/{idOrSlug}/gallery
   * Query: page, pageSize
   */
  async listGallery(idOrSlug, { page, pageSize, signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/gallery`, {
      query: { page, pageSize },
      signal,
    });
    return res?.data ?? res;
  },

  /**
   * List specialties for an artist
   * GET /artists/{idOrSlug}/specialties
   */
  async listSpecialties(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/artists/${safe}/specialties`, { signal });
    return res?.data ?? res;
  },

  // Optional upload helpers (keep here if you later add UI for them)
  async uploadAvatar(idOrSlug, file, { authToken, signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiRequest(`/artists/${safe}/avatar`, { method: "POST", body: fd, authToken, signal });
    return res?.data ?? res;
  },

  async uploadCover(idOrSlug, file, { authToken, signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiRequest(`/artists/${safe}/cover`, { method: "POST", body: fd, authToken, signal });
    return res?.data ?? res;
  },
};

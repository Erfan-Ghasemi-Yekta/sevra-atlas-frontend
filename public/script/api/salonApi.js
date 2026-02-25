// File: /public/script/api/salonApi.js
import { apiRequest } from "/public/script/api/apiClient.js";

/**
 * Salon domain API (page-level module)
 * Keeps salon-related endpoints out of apiClient.js (transport-only).
 */
export const salonApi = {
  /**
   * Get salon by id or slug
   * GET /salons/{idOrSlug}
   */
  async getByIdOrSlug(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}`, { signal });
    return res?.data ?? res;
  },

  /**
   * List services for a salon
   * GET /salons/{idOrSlug}/services
   */
  async listServices(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}/services`, { signal });
    return res?.data ?? res;
  },

  /**
   * List gallery items for a salon
   * GET /salons/{idOrSlug}/gallery
   * Query: page, pageSize
   */
  async listGallery(idOrSlug, { page, pageSize, signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}/gallery`, {
      query: { page, pageSize },
      signal,
    });
    return res?.data ?? res;
  },

  /**
   * (Optional) List artists working at a salon
   * GET /salons/{idOrSlug}/artists
   */
  async listArtists(idOrSlug, { page, pageSize, signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}/artists`, {
      query: { page, pageSize },
      signal,
    });
    return res?.data ?? res;
  },

  /**
   * (Optional) List reviews for a salon
   * GET /salons/{idOrSlug}/reviews
   */
  async listReviews(idOrSlug, { signal } = {}) {
    const safe = encodeURIComponent(String(idOrSlug));
    const res = await apiRequest(`/salons/${safe}/reviews`, { signal });
    return res?.data ?? res;
  },
};

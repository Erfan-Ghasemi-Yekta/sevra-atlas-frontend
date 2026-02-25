import { staffApi } from "/public/script/api/staffApi.js";

// Staff Portfolio component
// - Fetches gallery from API (no static seed images by default)
// - Shows first N images as preview
// - On click, opens a modal with ALL images as a scrollable list

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconSparkle(className = "size-5") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.2 4.2L17.4 8l-4.2 1.2L12 13.4l-1.2-4.2L6.6 8l4.2-1.8L12 2zM19 12l.8 2.8L22.6 16l-2.8.8L19 19.6l-.8-2.8L15.4 16l2.8-1.2L19 12zM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13z"/>
    </svg>
  `;
}

function normalizeImages(input = []) {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((it, i) => {
      if (!it) return null;

      // string url
      if (typeof it === "string") {
        return { id: `img_${i}`, url: it, alt: `نمونه کار ${i + 1}` };
      }

      // media object
      if (typeof it === "object") {
        const url = it.url || it.src || it.path || it.originalUrl || "";
        if (!url) return null;

        return {
          id: String(it.id ?? it.mediaId ?? `img_${i}`),
          url,
          alt: it.altText || it.alt || it.title || `نمونه کار ${i + 1}`,
        };
      }

      return null;
    })
    .filter(Boolean);
}

// ---------------- API client ----------------

export function createStaffPortfolioClient({ routes = {} } = {}) {
  const defaultRoutes = {
    // atlas-API.yaml: GET /artists/{idOrSlug}/gallery (paginated)
    list: ({ idOrSlug }) => `/artists/${encodeURIComponent(String(idOrSlug))}/gallery`,
  };

  const r = { ...defaultRoutes, ...routes };

  return {
    async list({ idOrSlug, page, pageSize, limit, signal } = {}) {
      if (!idOrSlug) throw new Error("idOrSlug is required");

      const res = await staffApi.listGallery(idOrSlug, {
        page,
        // Backend uses pageSize; keep limit for backward compat
        pageSize: pageSize ?? limit,
        signal,
      });

      // normalize common shapes
      const data = res?.data ?? res;
      const itemsRaw = Array.isArray(data) ? data : data?.items || data?.results || [];
      const totalRaw = Array.isArray(data) ? data.length : data?.total ?? data?.count ?? itemsRaw.length;

      const items = normalizeImages(itemsRaw);
      const total = Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : items.length;

      return { items, total };
    },
  };
}

// ---------------- UI ----------------

function headingTemplate(text) {
  return `
    <div class="flex items-center justify-start gap-2 text-lg font-extrabold text-neutral-900">
      <span class="text-primary-900">${iconSparkle("size-5")}</span>
      <span>${escapeHtml(text)}</span>
    </div>
  `;
}

function renderSkeleton(rootEl, heading = "نمونه کار ها") {
  rootEl.innerHTML = `
    <div class="space-y-3">
      ${headingTemplate(heading)}
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0" style="overflow:hidden;">
        <div class="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px;">
          ${Array.from({ length: 4 })
            .map(() => `<div class="bg-neutral-50" style="aspect-ratio: 1 / 1;"></div>`)
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function emptyTemplate({ heading = "نمونه کار ها", message = "نمونه کاری برای این متخصص ثبت نشده است." } = {}) {
  return `
    <div class="space-y-3">
      ${headingTemplate(heading)}
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4 text-sm text-neutral-700">
        ${escapeHtml(message)}
      </div>
    </div>
  `;
}

function errorTemplate({
  heading = "نمونه کار ها",
  message = "خطا در دریافت نمونه کارها. لطفاً دوباره تلاش کنید.",
} = {}) {
  return `
    <div class="space-y-3">
      ${headingTemplate(heading)}
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="text-sm text-neutral-700">${escapeHtml(message)}</div>
        <button
          type="button"
          data-portfolio-retry
          class="mt-3 inline-flex items-center justify-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-neutral-0"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  `;
}

function previewTemplate({ images, previewCount = 4, heading = "نمونه کار ها", totalCount } = {}) {
  const items = normalizeImages(images);
  const preview = items.slice(0, previewCount);

  const safeTotal =
    Number.isFinite(Number(totalCount)) && Number(totalCount) >= items.length
      ? Number(totalCount)
      : items.length;

  const remaining = Math.max(0, safeTotal - preview.length);

  const cells = preview
    .map(
      (img) => `
        <div class="relative bg-neutral-50" style="aspect-ratio: 1 / 1;">
          <img
            src="${escapeHtml(img.url)}"
            alt="${escapeHtml(img.alt)}"
            class="absolute inset-0 h-full w-full object-cover"
            draggable="false"
            loading="lazy"
          />
        </div>
      `
    )
    .join("");

  const overlay =
    remaining > 0
      ? `
        <div class="absolute inset-0 grid place-items-center pointer-events-none">
          <span class="inline-flex items-center rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-neutral-0 shadow-sm">
            +${remaining} عکس
          </span>
        </div>
      `
      : "";

  return `
    <div class="space-y-3">
      ${headingTemplate(heading)}

      <div class="rounded-2xl border border-neutral-50 bg-neutral-0" style="overflow:hidden;">
        <button
          type="button"
          data-portfolio-open
          class="block w-full text-right"
          aria-label="مشاهده همه نمونه کار ها"
        >
          <div class="relative">
            <div class="grid" style="grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px;">
              ${cells}
            </div>
            ${overlay}
          </div>
        </button>
      </div>
    </div>
  `;
}

function closeIcon() {
  return `
    <svg viewBox="0 0 24 24" class="size-5 text-neutral-900" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
    </svg>
  `;
}

function modalTemplate({ title = "نمونه کارها", images = [] } = {}) {
  const items = normalizeImages(images);

  const list = items
    .map(
      (img) => `
        <div class="rounded-2xl border border-neutral-50 bg-neutral-0" style="overflow:hidden;">
          <div class="relative bg-neutral-50" style="aspect-ratio: 1 / 1;">
            <img
              src="${escapeHtml(img.url)}"
              alt="${escapeHtml(img.alt)}"
              class="absolute inset-0 h-full w-full object-cover"
              draggable="false"
              loading="lazy"
            />
          </div>
        </div>
      `
    )
    .join("");

  return `
    <div data-portfolio-modal style="position: fixed; inset: 0; z-index: 9999;">
      <div data-portfolio-overlay style="position:absolute; inset:0; background: rgba(49,49,49,0.55);"></div>

      <div style="position:relative; max-width: 560px; margin: 16px auto; height: calc(100% - 32px); padding: 0 16px;">
        <div class="rounded-2xl border border-neutral-50 bg-neutral-0" style="height:100%; display:flex; flex-direction:column; overflow:hidden;">
          <div class="p-4 border-b border-neutral-50 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <div class="text-sm font-bold text-neutral-900">${escapeHtml(title)}</div>
              <div class="mt-1 text-xs text-neutral-700">${items.length} عکس</div>
            </div>

            <button
              type="button"
              data-portfolio-close
              class="size-10 rounded-full border border-neutral-50 bg-neutral-0 grid place-items-center active:scale-[0.99] transition"
              aria-label="بستن"
            >
              ${closeIcon()}
            </button>
          </div>

          <div class="p-4 space-y-3" style="overflow:auto;">
            ${list}
          </div>
        </div>
      </div>
    </div>
  `;
}

function openModal({ title, images, onClose } = {}) {
  const host = document.createElement("div");
  host.innerHTML = modalTemplate({ title, images });
  const modalEl = host.firstElementChild;

  const overlay = modalEl.querySelector("[data-portfolio-overlay]");
  const closeBtn = modalEl.querySelector("[data-portfolio-close]");

  const prevOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  const onKeyDown = (e) => {
    if (e.key === "Escape") cleanup();
  };

  const cleanup = () => {
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKeyDown);
    modalEl.remove();
    onClose?.();
  };

  overlay?.addEventListener("click", cleanup);
  closeBtn?.addEventListener("click", cleanup);
  document.addEventListener("keydown", onKeyDown);

  document.body.appendChild(modalEl);
  closeBtn?.focus();

  return cleanup;
}

function initPortfolio(rootEl, state) {
  const btn = rootEl.querySelector("[data-portfolio-open]");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!state.images || state.images.length === 0) return;

    const activeEl = document.activeElement;

    openModal({
      title: state.modalTitle || "نمونه کارها",
      images: state.images,
      onClose: () => {
        if (activeEl && typeof activeEl.focus === "function") activeEl.focus();
      },
    });
  });
}

function initRetry(rootEl, onRetry) {
  const btn = rootEl.querySelector("[data-portfolio-retry]");
  if (!btn) return;
  btn.addEventListener("click", onRetry);
}

export async function mountStaffPortfolio(rootEl, props = {}) {
  if (!rootEl) return;

  const {
    heading = "نمونه کار ها",
    previewCount = 4,

    // Backward compat: older code uses staffId
    staffId = null,
    artistIdOrSlug = null,

    client = null,
  } = props;

  const idOrSlug = artistIdOrSlug || staffId;

  if (!client || !idOrSlug) {
    rootEl.innerHTML = emptyTemplate({
      heading,
      message: "شناسه متخصص مشخص نیست یا کلاینت API تنظیم نشده است.",
    });
    return;
  }

  const controller = new AbortController();
  renderSkeleton(rootEl, heading);

  const load = async () => {
    renderSkeleton(rootEl, heading);

    try {
      const data = await client.list({ idOrSlug, signal: controller.signal });
      const all = normalizeImages(data?.items || []);
      const total = data?.total;

      if (!all.length) {
        rootEl.innerHTML = emptyTemplate({ heading });
        return;
      }

      rootEl.innerHTML = previewTemplate({
        images: all,
        previewCount,
        heading,
        totalCount: total,
      });

      initPortfolio(rootEl, { modalTitle: "نمونه کارها", images: all });
    } catch (err) {
      // If backend hasn't implemented the GET endpoint yet, degrade gracefully.
      // Common case right now: GET /artists/{idOrSlug}/gallery -> 405 (only POST exists in atlas-API.yaml).
      console.warn("Portfolio fetch failed:", err);

      const status = err?.status;

      if (status === 405) {
        rootEl.innerHTML = emptyTemplate({
          heading,
          message: "نمایش نمونه‌کارها هنوز از سمت API ارائه نشده است.",
        });
        return;
      }

      // Treat 404 as empty (some backends return 404 instead of an empty list)
      if (status === 404) {
        rootEl.innerHTML = emptyTemplate({ heading });
        return;
      }

      rootEl.innerHTML = errorTemplate({ heading });
      initRetry(rootEl, load);
    }
  };

  await load();

  // optional cleanup hook if caller ever wants it
  return () => controller.abort();
}
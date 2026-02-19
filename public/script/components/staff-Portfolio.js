// Staff Portfolio component
// - Shows first 4 images as preview
// - On click, opens a modal with ALL images as a scrollable list
// - API-ready client (Mock when baseUrl is empty)

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
      if (typeof it === "string") {
        return { id: `img_${i}`, url: it, alt: `نمونه کار ${i + 1}` };
      }
      if (typeof it === "object") {
        const url = it.url || it.src || "";
        if (!url) return null;
        return {
          id: String(it.id ?? `img_${i}`),
          url,
          alt: it.alt || `نمونه کار ${i + 1}`,
        };
      }
      return null;
    })
    .filter(Boolean);
}

// ---------------- API / Mock client ----------------

function getStorageKey(staffId) {
  return `sevra:portfolio:staff:${staffId}`;
}

function loadMock(staffId, seedImages = []) {
  const key = getStorageKey(staffId);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  const seed = normalizeImages(seedImages);
  const fallback =
    seed.length > 0
      ? seed
      : normalizeImages([
          "/public/assent/img/img-for-test/img-1.jpg",
          "/public/assent/img/img-for-test/img-2.jpg",
          "/public/assent/img/img-for-test/img-3.jpg",
          "/public/assent/img/img-for-test/img-4.jpg",
        ]);

  const db = { items: fallback, total: fallback.length };
  saveMock(staffId, db);
  return db;
}

function saveMock(staffId, data) {
  const key = getStorageKey(staffId);
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function createStaffPortfolioClient({ baseUrl = "", routes = {} } = {}) {
  const hasApi = Boolean(baseUrl);

  const defaultRoutes = {
    list: ({ staffId }) => `${baseUrl}/staff/${encodeURIComponent(staffId)}/portfolio`,
  };

  const r = { ...defaultRoutes, ...routes };

  async function apiFetch(url, options) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
      ...options,
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      throw new Error(msg || `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  return {
    async list({ staffId, seedImages = [] } = {}) {
      if (!staffId) throw new Error("staffId is required");

      if (hasApi) {
        const data = await apiFetch(r.list({ staffId }));
        return {
          items: normalizeImages(data?.items || data || []),
          total: Number.isFinite(Number(data?.total)) ? Number(data.total) : (data?.items || data || []).length,
        };
      }

      const db = loadMock(staffId, seedImages);
      return {
        items: normalizeImages(db.items || []),
        total: Number.isFinite(Number(db.total)) ? Number(db.total) : (db.items || []).length,
      };
    },
  };
}

// ---------------- UI ----------------

function renderSkeleton(rootEl) {
  rootEl.innerHTML = `
    <div class="space-y-3">
      <div class="flex items-center justify-start gap-2 text-lg font-extrabold text-neutral-900">
        <span class="text-primary-900">${iconSparkle("size-5")}</span>
        <span>نمونه کار ها</span>
      </div>

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

function previewTemplate({
  images,
  previewCount = 4,
  heading = "نمونه کار ها",
  totalCount,
} = {}) {
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
      <!-- ✅ عنوان بالا سمت راست + ستاره زرشکی سمت راست عنوان -->
      <div class="flex items-center justify-start gap-2 text-lg font-extrabold text-neutral-900">
        <span class="text-primary-900">${iconSparkle("size-5")}</span>
        <span>${escapeHtml(heading)}</span>
      </div>

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

  const cleanup = () => {
    document.body.style.overflow = prevOverflow;
    document.removeEventListener("keydown", onKeyDown);
    modalEl.remove();
    onClose?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") cleanup();
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

export async function mountStaffPortfolio(rootEl, props = {}) {
  if (!rootEl) return;

  const {
    heading = "نمونه کار ها",
    previewCount = 4,
    images = null,
    totalCount = undefined,

    client = null,
    staffId = null,
    seedImages = [],
  } = props;

  if (client && staffId) {
    renderSkeleton(rootEl);

    try {
      const data = await client.list({ staffId, seedImages });
      const all = normalizeImages(data?.items || []);
      rootEl.innerHTML = previewTemplate({
        images: all,
        previewCount,
        heading,
        totalCount: data?.total,
      });
      initPortfolio(rootEl, { modalTitle: "نمونه کارها", images: all });
      return;
    } catch {
      const fallback = normalizeImages(images || seedImages || []);
      rootEl.innerHTML = previewTemplate({
        images: fallback,
        previewCount,
        heading,
        totalCount: fallback.length,
      });
      initPortfolio(rootEl, { modalTitle: "نمونه کارها", images: fallback });
      return;
    }
  }

  const all = normalizeImages(images || []);
  rootEl.innerHTML = previewTemplate({
    images: all,
    previewCount,
    heading,
    totalCount,
  });
  initPortfolio(rootEl, { modalTitle: "نمونه کارها", images: all });
}

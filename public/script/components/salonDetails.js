import { mountSalonServices } from "/public/script/components/salonServices.js";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNumberFa(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  try {
    return new Intl.NumberFormat("fa-IR").format(num);
  } catch {
    return String(num);
  }
}

function iconStar(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  `;
}

function iconPin(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c-3.866 0-7 3.134-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
    </svg>
  `;
}

function iconArrowLeft(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}


const DEFAULT_TABS = [
  {
    id: "about",
    label: "توضیحات",
    content: `
      <div class="space-y-3">
        <p class="text-sm text-neutral-700 leading-7">
          اینجا متن توضیحات سالن قرار می‌گیرد. فعلاً نمونه گذاشته شده تا وقتی بک‌اند آماده شد،
          فقط داده‌ها را از API بگیری و همینجا تزریق کنی.
        </p>

        <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-bold text-neutral-900">ساعت کاری</div>
            <div class="text-sm text-neutral-700">هر روز ۱۰ تا ۲۰</div>
          </div>
        </div>

        <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-bold text-neutral-900">شماره تماس</div>
            <div class="text-sm text-neutral-700">09123456789</div>
          </div>
        </div>
      </div>
    `,
  },
  {
    id: "address",
    label: "آدرس",
    content: `
      <div class="space-y-3">
        <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
          <div class="flex items-start gap-3">
            <div class="mt-0.5 text-primary-600">${iconPin("size-5")}</div>
            <div class="min-w-0">
              <div class="text-sm font-bold text-neutral-900">آدرس سالن</div>
              <div class="mt-1 text-sm text-neutral-700 leading-7">
                تهران، سعادت‌آباد، خیابان ...، پلاک ...
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          class="w-full h-11 rounded-2xl bg-primary-900 text-neutral-0 text-sm font-bold active:scale-[0.99] transition"
        >
          مسیریابی (بعداً وصل می‌کنی)
        </button>
      </div>
    `,
  },
  {
    id: "services",
    label: "سرویس ها",
    content: `
      <div class="space-y-4">
        <div class="text-sm text-neutral-700 leading-7">
          خدمات سالن را می‌توانید از اینجا مرور کنید. فعلاً داده‌ها نمونه است تا وقتی API آماده شد،
          فقط داده‌ها را از بک‌اند بگیری و به این بخش پاس بدهی.
        </div>

        <!-- Services mount point -->
        <div data-services-root></div>
      </div>
    `,
  },
  {
    id: "staff",
    label: "کارکنان",
    content: `
      <div class="space-y-3">
        <div class="grid gap-3">
          ${[
            { name: "حدیث", role: "مدیر سالن" },
            { name: "سارا", role: "میکاپ آرتیست" },
            { name: "نگار", role: "ناخن کار" },
          ]
            .map(
              (p) => `
                <div class="flex items-center gap-3 rounded-2xl border border-neutral-50 bg-neutral-0 p-3">
                  <div class="size-11 rounded-full bg-neutral-50 grid place-items-center text-primary-600 font-bold">${escapeHtml(
                    p.name
                  ).slice(0, 1)}</div>
                  <div class="min-w-0">
                    <div class="text-sm font-bold text-neutral-900">${escapeHtml(p.name)}</div>
                    <div class="text-sm text-neutral-700">${escapeHtml(p.role)}</div>
                  </div>
                  <div class="ms-auto">
                    <button type="button" class="h-9 rounded-full border border-neutral-50 bg-neutral-0 px-3 text-sm text-primary-900">
                      رزرو (بعداً)
                    </button>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `,
  },
];

function detailsTemplate(props) {
  const {
    salonId,
    name,
    avatarSrc,
    rating,
    commentsCount,
    commentsPageUrl,
    commentsButtonLabel = "اطلاعات و نظرات",
    tabs = DEFAULT_TABS,
    activeTabId = tabs?.[0]?.id || "about",
  } = props;

  const safeName = escapeHtml(name || "سالن زیبایی (نمونه)");
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : "0.0";
  const commentsCountText = formatNumberFa(commentsCount);

  const href =
    commentsPageUrl ||
    `./comments.html?entityType=salon&entityId=${encodeURIComponent(salonId || "salon-1")}&name=${encodeURIComponent(name || "")}&back=${encodeURIComponent(window.location.pathname + window.location.search)}`;

  const tabButtons = (tabs || [])
    .map((t) => {
      const isActive = t.id === activeTabId;
      return `
        <button
          type="button"
          role="tab"
          aria-selected="${isActive ? "true" : "false"}"
          tabindex="${isActive ? "0" : "-1"}"
          class="h-10 shrink-0 rounded-full px-4 text-sm font-bold transition border ${
            isActive
              ? "bg-primary-900 text-neutral-0 border-primary-900"
              : "bg-neutral-0 text-neutral-900 border-neutral-50"
          }"
          data-tab-btn
          data-tab-id="${escapeHtml(t.id)}"
        >
          ${escapeHtml(t.label)}
        </button>
      `;
    })
    .join("");

  const tabPanels = (tabs || [])
    .map((t) => {
      const isActive = t.id === activeTabId;
      return `
        <div
          role="tabpanel"
          class="${isActive ? "" : "hidden"}"
          data-tab-panel
          data-tab-id="${escapeHtml(t.id)}"
        >
          ${t.content || ""}
        </div>
      `;
    })
    .join("");

  const DEFAULT_AVATAR_SRC = "/public/assent/img/img-for-test/img-1.jpg";

const avatarNode = `<img
  src="${escapeHtml(avatarSrc || DEFAULT_AVATAR_SRC)}"
  alt="${safeName}"
  class="h-full w-full object-cover"
  draggable="false"
/>`;

  return `
    <section dir="rtl" class="bg-neutral-0">
      <div class="px-4 pb-8">
        <!-- Sticky: هدرِ جزئیات + تب‌ها (زیر هدر اصلی سایت) -->
        <div class="sticky top-14 z-40 -mx-4 px-4 pt-4 pb-3 bg-neutral-0/95 backdrop-blur border-b border-neutral-50">
          <!-- Top row -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="salon-avatar size-11 rounded-full border border-neutral-50 bg-neutral-0 grid place-items-center">
                ${avatarNode}
              </div>

              <div class="min-w-0">
                <h1 class="text-lg font-bold tracking-tight text-neutral-900 truncate">
                  ${safeName}
                </h1>

                <!-- Rating + comments count -->
                <div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-900">
                  <div class="inline-flex items-center gap-1">
                    <span class="tabular-nums">${escapeHtml(safeRating)}</span>
                    <span class="text-primary-900">${iconStar("size-4")}</span>
                  </div>

                  ${commentsCountText ? `<div class="text-neutral-700">${escapeHtml(commentsCountText)} نظر</div>` : ""}
                </div>
              </div>
            </div>

            <!-- Button: go to comments page -->
            <a
              href="${href}"
              class="group shrink-0 inline-flex items-center gap-2 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-2 text-sm text-neutral-900 shadow-sm transition active:scale-[0.99] hover:bg-neutral-50 hover:border-neutral-100 hover:shadow-md"
              aria-label="رفتن به صفحه نظرات"
            >
              <span>${escapeHtml(commentsButtonLabel)}</span>
              <span class="size-5 rounded-full bg-neutral-50 grid place-items-center text-neutral-900 transition group-hover:bg-neutral-0">
                ${iconArrowLeft("size-4")}
              </span>
            </a>
          </div>

          <!-- Tabs (more breathing room) -->
          <div class="mt-5">
            <div
              class="flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Salon sections"
              data-tablist
            >
              ${tabButtons}
            </div>
          </div>
        </div>

        <!-- Panels (not sticky) -->
        <div class="pt-6">
          ${tabPanels}
        </div>
      </div>
    </section>
  `;
}

export function mountSalonDetails(rootEl, props = {}) {
  if (!rootEl) return;

  // برای اتصال به API بعداً:
  // fetch(...).then(data => mountSalonDetails(rootEl, mapApiToProps(data)))
  rootEl.innerHTML = detailsTemplate(props);
  initTabs(rootEl);

  // Mount services (UI first; data later)
  const servicesRoot = rootEl.querySelector("[data-services-root]");
  if (servicesRoot) {
    mountSalonServices(servicesRoot, props.services || {});
  }
}

function initTabs(rootEl) {
  const btns = [...rootEl.querySelectorAll("[data-tab-btn]")];
  const panels = [...rootEl.querySelectorAll("[data-tab-panel]")];

  if (!btns.length || !panels.length) return;

  const setActive = (id) => {
    btns.forEach((b) => {
      const isActive = b.dataset.tabId === id;
      b.setAttribute("aria-selected", isActive ? "true" : "false");
      b.tabIndex = isActive ? 0 : -1;
      b.classList.toggle("bg-primary-900", isActive);
      b.classList.toggle("text-neutral-0", isActive);
      b.classList.toggle("border-primary-900", isActive);
      b.classList.toggle("bg-neutral-0", !isActive);
      b.classList.toggle("text-neutral-900", !isActive);
      b.classList.toggle("border-neutral-50", !isActive);
    });

    panels.forEach((p) => {
      const show = p.dataset.tabId === id;
      p.classList.toggle("hidden", !show);
    });
  };

  btns.forEach((b) => {
    b.addEventListener("click", () => setActive(b.dataset.tabId));
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();

      const dir = e.key === "ArrowLeft" ? 1 : -1; // RTL friendly
      const idx = btns.indexOf(b);
      const next = (idx + dir + btns.length) % btns.length;
      btns[next].focus();
      setActive(btns[next].dataset.tabId);
    });
  });
}

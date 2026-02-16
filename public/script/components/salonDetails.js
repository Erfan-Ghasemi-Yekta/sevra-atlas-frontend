import { mountComments } from "/public/script/components/comments.js";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function iconChevronDown(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clip-rule="evenodd"/>
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
      

        <!-- Comments mount point (زیر توضیحات) -->
        <div data-comments-slot></div>
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
        <div class="flex flex-wrap gap-2">
          ${[
            "کوتاهی مو",
            "رنگ و مش",
            "مانیکور",
            "پدیکور",
            "پاکسازی پوست",
            "میکاپ",
          ]
            .map(
              (t) =>
                `<span class="inline-flex items-center rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-neutral-900">${escapeHtml(
                  t
                )}</span>`
            )
            .join("")}
        </div>

        <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm font-bold text-neutral-900">لیست کامل خدمات</div>
            <div class="text-sm text-primary-600 inline-flex items-center gap-1">
              مشاهده ${iconChevronDown("size-4")}
            </div>
          </div>
          <div class="mt-2 text-sm text-neutral-700 leading-7">
            این بخش می‌تونه بعداً به API وصل بشه و به شکل آکاردئون/لیست قیمت نمایش داده بشه.
          </div>
        </div>
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
    name,
    location,
    rating,
    badges = [],
    tabs = DEFAULT_TABS,
    activeTabId = tabs?.[0]?.id || "about",
  } = props;

  const safeName = escapeHtml(name || "سالن زیبایی (نمونه)");
  const safeLocation = escapeHtml(location || "تهران، سعادت‌آباد");
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : "4.8";

  const extraBadges = (badges || [])
    .filter(Boolean)
    .map(
      (b) => `
        <span class="inline-flex items-center rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-primary-900">
          ${escapeHtml(b)}
        </span>
      `
    )
    .join("");

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

  return `
    <section dir="rtl" class="bg-neutral-0">
      <div class="px-4 pt-4 pb-6">
        <!-- Title + meta -->
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <h1 class="text-lg font-bold tracking-tight text-neutral-900">
              ${safeName}
            </h1>

            <!-- Rating pill -->
            <span class="inline-flex items-center gap-1 rounded-full bg-primary-900 text-neutral-0 px-3 py-1 text-sm font-bold">
              ${iconStar("size-4 text-accent-500")}
              <span>${safeRating}</span>
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Location -->
            <div class="inline-flex items-center gap-1 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-neutral-700">
              <span class="text-primary-600">${iconPin("size-4")}</span>
              <span class="truncate">${safeLocation}</span>
            </div>

            <!-- Extra badges (مثل: پرطرفدار) -->
            ${extraBadges}
          </div>
        </div>

        <!-- Tabs -->
        <div class="mt-4">
          <div
            class="flex gap-2 overflow-x-auto pb-1"
            role="tablist"
            aria-label="Salon sections"
            data-tablist
          >
            ${tabButtons}
          </div>

          <div class="mt-4">
            ${tabPanels}
          </div>
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
  initComments(rootEl, props);
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


function initComments(rootEl, props) {
  const slot = rootEl.querySelector("[data-comments-slot]");
  if (!slot) return;

  const cfg = props?.comments || {};
  const entityType = cfg.entityType || "salon";
  const entityId = cfg.entityId || props?.salonId || "demo-salon";
  const client = cfg.client; // optional

  mountComments(slot, {
    entityType,
    entityId,
    client,
    currentUser: cfg.currentUser || { name: "شما" },
  });
}

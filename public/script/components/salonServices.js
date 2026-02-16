function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconSearch(className = "size-5") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 2a8 8 0 1 1 5.293 14.02l4.344 4.344a1 1 0 0 1-1.414 1.414l-4.344-4.344A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
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

function formatNumberFa(n) {
  try {
    return new Intl.NumberFormat("fa-IR").format(n);
  } catch {
    return String(n);
  }
}

function normalizeServices(input = {}) {
  // شکل پیشنهادی برای API:
  // { categories: [{ id, title, items: [{ id, title, price, durationMin, note, isPopular }] }] }
  const categories = Array.isArray(input.categories) ? input.categories : null;

  if (categories && categories.length) {
    return {
      title: input.title || "سرویس‌ها",
      categories: categories.map((c, idx) => ({
        id: c.id || `cat-${idx + 1}`,
        title: c.title || "بدون عنوان",
        items: Array.isArray(c.items) ? c.items : [],
      })),
    };
  }

  // نمونه‌ی پیش‌فرض (فعلاً برای UI)
  return {
    title: "سرویس‌ها",
    categories: [
      {
        id: "hair",
        title: "مو",
        items: [
          { id: "haircut", title: "کوتاهی مو", price: 250000, durationMin: 40, note: "مناسب فرم‌دهی و استایل" },
          { id: "blowdry", title: "براشینگ", price: 180000, durationMin: 30, note: "حجم‌دهی و حالت‌دهی" },
          { id: "color", title: "رنگ و مش", price: 1200000, durationMin: 150, note: "با مواد درجه یک", isPopular: true },
        ],
      },
      {
        id: "nails",
        title: "ناخن",
        items: [
          { id: "manicure", title: "مانیکور", price: 220000, durationMin: 45, note: "مرتب‌سازی و تقویت" },
          { id: "pedicure", title: "پدیکور", price: 280000, durationMin: 60, note: "به‌همراه اسکراب", isPopular: true },
        ],
      },
      {
        id: "skin",
        title: "پوست و میکاپ",
        items: [
          { id: "facial", title: "پاکسازی پوست", price: 450000, durationMin: 75, note: "همراه با ماسک" },
          { id: "makeup", title: "میکاپ", price: 900000, durationMin: 90, note: "مناسب مراسم" },
        ],
      },
    ],
  };
}

function buildChip({ id, label, isActive }) {
  const active = isActive
    ? "bg-primary-900 text-neutral-0 border-primary-900"
    : "bg-neutral-0 text-neutral-900 border-neutral-50";
  return `
    <button
      type="button"
      data-sv-chip="${escapeHtml(id)}"
      class="h-9 px-4 rounded-2xl border text-sm font-bold ${active} transition active:scale-[0.99]"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function buildServiceItem(item) {
  const priceText = typeof item.price === "number" ? formatNumberFa(item.price) : escapeHtml(item.price || "—");
  const durationText =
    typeof item.durationMin === "number" ? `${formatNumberFa(item.durationMin)} دقیقه` : escapeHtml(item.duration || "—");

  return `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <div class="text-sm font-bold text-neutral-900">${escapeHtml(item.title || "")}</div>
            ${
              item.isPopular
                ? `<span class="inline-flex items-center rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-xs text-primary-600">پرطرفدار</span>`
                : ""
            }
          </div>

          <div class="mt-2 flex flex-wrap gap-2">
            <span class="inline-flex items-center rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-neutral-900">
              زمان: ${escapeHtml(durationText)}
            </span>
            <span class="inline-flex items-center rounded-full border border-neutral-50 bg-neutral-0 px-3 py-1 text-sm text-neutral-900">
              قیمت: ${escapeHtml(priceText)} تومان
            </span>
          </div>

          ${item.note ? `<div class="mt-2 text-sm text-neutral-700 leading-7">${escapeHtml(item.note)}</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

function template(model, state) {
  const chips = [
    { id: "all", label: "همه" },
    ...model.categories.map((c) => ({ id: c.id, label: c.title })),
  ];

  const q = state.query.trim().toLowerCase();
  const filterCategory = state.activeCategoryId;

  const visibleCats = model.categories
    .filter((c) => filterCategory === "all" || c.id === filterCategory)
    .map((c) => {
      const items = c.items.filter((it) => {
        if (!q) return true;
        const hay = `${it.title || ""} ${it.note || ""}`.toLowerCase();
        return hay.includes(q);
      });

      return { ...c, items };
    })
    .filter((c) => c.items.length > 0);

  const hasAny = visibleCats.length > 0;

  return `
    <div class="space-y-4">
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="flex items-center gap-2">
          <div class="text-neutral-700">${iconSearch("size-5")}</div>
          <input
            data-sv-search
            type="text"
            value="${escapeHtml(state.query)}"
            class="w-full h-11 rounded-2xl border border-neutral-50 bg-neutral-0 px-4 text-sm text-neutral-900 outline-none focus:ring-2 focus:ring-primary-900/20"
            placeholder="جستجو در خدمات..."
            aria-label="جستجو در خدمات"
          />
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          ${chips.map((ch) => buildChip({ id: ch.id, label: ch.label, isActive: ch.id === state.activeCategoryId })).join("")}
        </div>
      </div>

      ${
        hasAny
          ? visibleCats
              .map((cat, idx) => {
                const isOpen = state.openCategoryIds.has(cat.id) || (idx === 0 && state.openCategoryIds.size === 0);
                const btnActive = isOpen ? "text-primary-600" : "text-neutral-700";
                const chevron = isOpen ? "rotate-180" : "";

                return `
                  <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
                    <button
                      type="button"
                      data-sv-acc-btn="${escapeHtml(cat.id)}"
                      class="w-full flex items-center justify-between gap-3"
                      aria-expanded="${isOpen ? "true" : "false"}"
                    >
                      <div class="min-w-0">
                        <div class="text-sm font-bold text-neutral-900">${escapeHtml(cat.title)}</div>
                        <div class="mt-1 text-sm text-neutral-700">${formatNumberFa(cat.items.length)} مورد</div>
                      </div>
                      <div class="inline-flex items-center gap-1 ${btnActive}">
                        ${iconChevronDown(`size-4 ${chevron}`)}
                      </div>
                    </button>

                    <div class="mt-3 space-y-3 ${isOpen ? "" : "hidden"}" data-sv-acc-panel="${escapeHtml(cat.id)}">
                      ${cat.items.map(buildServiceItem).join("")}
                    </div>
                  </div>
                `;
              })
              .join("")
          : `
            <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
              <div class="text-sm font-bold text-neutral-900">موردی پیدا نشد</div>
              <div class="mt-1 text-sm text-neutral-700 leading-7">
                فیلترها را تغییر بده یا متن جستجو را کوتاه‌تر کن.
              </div>
            </div>
          `
      }

      <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4">
        <div class="text-sm text-neutral-700 leading-7">
          نکته: این بخش فعلاً نمونه‌ی UI است. بعداً داده‌ها را از API می‌گیری و به <span class="font-bold text-neutral-900">mountSalonServices</span> پاس می‌دهی.
        </div>
      </div>
    </div>
  `;
}

export function mountSalonServices(rootEl, props = {}) {
  if (!rootEl) return;

  const model = normalizeServices(props);

  const state = {
    query: "",
    activeCategoryId: "all",
    openCategoryIds: new Set([model.categories[0]?.id].filter(Boolean)),
  };

  const render = () => {
    rootEl.innerHTML = template(model, state);
  };

  render();

  // Event delegation
  rootEl.addEventListener("input", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.matches("[data-sv-search]")) {
      state.query = t.value || "";
      render();
    }
  });

  rootEl.addEventListener("click", (e) => {
    const el = e.target instanceof HTMLElement ? e.target : null;
    if (!el) return;

    const chip = el.closest("[data-sv-chip]");
    if (chip) {
      const id = chip.getAttribute("data-sv-chip") || "all";
      state.activeCategoryId = id;
      // وقتی روی یک دسته خاص می‌ری، همون دسته رو باز کن
      if (id !== "all") state.openCategoryIds = new Set([id]);
      render();
      return;
    }

    const acc = el.closest("[data-sv-acc-btn]");
    if (acc) {
      const id = acc.getAttribute("data-sv-acc-btn");
      if (!id) return;

      if (state.openCategoryIds.has(id)) state.openCategoryIds.delete(id);
      else state.openCategoryIds.add(id);

      render();
    }
  });
}

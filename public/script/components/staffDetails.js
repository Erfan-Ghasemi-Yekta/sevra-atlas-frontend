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
  if (!Number.isFinite(num)) return escapeHtml(String(n ?? ""));
  return num.toLocaleString("fa-IR");
}

function formatTomanShort(price) {
  const p = Number(price);
  if (!Number.isFinite(p)) return escapeHtml(String(price ?? "—"));

  if (p >= 1_000_000) {
    const v = p / 1_000_000;
    const fixed = Number.isInteger(v) ? v.toFixed(0) : v.toFixed(1);
    return `${Number(fixed).toLocaleString("fa-IR")} میلیون تومان`;
  }
  if (p >= 1_000) return `${formatNumberFa(Math.round(p / 1_000))} هزار تومان`;
  return `${formatNumberFa(p)} تومان`;
}

function iconSparkle(className = "size-5") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.2 4.2L17.4 8l-4.2 1.2L12 13.4l-1.2-4.2L6.6 8l4.2-1.8L12 2zM19 12l.8 2.8L22.6 16l-2.8.8L19 19.6l-.8-2.8L15.4 16l2.8-1.2L19 12zM5 13l.7 2.3L8 16l-2.3.7L5 19l-.7-2.3L2 16l2.3-.7L5 13z"/>
    </svg>
  `;
}

function iconClock(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2zm1 11h-5V7h2v4h3z"/>
    </svg>
  `;
}

function iconMoney(className = "size-4") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 7h18v10H3V7zm2 2v6h14V9H5zm7 1a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
    </svg>
  `;
}

function normalize(props = {}) {
  const specialties = Array.isArray(props.specialties) ? props.specialties : null;

  const fallback = [
    { id: "classic-bridal", title: "آرایش عروس کلاسیک", priceToman: 280000, durationMin: 90 },
    { id: "contouring", title: "گریم تخصصی و کانتورینگ", priceToman: 280000, durationMin: 90 },
  ];

  return {
    description:
      props.description ??
      "با بیش از 5 سال تجربه در زمینه آرایش تخصصی عروس، تمرکز من روی\nطبیعی‌سازی چهره و ماندگاری بالا در طول مراسم است.\nهر خدمات متناسب با فرم صورت و سلیقه شما شخصی‌سازی می‌شود.",
    title: props.title || "تخصص ها",
    specialties: (specialties && specialties.length ? specialties : fallback).map((it, idx) => ({
      id: it.id || `sp-${idx + 1}`,
      title: it.title || "بدون عنوان",
      priceToman: it.priceToman ?? it.price ?? 0,
      durationMin: it.durationMin ?? it.duration ?? 0,
    })),
  };
}

function descriptionTemplate(text) {
  const lines = String(text || "").split("\n").map((l) => l.trim()).filter(Boolean);

  return `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
      <div class="text-sm text-neutral-700 leading-7" style="border-right: 3px solid var(--color-primary-600); padding-right: 12px;">
        ${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
      </div>
    </div>
  `;
}

function specialtyItemTemplate(item) {
  return `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="w-1 h-5 rounded-full" style="background: var(--color-primary-600);"></span>
            <div class="text-sm font-bold text-primary-900">
              ${escapeHtml(item.title)}
            </div>
          </div>

          <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-700">
            <span class="inline-flex items-center gap-1">
              <span class="text-primary-900">${iconMoney("size-4")}</span>
              <span>${escapeHtml(formatTomanShort(item.priceToman))}</span>
            </span>

            <span class="inline-flex items-center gap-1">
              <span class="text-primary-900">${iconClock("size-4")}</span>
              <span>${formatNumberFa(item.durationMin)} دقیقه</span>
            </span>
          </div>
        </div>

        <!-- ✅ دایره حذف شد -->
      </div>
    </div>
  `;
}

function template(model) {
  return `
    <div class="space-y-4">
      ${descriptionTemplate(model.description)}

      <div class="pt-1">
        <div class="flex items-center justify-start gap-2 text-lg font-extrabold text-neutral-900">
          <span class="text-primary-900">${iconSparkle("size-5")}</span>
          <span>${escapeHtml(model.title)}</span>
        </div>

        <div class="mt-3 space-y-3">
          ${model.specialties.map((it) => specialtyItemTemplate(it)).join("")}
        </div>
      </div>
    </div>
  `;
}

export function mountStaffDetails(rootEl, props = {}) {
  if (!rootEl) return;
  const model = normalize(props);
  rootEl.innerHTML = template(model);
}

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
  if (!Number.isFinite(p) || p <= 0) return "—";

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
  const specialtiesInput = Array.isArray(props.specialties) ? props.specialties : [];

  const description = String(props.description ?? "").trim();

  const specialties = specialtiesInput
    .map((it, idx) => {
      if (!it) return null;

      const title = it.title ?? it.nameFa ?? it.name ?? it.label ?? "";
      const priceToman = it.priceToman ?? it.price ?? it.priceIRR ?? it.priceIrr ?? 0;
      const durationMin = it.durationMin ?? it.duration ?? it.durationMinutes ?? 0;

      return {
        id: String(it.id ?? it.slug ?? `sp-${idx + 1}`),
        title: String(title || "بدون عنوان"),
        priceToman: Number(priceToman) || 0,
        durationMin: Number(durationMin) || 0,
      };
    })
    .filter(Boolean);

  return {
    title: props.title || "تخصص‌ها",
    description,
    specialties,
  };
}

function descriptionTemplate(text) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) {
    return `
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="text-sm text-neutral-700 leading-7" style="border-right: 3px solid var(--color-primary-600); padding-right: 12px;">
          <p>توضیحی برای این متخصص ثبت نشده است.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
      <div class="text-sm text-neutral-700 leading-7" style="border-right: 3px solid var(--color-primary-600); padding-right: 12px;">
        ${lines.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
      </div>
    </div>
  `;
}

function specialtyItemTemplate(item) {
  const hasPrice = Number.isFinite(Number(item.priceToman)) && Number(item.priceToman) > 0;
  const hasDuration = Number.isFinite(Number(item.durationMin)) && Number(item.durationMin) > 0;

  const metaParts = [
    hasPrice
      ? `
        <span class="inline-flex items-center gap-1">
          <span class="text-primary-900">${iconMoney("size-4")}</span>
          <span>${escapeHtml(formatTomanShort(item.priceToman))}</span>
        </span>
      `
      : null,
    hasDuration
      ? `
        <span class="inline-flex items-center gap-1">
          <span class="text-primary-900">${iconClock("size-4")}</span>
          <span>${formatNumberFa(item.durationMin)} دقیقه</span>
        </span>
      `
      : null,
  ].filter(Boolean);

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

          ${
            metaParts.length
              ? `
                <div class="mt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-700">
                  ${metaParts.join("")}
                </div>
              `
              : `
                <div class="mt-2 text-xs text-neutral-700">
                  جزئیات قیمت/مدت زمان ثبت نشده است.
                </div>
              `
          }
        </div>
      </div>
    </div>
  `;
}

function template(model) {
  const hasSpecialties = Array.isArray(model.specialties) && model.specialties.length > 0;

  return `
    <div class="space-y-4">
      ${descriptionTemplate(model.description)}

      <div class="pt-1">
        <div class="flex items-center justify-start gap-2 text-lg font-extrabold text-neutral-900">
          <span class="text-primary-900">${iconSparkle("size-5")}</span>
          <span>${escapeHtml(model.title)}</span>
        </div>

        <div class="mt-3 space-y-3">
          ${
            hasSpecialties
              ? model.specialties.map((it) => specialtyItemTemplate(it)).join("")
              : `
                <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4 text-sm text-neutral-700">
                  تخصصی برای این متخصص ثبت نشده است.
                </div>
              `
          }
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

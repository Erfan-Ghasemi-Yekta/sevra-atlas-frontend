function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function iconStar(className = "size-5") {
  return `
    <svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  `;
}

function profileTemplate({ name, role, rating, avatarSrc } = {}) {
  const safeName = escapeHtml(name || "کارکن (نمونه)");
  const safeRole = escapeHtml(role || "عنوان شغلی");
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating).toFixed(1) : "4.8";

  const avatar = avatarSrc
    ? `<img src="${escapeHtml(avatarSrc)}" alt="${safeName}" class="size-11 rounded-full object-cover border border-neutral-50" />`
    : `<div class="size-11 rounded-full bg-neutral-50 grid place-items-center text-primary-600 font-bold">${safeName.slice(0, 1)}</div>`;

  return `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="text-lg font-bold tracking-tight text-neutral-900">${safeName}</div>
          <div class="mt-1 text-sm text-neutral-700">${safeRole}</div>
        </div>
        <div class="shrink-0">${avatar}</div>
      </div>

      <!-- Rating (بدون تعداد نظرات و بدون مشاهده نظرات) -->
      <div class="mt-4 flex items-center gap-2">
        <span class="text-accent-500">${iconStar("size-5")}</span>
        <span class="text-sm font-bold text-neutral-900">${safeRating}</span>
      </div>
    </div>
  `;
}

export function mountStaffProfile(rootEl, props = {}) {
  if (!rootEl) return;
  rootEl.innerHTML = profileTemplate(props);
}

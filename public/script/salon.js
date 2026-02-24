// File: /public/script/salon.js

import { mountHeader } from "/public/script/components/header.js";
import { mountSalonGallery } from "/public/script/components/salon-Gallery.js";
import { mountSalonDetails } from "/public/script/components/salon-Details.js";
import { salonsApi } from "/public/script/api/apiClient.js";
import { enableStickyHeader } from "/public/script/utils/stickyHeader.js";

// ----------------- helpers -----------------
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeTel(phone = "") {
  // حذف فاصله/خط تیره برای لینک tel
  return String(phone).replace(/[^\d+]/g, "");
}

function normalizeInstagram(insta = "") {
  const s = String(insta).trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  const handle = s.replace(/^@/, "");
  return `https://instagram.com/${encodeURIComponent(handle)}`;
}

function toNumberOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function renderLoading(el, { height = 160 } = {}) {
  if (!el) return;
  el.innerHTML = `
    <div class="px-4 pt-4">
      <div class="rounded-2xl border border-neutral-50 bg-neutral-50 animate-pulse" style="height:${height}px"></div>
    </div>
  `;
}

function renderError(el, message) {
  if (!el) return;
  el.innerHTML = `
    <div class="px-4 pt-4">
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="text-sm font-bold text-neutral-900">خطا در دریافت اطلاعات</div>
        <div class="mt-2 text-sm text-neutral-700 leading-7">${escapeHtml(message || "مشکلی پیش آمد.")}</div>
        <button
          type="button"
          class="mt-4 inline-flex items-center justify-center rounded-full bg-primary-900 px-4 py-2 text-sm font-bold text-neutral-0"
          id="retry-btn"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  `;

  const btn = el.querySelector("#retry-btn");
  if (btn) btn.addEventListener("click", () => window.location.reload());
}

// ----------------- mount header immediately -----------------
const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  logoSrc: "/public/assets/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});
enableStickyHeader(headerRoot, { threshold: 8 });

// ----------------- roots -----------------
const galleryRoot = document.getElementById("salon-gallery");
const detailsRoot = document.getElementById("salon-details");

// skeletons (no static content)
renderLoading(galleryRoot, { height: 220 });
renderLoading(detailsRoot, { height: 260 });

// ----------------- main -----------------
async function main() {
  const qs = new URLSearchParams(window.location.search);

  // پشتیبانی از چند نام پارامتر (برای اینکه لینک‌های قبلی خراب نشن)
  const idOrSlug =
    qs.get("salonId") ||
    qs.get("idOrSlug") ||
    qs.get("slug") ||
    qs.get("id");

  if (!idOrSlug) {
    renderError(detailsRoot, "پارامتر salonId در آدرس صفحه وجود ندارد.");
    if (galleryRoot) galleryRoot.innerHTML = "";
    return;
  }

  try {
    // Fetch in parallel
    const [salon, salonServices, salonGallery] = await Promise.all([
      salonsApi.getByIdOrSlug(idOrSlug),
      // Newer API: salon-specific services (has price/duration per salon)
      salonsApi.listServices(idOrSlug).catch(() => []),
      // Newer API: salon gallery (paginated)
      salonsApi.listGallery(idOrSlug, { page: 1, pageSize: 30 }).catch(() => null),
    ]);

    // -------- Gallery --------
    const avatarUrl = salon?.avatar?.url || "";
    const galleryItems = Array.isArray(salonGallery?.items) ? salonGallery.items : [];
    const galleryUrls = galleryItems.map((m) => m?.url).filter(Boolean);

    const images = galleryUrls.length ? galleryUrls : avatarUrl ? [avatarUrl] : [];
    if (images.length) {
      mountSalonGallery(galleryRoot, { images, alt: salon?.name || "Salon" });
    } else if (galleryRoot) {
      galleryRoot.innerHTML = "";
    }

    // -------- Tabs --------
    const tabs = [];

    // About tab (description/summary + contact)
    const aboutParts = [];

    const desc = salon?.description || salon?.summary || "";
    if (desc) {
      aboutParts.push(`
        <p class="text-sm text-neutral-700 leading-7">
          ${escapeHtml(desc)}
        </p>
      `);
    }

    const contactRows = [];
    if (salon?.addressLine) {
      contactRows.push(`
        <div class="flex items-start justify-between gap-3">
          <div class="text-sm font-bold text-neutral-900">آدرس</div>
          <div class="text-sm text-neutral-700 text-left leading-7">${escapeHtml(salon.addressLine)}</div>
        </div>
      `);
    }
    if (salon?.phone) {
      const tel = normalizeTel(salon.phone);
      contactRows.push(`
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-bold text-neutral-900">تلفن</div>
          <a class="text-sm text-primary-900 font-bold" href="tel:${escapeHtml(tel)}">${escapeHtml(salon.phone)}</a>
        </div>
      `);
    }
    if (salon?.website) {
      contactRows.push(`
        <div class="flex items-center justify-between gap-3">
          <div class="text-sm font-bold text-neutral-900">وب‌سایت</div>
          <a class="text-sm text-primary-900 font-bold" href="${escapeHtml(salon.website)}" target="_blank" rel="noreferrer">مشاهده</a>
        </div>
      `);
    }
    if (salon?.instagram) {
      const instaUrl = normalizeInstagram(salon.instagram);
      if (instaUrl) {
        contactRows.push(`
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-bold text-neutral-900">اینستاگرام</div>
            <a class="text-sm text-primary-900 font-bold" href="${escapeHtml(instaUrl)}" target="_blank" rel="noreferrer">
              ${escapeHtml(String(salon.instagram).replace(/^https?:\/\/(www\.)?instagram\.com\//, "@"))}
            </a>
          </div>
        `);
      }
    }

    if (contactRows.length) {
      aboutParts.push(`
        <div class="rounded-2xl border border-neutral-50 bg-neutral-50 p-4 space-y-3">
          ${contactRows.join("")}
        </div>
      `);
    }

    tabs.push({
      id: "about",
      label: "توضیحات",
      content: `<div class="space-y-3">${aboutParts.join("") || `<div class="text-sm text-neutral-700">توضیحاتی ثبت نشده است.</div>`}</div>`,
    });

    // Services tab (salon-specific)
    const groups = Array.isArray(salonServices) ? salonServices : [];
    const hasAnyService = groups.some((g) => Array.isArray(g?.services) && g.services.length);

    let servicesModel = null;
    if (hasAnyService) {
      servicesModel = {
        title: "سرویس‌ها",
        categories: groups
          .map((g, idx) => {
            const cat = g?.category || {};
            const services = Array.isArray(g?.services) ? g.services : [];

            const items = services
              .filter((s) => s && (s.isActive === undefined || s.isActive === true))
              .map((s, sIdx) => {
                const priceNum = toNumberOrNull(s?.priceToman);
                const durationNum = s?.durationMin === null || s?.durationMin === undefined ? null : Number(s.durationMin);

                return {
                  id: String(s?.serviceId ?? s?.id ?? `${cat?.id || idx}-${sIdx}`),
                  title: s?.nameFa || s?.title || "",
                  note: s?.notes || s?.note || s?.description || "",
                  // Keep both naming styles (in case UI component expects one)
                  priceToman: priceNum,
                  price: priceNum,
                  durationMin: Number.isFinite(durationNum) ? durationNum : null,
                  duration: Number.isFinite(durationNum) ? durationNum : null,
                };
              });

            return {
              id: cat?.id || `cat-${idx + 1}`,
              title: cat?.nameFa || cat?.title || "بدون عنوان",
              items,
            };
          })
          .filter((c) => c.items && c.items.length),
      };

      tabs.push({
        id: "services",
        label: "سرویس‌ها",
        content: `
          <div class="space-y-3">
            <div data-services-root></div>
          </div>
        `,
      });
    }

    // -------- Details mount --------
    const commentsPageUrl = `/public/comments.html?entityType=salon&entityId=${encodeURIComponent(
      salon?.id || idOrSlug
    )}&back=${encodeURIComponent(
      `/public/salon.html?salonId=${encodeURIComponent(idOrSlug)}`
    )}&name=${encodeURIComponent(salon?.name || "")}`;

    mountSalonDetails(detailsRoot, {
      salonId: salon?.id || idOrSlug,
      name: salon?.name || "",
      avatarSrc: avatarUrl || null,
      rating: salon?.avgRating ?? 0,
      commentsCount: salon?.reviewCount ?? 0,
      commentsPageUrl,
      tabs,
      activeTabId: tabs?.[0]?.id || "about",
      ...(servicesModel ? { services: servicesModel } : {}),
    });
  } catch (err) {
    const msg = err?.message || "خطای ناشناخته";
    renderError(detailsRoot, msg);
    if (galleryRoot) galleryRoot.innerHTML = "";
  }
}

main();

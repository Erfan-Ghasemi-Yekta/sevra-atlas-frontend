import { mountHeader } from "/public/script/components/header.js";
import { mountStaffPortfolio, createStaffPortfolioClient } from "/public/script/components/staff-Portfolio.js";
import { mountStaffProfile } from "/public/script/components/staff-Profile.js";
import { mountStaffDetails } from "/public/script/components/staff-Details.js";
import { artistsApi } from "/public/script/api/apiClient.js";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getArtistIdOrSlug() {
  const url = new URL(window.location.href);
  const p = url.searchParams;

  // Common query keys we might get from routing
  return (
    p.get("artist") ||
    p.get("artistId") ||
    p.get("idOrSlug") ||
    p.get("slug") ||
    p.get("id") ||
    p.get("staff") ||
    p.get("staffId") ||
    ""
  ).trim();
}

function renderSectionMessage(rootEl, { title = "", message = "", variant = "info" } = {}) {
  if (!rootEl) return;

  const border = variant === "error" ? "border-red-100" : "border-neutral-50";
  const bg = variant === "error" ? "bg-red-50/40" : "bg-neutral-0";
  const text = variant === "error" ? "text-red-700" : "text-neutral-700";

  rootEl.innerHTML = `
    <div class="rounded-2xl border ${border} ${bg} p-4">
      ${title ? `<div class="text-sm font-bold text-neutral-900">${escapeHtml(title)}</div>` : ""}
      <div class="mt-1 text-sm ${text}">${escapeHtml(message)}</div>
    </div>
  `;
}

function renderProfileSkeleton(rootEl) {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <div class="size-14 rounded-full bg-neutral-50"></div>
          <div class="min-w-0">
            <div class="h-5 w-40 bg-neutral-50 rounded"></div>
            <div class="mt-2 h-4 w-56 bg-neutral-50 rounded"></div>
          </div>
        </div>
        <div class="h-5 w-12 bg-neutral-50 rounded"></div>
      </div>
    </div>
  `;
}

function renderDetailsSkeleton(rootEl) {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div class="space-y-3">
      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="h-4 w-full bg-neutral-50 rounded"></div>
        <div class="mt-2 h-4 w-10/12 bg-neutral-50 rounded"></div>
        <div class="mt-2 h-4 w-8/12 bg-neutral-50 rounded"></div>
      </div>

      <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
        <div class="h-5 w-28 bg-neutral-50 rounded"></div>
        <div class="mt-3 space-y-2">
          ${Array.from({ length: 2 })
            .map(
              () => `
                <div class="rounded-2xl border border-neutral-50 bg-neutral-0 p-4">
                  <div class="h-4 w-40 bg-neutral-50 rounded"></div>
                  <div class="mt-2 h-3 w-48 bg-neutral-50 rounded"></div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function mapSpecialties(input) {
  const arr = Array.isArray(input) ? input : [];

  return arr
    .map((it, idx) => {
      if (!it) return null;

      // tolerate multiple shapes (until backend finalizes)
      const title = it.title ?? it.nameFa ?? it.name ?? it.specialty?.nameFa ?? it.specialty?.name ?? it.label ?? "";
      const priceToman = it.priceToman ?? it.price ?? it.priceIRR ?? it.priceIrr ?? it.costToman ?? 0;
      const durationMin = it.durationMin ?? it.duration ?? it.durationMinutes ?? it.durationMins ?? 0;

      return {
        id: String(it.id ?? it.slug ?? it.specialty?.id ?? `sp-${idx + 1}`),
        title: String(title || "بدون عنوان"),
        priceToman: Number(priceToman) || 0,
        durationMin: Number(durationMin) || 0,
      };
    })
    .filter(Boolean);
}

// ---------------- Header ----------------

const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  logoSrc: "/public/assent/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// ---------------- Page wiring ----------------

const artistIdOrSlug = getArtistIdOrSlug();

const portfolioRoot = document.getElementById("staff-portfolio");
const profileRoot = document.getElementById("staff-profile");
const detailsRoot = document.getElementById("staff-details");

if (!artistIdOrSlug) {
  renderSectionMessage(profileRoot, {
    variant: "error",
    title: "خطا",
    message: "شناسه متخصص در آدرس صفحه وجود ندارد. نمونه: staff.html?artist=<slug-or-id>",
  });
  renderSectionMessage(detailsRoot, {
    variant: "error",
    message: "برای نمایش جزئیات، شناسه متخصص لازم است.",
  });
} else {
  // Portfolio uses its own loader and handles errors internally
  const portfolioClient = createStaffPortfolioClient();
  mountStaffPortfolio(portfolioRoot, {
    artistIdOrSlug,
    client: portfolioClient,
    heading: "نمونه کار",
    previewCount: 4,
  });

  // Profile + Details
  renderProfileSkeleton(profileRoot);
  renderDetailsSkeleton(detailsRoot);

  const controller = new AbortController();

  (async () => {
    try {
      const [artist, specialtiesRaw] = await Promise.all([
        artistsApi.getByIdOrSlug(artistIdOrSlug),
        // This endpoint is currently missing in atlas-API.yaml as GET.
        // We still call it; if backend hasn't shipped it yet, we fall back to empty list.
        artistsApi.listSpecialties(artistIdOrSlug).catch(() => []),
      ]);

      const name = artist?.fullName || "";
      const role = artist?.summary || "";
      const rating = artist?.avgRating;
      const avatarSrc = artist?.avatar?.url || "";

      mountStaffProfile(profileRoot, { name, role, rating, avatarSrc });

      const description = artist?.bio || "";
      const specialties = mapSpecialties(specialtiesRaw);

      mountStaffDetails(detailsRoot, {
        description,
        specialties,
        title: "تخصص‌ها",
      });
    } catch (err) {
      console.warn("Staff page fetch failed:", err);

      const status = err?.status;

      const profileMsg =
        status === 404
          ? "متخصصی با این شناسه پیدا نشد. (احتمالاً مقدار artist در URL اشتباه است.)"
          : status === 401 || status === 403
            ? "برای مشاهده اطلاعات این متخصص دسترسی ندارید."
            : "دریافت اطلاعات متخصص با مشکل مواجه شد.";

      const detailsMsg =
        status === 404
          ? "جزئیات قابل نمایش نیست چون متخصص پیدا نشد."
          : status === 401 || status === 403
            ? "برای مشاهده جزئیات دسترسی ندارید."
            : "دریافت جزئیات با مشکل مواجه شد.";

      renderSectionMessage(profileRoot, {
        variant: "error",
        title: "خطا",
        message: profileMsg,
      });

      renderSectionMessage(detailsRoot, {
        variant: "error",
        message: detailsMsg,
      });
    }
  })();

  // Optional: if this page ever becomes SPA, you can abort on navigation
  window.addEventListener(
    "beforeunload",
    () => {
      controller.abort();
    },
    { once: true }
  );
}

// public/script/landing.js

import { mountHeader } from "/public/script/components/header.js";
import { mountSearchBar } from "/public/script/components/landing-searchBar.js";
import { enableStickyHeader } from "/public/script/utils/stickyHeader.js";
import { mountTopStaff } from "/public/script/components/landing-topStaff.js";
import { mountPopularSalons } from "/public/script/components/landing-topSalons.js";

import { loadPopularSalons, loadTopStaff } from "/public/script/api/landingApi.js";

// ---------------- Header ----------------
const headerRoot = document.getElementById("appHeader");

mountHeader(headerRoot, {
  logoSrc: "/public/assets/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// Sticky effects (shadow/border on scroll)
enableStickyHeader(headerRoot, { threshold: 8 });

// ---------------- Landing data orchestration ----------------

const popularSalonsRoot = document.getElementById("popularSalonsMount");
const topStaffRoot = document.getElementById("topStaffMount");
const searchRoot = document.getElementById("searchMount");

const popularSalonsProps = {
  title: "محبوب‌ترین سالن‌های زیبایی",
  ctaText: "مشاهده همه",
  ctaHref: "/public/salons.html",
};

const topStaffProps = {
  title: "برترین کارکنان ماه",
  ctaText: "مشاهده همه",
  ctaHref: "/public/staff.html",
};

function renderLoading(rootEl, text = "در حال بارگذاری…") {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div class="w-full py-10 grid place-items-center text-[12px] text-neutral-700">
      <div class="flex items-center gap-2">
        <span class="inline-block h-2 w-2 rounded-full bg-primary-900/60 animate-pulse"></span>
        <span>${escapeHtml(text)}</span>
      </div>
    </div>
  `;
}

function renderError(rootEl, text = "خطا در دریافت اطلاعات") {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div class="w-full py-10 grid place-items-center text-[12px] text-neutral-700">
      <div class="text-center">
        <div class="font-medium text-neutral-900">${escapeHtml(text)}</div>
        <button
          type="button"
          data-retry
          class="mt-3 inline-flex items-center justify-center rounded-xl bg-neutral-50 px-4 py-2
                 text-[12px] font-medium text-neutral-900 hover:bg-neutral-50/70 transition"
        >
          تلاش دوباره
        </button>
      </div>
    </div>
  `;
}

let abortCtrl = null;
let lastQ = ""; // for avoiding redundant reloads

async function refreshLanding({ q = "" } = {}) {
  const normalizedQ = String(q || "").trim();

  // abort previous in-flight request
  if (abortCtrl) abortCtrl.abort();
  abortCtrl = new AbortController();

  // show loading states
  renderLoading(popularSalonsRoot, "در حال دریافت سالن‌ها…");
  renderLoading(topStaffRoot, "در حال دریافت کارکنان…");

  try {
    const [salons, staffSlides] = await Promise.all([
      loadPopularSalons({ q: normalizedQ || undefined, limit: 8, signal: abortCtrl.signal }),
      loadTopStaff({ q: normalizedQ || undefined, limit: 8, perSlide: 2, signal: abortCtrl.signal }),
    ]);

    if (abortCtrl.signal.aborted) return;

    mountPopularSalons(popularSalonsRoot, { ...popularSalonsProps, items: salons });
    mountTopStaff(topStaffRoot, { ...topStaffProps, slides: staffSlides });
  } catch (err) {
    if (abortCtrl.signal.aborted) return;

    console.error("Landing API error:", err);

    renderError(popularSalonsRoot, "خطا در دریافت لیست سالن‌ها");
    renderError(topStaffRoot, "خطا در دریافت لیست کارکنان");

    // wire retry buttons (no coupling to components)
    popularSalonsRoot?.querySelector("[data-retry]")?.addEventListener("click", () => {
      refreshLanding({ q: lastQ });
    });
    topStaffRoot?.querySelector("[data-retry]")?.addEventListener("click", () => {
      refreshLanding({ q: lastQ });
    });
  }
}

// ---------------- Search ----------------

mountSearchBar(searchRoot, {
  placeholder: "سالن، آرایشگران، خدمات…",
  debounceMs: 250,
  minChars: 0,

  onChange: (value) => {
    const q = String(value || "").trim();

    // برای تجربه بهتر: جستجوی زنده فقط وقتی حداقل ۲ کاراکتر داریم.
    if (q.length >= 2) {
      lastQ = q;
      refreshLanding({ q });
      return;
    }

    // اگر پاک شد، برگرد به حالت پیش‌فرض
    if (!q && lastQ) {
      lastQ = "";
      refreshLanding({ q: "" });
    }
  },

  onSubmit: (value) => {
    const q = String(value || "").trim();
    if (!q) return;

    // نتایج کامل‌تر بهتره تو صفحه لیست‌ها نمایش داده بشه
    window.location.href = `/public/salons.html?q=${encodeURIComponent(q)}`;
  },
});

// initial load
refreshLanding({ q: "" });

// (اختیاری) Event-based usage بدون coupling مستقیم
document.addEventListener("search:submit", (e) => {
  // اینجا هم می‌تونی routing رو انجام بدی اگر دوست داشتی
  // console.log("event search submit:", e.detail.value);
});

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

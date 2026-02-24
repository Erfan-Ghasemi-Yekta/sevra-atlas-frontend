// public/script/components/landing-topStaff.js
// استاتیک (فعلاً) — آماده برای وصل شدن به API

export function mountTopStaff(rootEl, props = {}) {
  if (!rootEl) return;

  const {
    title = "برترین کارکنان ماه",
    ctaText = "مشاهده همه",
    ctaHref = "#",
    onCtaClick, // () => void
    slides = defaultSlides(),
  } = props;

  rootEl.innerHTML = template({ title, ctaText, ctaHref, slides });

  const ctaEl = rootEl.querySelector("[data-topstaff-cta]");
  if (ctaEl) {
    ctaEl.addEventListener("click", (e) => {
      if (typeof onCtaClick === "function") {
        e.preventDefault();
        onCtaClick();
      }
    });
  }

  // Fallback آواتار اگر عکس لود نشد
  rootEl.querySelectorAll("img[data-topstaff-avatar]").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("hidden");
      const fallback = img
        .closest("[data-topstaff-avatar-wrap]")
        ?.querySelector("[data-topstaff-avatar-fallback]");
      fallback?.classList.remove("hidden");
    });
  });

  const track = rootEl.querySelector("[data-topstaff-track]");
  const slidesEls = Array.from(rootEl.querySelectorAll("[data-topstaff-slide]"));
  const dotEls = Array.from(rootEl.querySelectorAll("[data-topstaff-dot]"));

  // کنترل دات‌ها
  dotEls.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-topstaff-dot"));
      const slide = slidesEls[idx];
      slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  // آپدیت دات فعال با IntersectionObserver (در RTL هم خوب کار می‌کند)
  if (track && slidesEls.length && dotEls.length && "IntersectionObserver" in window) {
    // نکته: callback فقط entryهایی رو می‌ده که وضعیت‌شون عوض شده.
    // اگر فقط بین همین entryها max بگیری، ممکنه لحظه‌ای dot برگرده به ۰ و بعد درست بشه.
    // راه‌حل: آخرین intersectionRatio هر اسلاید رو نگه می‌داریم و از روی کل اسلایدها max می‌گیریم.
    const ratios = new Map();
    slidesEls.forEach((el) => {
      const idx = Number(el.getAttribute("data-topstaff-slide"));
      ratios.set(idx, 0);
    });

    const pickMostVisibleIdx = () => {
      let bestIdx = 0;
      let bestRatio = -1;
      ratios.forEach((r, idx) => {
        if (r > bestRatio) {
          bestRatio = r;
          bestIdx = idx;
        }
      });
      return bestIdx;
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const idx = Number(e.target.getAttribute("data-topstaff-slide"));
          ratios.set(idx, e.isIntersecting ? e.intersectionRatio || 0 : 0);
        });
        setActiveDot(dotEls, pickMostVisibleIdx());
      },
      { root: track, threshold: [0.15, 0.3, 0.5, 0.7, 0.85] }
    );

    slidesEls.forEach((el) => obs.observe(el));

    // حالت اولیه
    setActiveDot(dotEls, 0);
  } else {
    setActiveDot(dotEls, 0);
  }

  return {
    setSlides: (nextSlides) => {
      // برای آینده: اگر از API گرفتی، می‌تونی کل رندر رو دوباره انجام بدی
      rootEl.innerHTML = template({ title, ctaText, ctaHref, slides: nextSlides || [] });
    },
  };
}

function template({ title, ctaText, ctaHref, slides }) {
  const safeSlides = Array.isArray(slides) ? slides : [];

  return `
    <section class="w-full tap-highlight-none" aria-label="${escapeHtml(title)}">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[14px] font-semibold text-neutral-900">${escapeHtml(title)}</h2>

        <a
          data-topstaff-cta
          href="${escapeHtml(ctaHref)}"
          class="inline-flex items-center gap-1 text-[12px] font-medium text-primary-900
                 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded-lg px-2 py-1"
        >
          <span>${escapeHtml(ctaText)}</span>
          <span aria-hidden="true" class="text-primary-900">‹</span>
        </a>
      </div>

      <div
        data-topstaff-track
        class="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
        aria-label="لیست برترین کارکنان"
      >
        ${safeSlides
          .map((slide, idx) => slideTemplate(slide, idx))
          .join("")}
      </div>

      <div class="mt-3 flex items-center justify-center gap-2" aria-label="نشانگر اسلایدها">
        ${safeSlides
          .map((_, idx) =>
            `<button type="button" data-topstaff-dot="${idx}" aria-label="اسلاید ${idx + 1}" class="h-2.5 rounded-full bg-primary-900/35 transition-all"></button>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function slideTemplate(slideCards, slideIdx) {
  const cards = Array.isArray(slideCards) ? slideCards : [];

  return `
    <div
      data-topstaff-slide="${slideIdx}"
      class="shrink-0 w-[90%] snap-center"
      role="group"
      aria-label="اسلاید ${slideIdx + 1}"
    >
      <div class="flex flex-col gap-3">
        ${cards.map(cardTemplate).join("")}
      </div>
    </div>
  `;
}

function cardTemplate(staff = {}) {
  const {
    name = "—",
    rating = 0,
    reviewsText = "",
    reviewsCount,
    jobsDoneText = "",
    specialty = "",
    imageSrc = "",
    profileHref = "#",
  } = staff;

  const initial = String(name || "—").trim().slice(0, 1) || "—";

  const reviewCount = getReviewsCount(reviewsCount, reviewsText);

  return `
    <article
      class="bg-white rounded-[26px] border border-neutral-50
             shadow-[0_10px_24px_rgba(49,49,49,0.10)]
             px-4 py-3 flex items-center gap-4"
    >
      <div
        data-topstaff-avatar-wrap
        class="relative h-[125px] w-[120px] shrink-0 overflow-hidden rounded-2xl
               bg-primary-600/15"
        aria-hidden="true"
      >
        ${imageSrc ? `<img data-topstaff-avatar src="${escapeHtml(imageSrc)}" alt="" class="h-full w-full object-cover" />` : ""}
        <div
          data-topstaff-avatar-fallback
          class="${imageSrc ? "hidden" : ""} h-full w-full grid place-items-center"
        >
          <div class="h-10 w-10 rounded-full bg-primary-900/10 grid place-items-center">
            <span class="text-primary-900 font-semibold">${escapeHtml(initial)}</span>
          </div>
        </div>

        <!-- subtle highlight like the design -->
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/35"></div>
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-2">
          <h3 class="text-[16px] font-semibold text-primary-900 truncate">${escapeHtml(name)}</h3>

          <div class="flex flex-col items-end leading-[1.1] shrink-0">
            <div class="flex items-center gap-1 text-[12px] font-semibold tabular-nums">
              <span class="text-accent-500" aria-hidden="true">★</span>
              <span class="text-neutral-900">${escapeHtml(formatRating(rating))}</span>
            </div>

            ${reviewCount ? `<div class="mt-0.5 text-[10px] text-neutral-600 tabular-nums">${escapeHtml(String(reviewCount))} نظر</div>` : ``}
          </div>
        </div>

        <div class="mt-1 text-[11px] leading-6 text-neutral-700">
          <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
            ${jobsDoneText ? `<span>${escapeHtml(jobsDoneText)}</span>` : ""}
</div>
          ${specialty ? `<div class="mt-0.5 truncate">${escapeHtml(specialty)}</div>` : ""}
        </div>

        <div class="mt-3 flex justify-end">
          <a
            href="${escapeHtml(profileHref)}"
            class="inline-flex h-9 w-[100%] items-center justify-center rounded-xl bg-primary-900
                   px-5 text-[12px] font-medium text-white shadow-sm
                   hover:bg-primary-600 transition
                   focus:outline-none focus:ring-2 focus:ring-primary-600/25"
            aria-label="مشاهده پروفایل ${escapeHtml(name)}"
          >
            مشاهده پروفایل
          </a>
        </div>
      </div>
    </article>
  `;
}

function getReviewsCount(reviewsCount, reviewsText) {
  return (
    reviewsCount ??
    String(reviewsText || "").match(/[0-9۰-۹]+/)?.[0] ??
    ""
  );
}

function renderReviewsLine(reviewsCount, reviewsText) {
  const count = getReviewsCount(reviewsCount, reviewsText);

  if (!count) return "";
  return `<span>${escapeHtml(String(count))} نظر</span>`;
}

function setActiveDot(dotEls, idx) {
  dotEls.forEach((dot, i) => {
    const isActive = i === idx;

    // شکل active مثل design: یک pill کشیده
    dot.classList.toggle("w-7", isActive);
    dot.classList.toggle("w-2.5", !isActive);
    dot.classList.toggle("bg-primary-900", isActive);
    dot.classList.toggle("bg-primary-900/35", !isActive);

    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function formatRating(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return (Math.round(num * 10) / 10).toFixed(1);
}

function defaultSlides() {
  // یک دیتای نمونه (فقط برای اینکه کامپوننت بدون props هم کار کند)
  return [
    [
      {
        name: "سارا محسنی",
        rating: 4.8,
        reviewsCount: "۱۳",
        jobsDoneText: "۱۲۰ خدمت انجام‌شده",
        specialty: "ناخن‌کار، ترمیم و کاشت تخصصی",
        imageSrc: "",
        profileHref: "#",
      },
      {
        name: "سارا محسنی",
        rating: 4.8,
        reviewsCount: "۱۳",
        jobsDoneText: "۱۲۰ خدمت انجام‌شده",
        specialty: "ناخن‌کار، ترمیم و کاشت تخصصی",
        imageSrc: "",
        profileHref: "#",
      },
    ],
  ];
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

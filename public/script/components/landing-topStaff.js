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
    const obs = new IntersectionObserver(
      (entries) => {
        // اولین اسلایدی که بیشترین دیده‌شدن رو دارد
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        const idx = visible ? Number(visible.target.getAttribute("data-topstaff-slide")) : 0;
        setActiveDot(dotEls, idx);
      },
      { root: track, threshold: [0.4, 0.6, 0.8] }
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
    jobsDoneText = "",
    specialty = "",
    imageSrc = "",
    profileHref = "#",
  } = staff;

  const initial = String(name || "—").trim().slice(0, 1) || "—";

  return `
    <article
      class="bg-white rounded-[28px] border border-neutral-50
             shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]
             px-4 py-3 flex items-center gap-3"
    >
      <div
        data-topstaff-avatar-wrap
        class="relative h-[84px] w-[112px] shrink-0 overflow-hidden rounded-2xl
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
          <h3 class="text-[13px] font-semibold text-primary-900 truncate">${escapeHtml(name)}</h3>

          <div class="flex items-center gap-1 text-[12px] font-semibold">
            <span class="text-accent-500" aria-hidden="true">★</span>
            <span class="text-neutral-900">${escapeHtml(formatRating(rating))}</span>
          </div>
        </div>

        <div class="mt-1 text-[11px] leading-5 text-neutral-700">
          ${reviewsText ? `<div>${escapeHtml(reviewsText)}</div>` : ""}
          ${jobsDoneText ? `<div>${escapeHtml(jobsDoneText)}</div>` : ""}
          ${specialty ? `<div class="truncate">${escapeHtml(specialty)}</div>` : ""}
        </div>

        <a
          href="${escapeHtml(profileHref)}"
          class="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-primary-900
                 px-5 text-[12px] font-medium text-white shadow-sm
                 hover:bg-primary-600 active:scale-[0.99] transition
                 focus:outline-none focus:ring-2 focus:ring-primary-600/25"
          aria-label="مشاهده پروفایل ${escapeHtml(name)}"
        >
          مشاهده پروفایل
        </a>
      </div>
    </article>
  `;
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
        reviewsText: "نظرات (۱۳ نظر)",
        jobsDoneText: "۱۲۰ خدمت انجام‌شده",
        specialty: "ناخن‌کار، ترمیم و کاشت تخصصی",
        imageSrc: "",
        profileHref: "#",
      },
      {
        name: "سارا محسنی",
        rating: 4.8,
        reviewsText: "نظرات (۱۳ نظر)",
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

// public/script/components/landing-popularSalons.js
// استاتیک (فعلاً) — آماده برای وصل شدن به API

export function mountPopularSalons(rootEl, props = {}) {
  if (!rootEl) return;

  const {
    title = "محبوب ترین سالن های زیبایی",
    ctaText = "مشاهده همه",
    ctaHref = "#",
    onCtaClick, // () => void
    items = defaultItems(),
  } = props;

  rootEl.innerHTML = template({ title, ctaText, ctaHref, items });

  const ctaEl = rootEl.querySelector("[data-popularsalons-cta]");
  if (ctaEl) {
    ctaEl.addEventListener("click", (e) => {
      if (typeof onCtaClick === "function") {
        e.preventDefault();
        onCtaClick();
      }
    });
  }

  const track = rootEl.querySelector("[data-popularsalons-track]");
  const slideEls = Array.from(rootEl.querySelectorAll("[data-popularsalons-slide]"));
  const dotEls = Array.from(rootEl.querySelectorAll("[data-popularsalons-dot]"));

  // کنترل دات‌ها
  dotEls.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.getAttribute("data-popularsalons-dot"));
      const slide = slideEls[idx];
      slide?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  // آپدیت دات فعال با IntersectionObserver (برای RTL هم اوکیه)
  if (track && slideEls.length && dotEls.length && "IntersectionObserver" in window) {
    const ratios = new Map();
    slideEls.forEach((el) => {
      const idx = Number(el.getAttribute("data-popularsalons-slide"));
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
          const idx = Number(e.target.getAttribute("data-popularsalons-slide"));
          ratios.set(idx, e.isIntersecting ? e.intersectionRatio || 0 : 0);
        });
        setActiveDot(dotEls, pickMostVisibleIdx());
      },
      { root: track, threshold: [0.15, 0.3, 0.5, 0.7, 0.85] }
    );

    slideEls.forEach((el) => obs.observe(el));

    // initial
    setActiveDot(dotEls, 0);
  } else {
    setActiveDot(dotEls, 0);
  }

  return {
    setItems: (nextItems) => {
      rootEl.innerHTML = template({ title, ctaText, ctaHref, items: nextItems || [] });
    },
  };
}

function template({ title, ctaText, ctaHref, items }) {
  const safe = Array.isArray(items) ? items : [];

  return `
    <section class="w-full tap-highlight-none bg-white" aria-label="${escapeHtml(title)}">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="flex-1 text-right text-[14px] font-semibold text-neutral-900">
          ${escapeHtml(title)}
        </h2>

        <a
          data-popularsalons-cta
          href="${escapeHtml(ctaHref)}"
          class="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-primary-900
                 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/20 rounded-lg px-2 py-1"
        >
          <span>${escapeHtml(ctaText)}</span>
          <span aria-hidden="true" class="text-primary-900">‹</span>
        </a>
      </div>

      <div
        data-popularsalons-track
        class="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory bg-white pb-2"
        aria-label="لیست محبوب‌ترین سالن‌ها"
      >
        ${safe.map((item, idx) => slideTemplate(item, idx)).join("")}
      </div>

      <div class="mt-3 flex items-center justify-center gap-2 bg-white" aria-label="نشانگر اسلایدها">
        ${safe
          .map(
            (_, idx) =>
              `<button type="button" data-popularsalons-dot="${idx}" aria-label="اسلاید ${idx + 1}" class="h-2.5 rounded-full bg-primary-900/35 transition-all"></button>`
          )
          .join("")}
      </div>
    </section>
  `;
}

function slideTemplate(item = {}, idx) {
  return `
    <div data-popularsalons-slide="${idx}" class="shrink-0 w-[99%] snap-center">
      ${cardTemplate(item)}
    </div>
  `;
}

function cardTemplate(item = {}) {
  const {
    rank = 1,
    city = "تهران",
    views = 0,
    name = "—",
    subtitle = "",
    imageSrc = "",
    href = "#",
    detailsText = "جزئیات",
  } = item;

  return `
    <article
      class="bg-white rounded-[28px] border border-neutral-100
             shadow-[0_10px_24px_rgba(49,49,49,0.10)]
             overflow-hidden"
    >
      <a href="${escapeHtml(href)}" class="block">
        <div class="relative h-[190px] w-full bg-white overflow-hidden">
          ${imageSrc ? `<img src="${escapeHtml(imageSrc)}" alt="" class="h-full w-full object-cover" />` : ""}

          <!-- Badges (top-left like design) -->
          <div class="absolute top-3 left-3 flex items-center gap-2">
            <span class="inline-flex items-center gap-1 rounded-xl bg-primary-900/95 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              ${starIcon()}
              <span class="tabular-nums">${escapeHtml(String(rank))}</span>
            </span>

            <span class="inline-flex items-center gap-1 rounded-xl bg-primary-900/95 px-3 py-1 text-[11px] font-medium text-white shadow-sm">
              ${pinIcon()}
              <span>${escapeHtml(city)}</span>
            </span>
          </div>

          <!-- subtle corner highlight -->
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/0 to-white/35"></div>
        </div>
      </a>

      <div class="px-4 pt-3 pb-4">
        <div class="flex justify-end">
          <div class="flex items-center gap-2 text-[11px] text-neutral-700">
            ${eyeIcon()}
            <span class="tabular-nums">${escapeHtml(String(views))}</span>
          </div>
        </div>

        <h3 class="mt-2 text-center text-[16px] font-semibold text-neutral-900">
          ${escapeHtml(name)}
        </h3>

        ${subtitle
          ? `<p class="mt-1 text-center text-[11px] text-neutral-700">${escapeHtml(subtitle)}</p>`
          : ""}

        <div class="mt-4">
          <a
            href="${escapeHtml(href)}"
            class="block w-full text-center rounded-xl bg-neutral-50 py-3 text-[12px] font-medium text-neutral-900
                   hover:bg-neutral-50/70 active:scale-[0.99] transition"
          >
            ${escapeHtml(detailsText)}
          </a>
        </div>
      </div>
    </article>
  `;
}

function setActiveDot(dotEls, idx) {
  dotEls.forEach((dot, i) => {
    const isActive = i === idx;

    dot.classList.toggle("w-7", isActive);
    dot.classList.toggle("w-2.5", !isActive);
    dot.classList.toggle("bg-primary-900", isActive);
    dot.classList.toggle("bg-primary-900/35", !isActive);

    dot.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function defaultItems() {
  return [
    {
      rank: 1,
      city: "تهران",
      views: 11,
      name: "سالن زیبایی تهران",
      subtitle: "کاشت ناخن | شروع قیمت ها از 150 هزار تومان",
      imageSrc: "",
      href: "#",
      detailsText: "جزئیات",
    },
  ];
}

function starIcon() {
  return `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 17.27l5.18 3.04-1.64-5.81L20 9.24l-5.9-.5L12 3.25 9.9 8.74 4 9.24l4.46 5.26-1.64 5.81L12 17.27z"/>
    </svg>
  `;
}

function pinIcon() {
  return `
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  `;
}

function eyeIcon() {
  return `
    <svg class="w-5 h-5 text-neutral-700/70" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-2.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/>
    </svg>
  `;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

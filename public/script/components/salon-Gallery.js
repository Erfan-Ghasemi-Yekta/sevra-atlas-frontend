function galleryTemplate({ images = [], alt = "Salon image" }) {
  const safeImages = images.length ? images : ["https://picsum.photos/800/500?random=1"];
  const showControls = safeImages.length > 1;

  const dots = safeImages
    .map(
      (_, i) => `
        <button
          type="button"
          class="h-2 transition ${
            i === 0
              ? "w-5 rounded-full bg-primary-900"
              : "w-2 rounded-full bg-neutral-0"
          }"
          aria-label="Go to slide ${i + 1}"
          data-dot="${i}"
        ></button>
      `
    )
    .join("");

  const slides = safeImages
    .map(
      (src, i) => `
        <div
          class="absolute inset-0 transition-opacity duration-300 ${
            i === 0 ? "opacity-100" : "opacity-0"
          }"
          data-slide="${i}"
        >
          <img
            src="${src}"
            alt="${alt}"
            class="h-full w-full object-cover"
            draggable="false"
          />
        </div>
      `
    )
    .join("");

  // یک SVG واحد برای هر دو فلش (برای قبلی rotate می‌دیم)
  const arrowSvg = `
    <svg viewBox="0 0 24 24" class="size-7 text-primary-600" fill="none" aria-hidden="true">
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        stroke-width="2.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  return `
    <section>
      <!-- No padding, no rounded corners -->
      <div class="relative bg-neutral-50">
        <div class="relative h-48">
          ${slides}

          ${
            showControls
              ? `
                <!-- Prev (left) -->
                <button
                  type="button"
                  class="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center size-11 bg-transparent active:scale-95 transition"
                  aria-label="Previous image"
                  data-prev
                >
                  <span class="block rotate-180">
                    ${arrowSvg}
                  </span>
                </button>

                <!-- Next (right) -->
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-11 bg-transparent active:scale-95 transition"
                  aria-label="Next image"
                  data-next
                >
                  ${arrowSvg}
                </button>

                <!-- Dots (no pill background, like the screenshot) -->
                <div class="absolute bottom-3 left-1/2 -translate-x-1/2">
                  <div class="flex items-center gap-2">
                    ${dots}
                  </div>
                </div>
              `
              : ""
          }
        </div>
      </div>
    </section>
  `;
}

export function mountSalonGallery(rootEl, props) {
  if (!rootEl) return;
  rootEl.innerHTML = galleryTemplate(props);
  initGallery(rootEl);
}

function initGallery(rootEl) {
  const slides = [...rootEl.querySelectorAll("[data-slide]")];
  const dots = [...rootEl.querySelectorAll("[data-dot]")];
  const prevBtn = rootEl.querySelector("[data-prev]");
  const nextBtn = rootEl.querySelector("[data-next]");

  // اگر فقط یک عکس داریم، هیچ کنترلی لازم نیست.
  if (slides.length <= 1) return;

  let index = 0;

  const render = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach((s, i) => {
      s.classList.toggle("opacity-100", i === index);
      s.classList.toggle("opacity-0", i !== index);
    });

    dots.forEach((d, i) => {
      const active = i === index;
      d.classList.toggle("bg-primary-900", active);
      d.classList.toggle("w-5", active);
      d.classList.toggle("bg-neutral-0", !active);
      d.classList.toggle("w-2", !active);
      d.classList.toggle("rounded-full", true);
    });
  };

  prevBtn?.addEventListener("click", () => render(index + 1));
  nextBtn?.addEventListener("click", () => render(index - 1));
  dots.forEach((d) => d.addEventListener("click", () => render(Number(d.dataset.dot))));
}

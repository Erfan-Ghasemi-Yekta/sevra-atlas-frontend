function galleryTemplate({ images = [], alt = "Salon image" }) {
  // اگر عکس ندادی، یه placeholder می‌ذاریم
  const safeImages = images.length
    ? images
    : ["https://picsum.photos/800/500?random=1"];

  const dots = safeImages
    .map(
      (_, i) => `
        <button
          type="button"
          class="size-2 rounded-full transition ${
            i === 0 ? "bg-primary-900 w-4" : "bg-neutral-0/80"
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

  return `
    <section class="px-4">
      <div class="relative overflow-hidden rounded-2xl bg-neutral-50 shadow-sm">
        <!-- Aspect / Height -->
        <div class="relative h-48">
          ${slides}

          <!-- Left arrow -->
          <button
            type="button"
            class="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-neutral-0/70 backdrop-blur border border-neutral-50 shadow-sm active:scale-95 transition"
            aria-label="Previous image"
            data-prev
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-5 text-neutral-900">
              <path fill-rule="evenodd" d="M12.78 15.53a.75.75 0 0 1-1.06 0L6.47 10.28a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 1 1 1.06 1.06L8.06 9.75l4.72 4.72a.75.75 0 0 1 0 1.06z" clip-rule="evenodd"/>
            </svg>
          </button>

          <!-- Right arrow -->
          <button
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-9 rounded-full bg-neutral-0/70 backdrop-blur border border-neutral-50 shadow-sm active:scale-95 transition"
            aria-label="Next image"
            data-next
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="size-5 text-neutral-900">
              <path fill-rule="evenodd" d="M7.22 4.47a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06l4.72-4.72-4.72-4.72a.75.75 0 0 1 0-1.06z" clip-rule="evenodd"/>
            </svg>
          </button>

          <!-- Dots -->
          <div class="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div class="flex items-center gap-2 rounded-full bg-neutral-900/10 px-3 py-2 backdrop-blur-sm">
              ${dots}
            </div>
          </div>
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
      d.classList.toggle("w-4", active);
      d.classList.toggle("bg-neutral-0/80", !active);
      d.classList.toggle("w-2", !active);
    });
  };

  prevBtn?.addEventListener("click", () => render(index - 1));
  nextBtn?.addEventListener("click", () => render(index + 1));

  dots.forEach((d) => {
    d.addEventListener("click", () => render(Number(d.dataset.dot)));
  });
}

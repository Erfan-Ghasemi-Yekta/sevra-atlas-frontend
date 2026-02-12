function headerTemplate({ logoSrc, logoAlt, cityLabel }) {
  const logoNode = logoSrc
    ? `<img src="${logoSrc}" alt="${logoAlt}" class="h-6 w-auto select-none" />`
    : `<div class="text-primary-900 font-bold tracking-tight select-none">SEVRA</div>`;

  return `
    <header class="sticky top-0 z-50 bg-neutral-0/90 backdrop-blur border-b border-neutral-50">
      <!-- force LTR layout so logo stays LEFT and button stays RIGHT -->
      <div dir="ltr" class="h-14 px-4 flex items-center justify-between gap-3">
        
        <!-- Left: Logo -->
        <a href="/" class="flex items-center gap-2 min-w-0">
          ${logoNode}
        </a>

        <!-- Right: City Select Button (stub) -->
          <button
              id="citySelectBtn"
              type="button"
              dir="rtl"
              class="h-9 max-w-[70%] inline-flex items-center gap-2 rounded-full border border-neutral-50 bg-neutral-0 px-3 text-sm text-neutral-900 shadow-sm active:scale-[0.99] transition"
              aria-haspopup="dialog"
              aria-expanded="false"
                                    >
      <!-- location pin (moved to left side of label) -->
                <svg class="size-4 shrink-0 text-primary-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2c-3.866 0-7 3.134-7 7 0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
                </svg>

                  <span class="truncate">شهر خود را انتخاب کنید</span>

      <!-- chevron (moved to right side) -->
                <svg class="size-4 shrink-0 text-neutral-700" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" clip-rule="evenodd"/>
                </svg>
          </button>

      </div>
    </header>
  `;
}

export function mountHeader(rootEl, props) {
  if (!rootEl) return;
  rootEl.innerHTML = headerTemplate(props);
  initHeader();
}

function initHeader() {
  const btn = document.getElementById("citySelectBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    console.log("City picker clicked (stub).");
  });
}

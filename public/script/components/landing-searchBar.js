// public/script/components/searchBar.js

export function mountSearchBar(rootEl, props = {}) {
  if (!rootEl) return;

  const {
    id = "landingSearch",
    placeholder = "سالن، آرایشگران، خدمات…",
    initialValue = "",
    autoFocus = false,
    onChange, // (value) => void
    onSubmit, // (value) => void
    minChars = 0,
    debounceMs = 250,
  } = props;

  rootEl.innerHTML = template({ id, placeholder, initialValue });

  const form = rootEl.querySelector(`[data-sb-form="${id}"]`);
  const input = rootEl.querySelector(`[data-sb-input="${id}"]`);
  const clearBtn = rootEl.querySelector(`[data-sb-clear="${id}"]`);

  if (!form || !input || !clearBtn) return;

  if (autoFocus) input.focus();

  const setClearVisible = () => {
    const hasValue = input.value.trim().length > 0;
    clearBtn.classList.toggle("hidden", !hasValue);
  };

  let t = null;
  const emitChange = () => {
    const v = input.value.trim();
    if (v.length < minChars) return;

    if (typeof onChange === "function") onChange(v);

    // برای ارتباط ماژول‌ها بدون coupling:
    rootEl.dispatchEvent(
      new CustomEvent("search:change", { detail: { value: v }, bubbles: true })
    );
  };

  input.addEventListener("input", () => {
    setClearVisible();
    if (t) clearTimeout(t);
    t = setTimeout(emitChange, debounceMs);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    setClearVisible();
    input.focus();

    if (typeof onChange === "function") onChange("");

    rootEl.dispatchEvent(
      new CustomEvent("search:clear", { detail: { value: "" }, bubbles: true })
    );
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (v.length < minChars) return;

    if (typeof onSubmit === "function") onSubmit(v);

    rootEl.dispatchEvent(
      new CustomEvent("search:submit", { detail: { value: v }, bubbles: true })
    );
  });

  // init state
  setClearVisible();

  return {
    getValue: () => input.value,
    setValue: (v) => {
      input.value = String(v ?? "");
      setClearVisible();
    },
    focus: () => input.focus(),
  };
}

function template({ id, placeholder, initialValue }) {
  return `
    <form data-sb-form="${id}" class="w-full">
      <div class="relative">
        <!-- Icon (right) -->
        <span class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-500">
          <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 4a6 6 0 104.472 10.03l3.749 3.75a1 1 0 001.414-1.415l-3.75-3.749A6 6 0 0010 4zm0 2a4 4 0 110 8 4 4 0 010-8z"/>
          </svg>
        </span>

        <input
          data-sb-input="${id}"
          type="search"
          inputmode="search"
          autocomplete="off"
          spellcheck="false"
          value="${escapeHtml(initialValue)}"
          placeholder="${escapeHtml(placeholder)}"
          aria-label="جستجو"
          class="w-full h-11 rounded-full bg-white
                 border border-neutral-100
                 shadow-[0_8px_18px_rgba(0,0,0,0.06)]
                 pr-11 pl-10 text-[13px] leading-none text-neutral-800
                 placeholder:text-neutral-400
                 focus:outline-none focus:border-neutral-200 focus:ring-0
                 transition"
        />

        <!-- Clear (left) -->
        <button
          type="button"
          data-sb-clear="${id}"
          class="hidden absolute inset-y-0 left-3 my-auto h-8 w-8 rounded-full
                 grid place-items-center text-neutral-500 hover:bg-neutral-50 active:scale-[0.98] transition"
          aria-label="پاک کردن"
        >
          <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 001.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
          </svg>
        </button>
      </div>

      <p class="mt-2 text-[11px] text-neutral-400">
        برای شروع، نام سالن یا خدمت رو تایپ کن.
      </p>
    </form>
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
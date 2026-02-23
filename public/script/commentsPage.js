import { mountHeader } from "./components/header.js";
import { createCommentsClient, mountComments } from "./components/comments.js";

const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  logoSrc: "/public/assets/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

const root = document.getElementById("comments-page");
if (!root) throw new Error("Missing #comments-page root");

const qs = new URLSearchParams(window.location.search);
const entityType = qs.get("entityType") || "salon";
const entityId = qs.get("entityId") || qs.get("salonId") || "salon-1";
const salonName = qs.get("name") || "این سالن";
const backHref = qs.get("back") || `/index.html?salonId=${encodeURIComponent(entityId)}`;

// وقتی بک‌اند آماده شد، baseUrl رو ست کن (مثال: "https://api.example.com")
const COMMENTS_API_BASE_URL = ""; // فعلاً خالی => Mock + LocalStorage
const commentsClient = createCommentsClient({ baseUrl: COMMENTS_API_BASE_URL });

root.innerHTML = `
  <section dir="rtl">
    <div class="flex items-center justify-between gap-3">
      <a
        href="${backHref}"
        class="inline-flex items-center gap-2 rounded-full border border-neutral-50 bg-neutral-0 px-3 py-2 text-sm text-neutral-900 shadow-sm active:scale-[0.99] transition"
        aria-label="بازگشت"
      >
        <span class="size-5 rounded-full bg-neutral-50 grid place-items-center">
          <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span>بازگشت</span>
      </a>

      <div class="text-sm font-bold text-neutral-900 truncate">
        نظرات ${salonName}
      </div>
    </div>

    <div class="pt-2" data-comments-root></div>
  </section>
`;

const commentsRoot = root.querySelector("[data-comments-root]");
mountComments(commentsRoot, {
  entityType,
  entityId,
  client: commentsClient,
  currentUser: { name: "شما" },
});


// اگر چیزی عجیب شد، حداقل صفحه سفید نماند
window.addEventListener('error', (e) => console.error('Runtime error:', e.error || e.message));

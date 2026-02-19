import { mountHeader } from "/public/script/components/header.js";
import { mountSalonGallery } from "/public/script/components/salon-Gallery.js";
import { mountSalonDetails } from "/public/script/components/salon-details.js";

// ---------------- Header ----------------
const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  // لوگو رو خودت ست می‌کنی
  logoSrc: "/public/assent/img/logo.jpg",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// ---------------- Gallery (Slider) ----------------
const galleryRoot = document.getElementById("salon-gallery");
mountSalonGallery(galleryRoot, {
  images: [
    "/public/assent/img/img-for-test/img-1.jpg",
    "/public/assent/img/img-for-test/img-2.jpg",
    "/public/assent/img/img-for-test/img-3.jpg",
    "/public/assent/img/img-for-test/img-4.jpg",
  ],
  alt: "Salon cover",
});

// ---------------- Details + Tabs ----------------
// NOTE: فعلاً بک‌اند آماده نیست؛ بنابراین داده‌ها نمونه هستند.
// بعداً فقط همین object را با داده‌ی API جایگزین کن.
const qs = new URLSearchParams(window.location.search);
const salonId = qs.get("salonId") || "salon-1";

const salonUiModel = {
  salonId,
  name: "سالن زیبایی حدیث",
  rating: 3.9,
  ratingCount: 17,     // تعداد امتیازها
  commentsCount: 40,   // تعداد نظرات
  // avatarSrc: "/public/assent/img/salon-avatar.jpg", // اگر داری، فعال کن
};

// لینک صفحه‌ی نظرات (فعلاً با querystring؛ بعداً می‌تونی با router خودت عوضش کنی)
const commentsPageUrl = `/public/comments.html?entityType=salon&entityId=${encodeURIComponent(
  salonId
)}&back=${encodeURIComponent(`/public/salon.html?salonId=${salonId}`)}&name=${encodeURIComponent(
  salonUiModel.name
)}`;

const detailsRoot = document.getElementById("salon-details");
mountSalonDetails(detailsRoot, {
  ...salonUiModel,
  commentsPageUrl,
});

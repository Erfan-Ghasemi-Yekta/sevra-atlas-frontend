import { mountHeader } from "/public/script/components/header.js";
import { mountSalonGallery } from "/public/script/components/salonGallery.js";
import { mountSalonDetails } from "/public/script/components/salonDetails.js";
import { createCommentsClient } from "/public/script/components/comments.js";

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
// ---------------- Comments (Mock now, API later) ----------------
// وقتی بک‌اند آماده شد، baseUrl رو ست کن (مثال: "https://api.example.com")
const COMMENTS_API_BASE_URL = ""; // فعلاً خالی => Mock + LocalStorage
const commentsClient = createCommentsClient({
  baseUrl: COMMENTS_API_BASE_URL,
  // اگر مسیرهای APIت فرق داشت، اینجا override می‌کنی:
  // routes: { list: ({entityType, entityId}) => `${COMMENTS_API_BASE_URL}/...` }
});

const salonId = "salon-1"; // بعداً از route/params می‌گیری

// نکته: فقط طراحی/استراکچر UI است. داده‌ها را بعداً از API می‌گیری و به mountSalonDetails پاس می‌دهی.
const detailsRoot = document.getElementById("salon-details");
mountSalonDetails(detailsRoot, {
  salonId,
  name: "سالن زیبایی حدیث",
  location: "تهران، سعادت‌آباد",
  rating: 4.8,
  badges: ["پرطرفدار"],

  comments: {
    entityType: "salon",
    entityId: salonId,
    client: commentsClient,
    currentUser: { name: "شما" },
  },

  // tabs: [...]
});

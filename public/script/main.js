import { mountHeader } from "/public/script/components/header.js";
import { mountSalonGallery } from "/public/script/components/salonGallery.js";
import { mountSalonDetails } from "/public/script/components/salonDetails.js";

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
// نکته: فقط طراحی/استراکچر UI است. داده‌ها را بعداً از API می‌گیری و به mountSalonDetails پاس می‌دهی.
const detailsRoot = document.getElementById("salon-details");
mountSalonDetails(detailsRoot, {
  name: "سالن زیبایی حدیث",
  location: "تهران، سعادت‌آباد",
  rating: 4.8,
  badges: ["پرطرفدار"],
  // tabs: [...]
});

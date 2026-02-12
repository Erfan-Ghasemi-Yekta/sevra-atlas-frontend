import { mountHeader } from "/public/script/components/header.js";

const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  // تو لینک لوگو رو خودت می‌ذاری
  logoSrc: "/public/assent/img/logo.jpg", // مثال: "./public/logo.png"
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});
import { mountSalonGallery } from "/public/script/components/salonGallery.js";

// گالری رو داخل div#salon-gallery می‌ریزیم
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

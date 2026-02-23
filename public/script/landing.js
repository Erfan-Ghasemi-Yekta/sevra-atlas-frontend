// public/script/landing.js

import { mountHeader } from "/public/script/components/header.js";
import { mountSearchBar } from "/public/script/components/landing-searchBar.js";
import { enableStickyHeader } from "/public/script/utils/stickyHeader.js";

// --- Header ---
const headerRoot = document.getElementById("appHeader");

mountHeader(headerRoot, {
  // اگر لوگو داری مسیر بده
  // logoSrc: "./assets/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// Sticky effects (shadow/border on scroll)
enableStickyHeader(headerRoot, { threshold: 8 });

// --- Search Bar ---
const searchRoot = document.getElementById("searchMount");

mountSearchBar(searchRoot, {
  placeholder: "سالن، آرایشگران، خدمات…",
  debounceMs: 250,
  minChars: 0,

  onChange: (value) => {
    // فعلاً فقط لاگ — بعداً اینجا API یا فیلتر کارت‌ها
    console.log("search change:", value);
  },

  onSubmit: (value) => {
    console.log("search submit:", value);
    // مثال: رفتن به صفحه نتایج
    // window.location.href = `/public/salon.html?q=${encodeURIComponent(value)}`;
  },
});

// (اختیاری) Event-based usage بدون coupling مستقیم
document.addEventListener("search:submit", (e) => {
  // console.log("event search submit:", e.detail.value);
});
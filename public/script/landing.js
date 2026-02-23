// public/script/landing.js

import { mountHeader } from "/public/script/components/header.js";
import { mountSearchBar } from "/public/script/components/landing-searchBar.js";

const headerRoot = document.getElementById("appHeader");
mountHeader(headerRoot, {
logoSrc: "/public/assets/img/logo.png",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

const searchRoot = document.getElementById("searchMount");

mountSearchBar(searchRoot, {
  placeholder: "سالن، آرایشگران، خدمات…",
  debounceMs: 250,
  minChars: 0,

  onChange: (value) => {
    // فعلاً فقط لاگ. بعداً اینجا می‌تونی API call یا فیلتر کارت‌ها رو بزنی.
    console.log("search change:", value);
  },

  onSubmit: (value) => {
    console.log("search submit:", value);
    // مثال: رفتن به صفحه نتایج (بعداً اگر ساختی)
    // window.location.href = `/public/salon.html?q=${encodeURIComponent(value)}`;
  },
});

// (اختیاری) نمونه استفاده از event های کامپوننت بدون import callback
document.addEventListener("search:submit", (e) => {
  // e.detail.value
  // این سبک به ماژولار بودن کمک می‌کنه چون وابستگی مستقیم کمتر میشه.
});
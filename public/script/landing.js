// public/script/landing.js

import { mountHeader } from "/public/script/components/header.js";
import { mountSearchBar } from "/public/script/components/landing-searchBar.js";
import { enableStickyHeader } from "/public/script/utils/stickyHeader.js";
import { mountTopStaff } from "/public/script/components/landing-topStaff.js";
import { mountPopularSalons } from "/public/script/components/landing-popularSalons.js";

// --- Header ---
const headerRoot = document.getElementById("appHeader");

mountHeader(headerRoot, {
  logoSrc: "/public/assets/img/logo.png",
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

// --- Popular Salons (static) ---
const popularSalonsRoot = document.getElementById("popularSalonsMount");

mountPopularSalons(popularSalonsRoot, {
  title: "محبوب ترین سالن های زیبایی",
  ctaText: "مشاهده همه",
  ctaHref: "/public/salons.html",

  // فعلاً استاتیک — بعداً از API پر می‌کنی
  items: [
    {
      rank: 1,
      city: "تهران",
      views: 11,
      name: "سالن زیبایی تهران",
      subtitle: "کاشت ناخن | شروع قیمت ها از 150 هزار تومان",
      imageSrc: "/public/assets/img/img-for-test/img-1.jpg",
      detailsText: "جزئیات",
      href: "/public/salon.html",
    },
    {
      rank: 2,
      city: "تهران",
      views: 8,
      name: "سالن لیدی لند",
      subtitle: "میکاپ | شروع قیمت ها از 200 هزار تومان",
      imageSrc: "/public/assets/img/img-for-test/img-2.jpg",
      detailsText: "جزئیات",
      href: "/public/salon.html",
    },
    {
      rank: 3,
      city: "تهران",
      views: 15,
      name: "سالن آریانا",
      subtitle: "رنگ و لایت | شروع قیمت ها از 250 هزار تومان",
      imageSrc: "/public/assets/img/img-for-test/img-3.jpg",
      detailsText: "جزئیات",
      href: "/public/salon.html",
    },
    {
      rank: 4,
      city: "تهران",
      views: 6,
      name: "سالن نیلوفر",
      subtitle: "فیشال | شروع قیمت ها از 180 هزار تومان",
      imageSrc: "/public/assets/img/img-for-test/img-4.jpg",
      detailsText: "جزئیات",
      href: "/public/salon.html",
    },
  ],
});

// --- Top Staff (static) ---
const topStaffRoot = document.getElementById("topStaffMount");

mountTopStaff(topStaffRoot, {
  title: "برترین کارکنان ماه بهمن",
  ctaText: "مشاهده همه",
  ctaHref: "/public/staff.html",

  // فعلاً استاتیک — بعداً از API پر می‌کنی
  slides: [
    [
      {
        name: "سارا محسنی",
        rating: 4.8,
        reviewsText: "نظرات (۱۳ نظر)",
        jobsDoneText: "۱۲۰ خدمت انجام‌شده",
        specialty: "ناخن‌کار، ترمیم و کاشت تخصصی",
        // اگر عکس تست داری، این مسیر رو عوض کن (در صورت نبود عکس، fallback نمایش داده می‌شه)
        imageSrc: "/public/assets/img/img-for-test/img-1.jpg",
        profileHref: "/public/staff.html",
      },
      {
        name: "سارا محسنی",
        rating: 4.8,
        reviewsText: "نظرات (۱۳ نظر)",
        jobsDoneText: "۱۲۰ خدمت انجام‌شده",
        specialty: "ناخن‌کار، ترمیم و کاشت تخصصی",
        imageSrc: "/public/assets/img/img-for-test/img-2.jpg",
        profileHref: "/public/staff.html",
      },
    ],
    [
      {
        name: "هانیه کریمی",
        rating: 4.7,
        reviewsText: "نظرات (۸ نظر)",
        jobsDoneText: "۹۵ خدمت انجام‌شده",
        specialty: "میکاپ و شینیون",
        imageSrc: "/public/assets/img/img-for-test/img-3.jpg",
        profileHref: "/public/staff.html",
      },
      {
        name: "مریم احمدی",
        rating: 4.9,
        reviewsText: "نظرات (۲۱ نظر)",
        jobsDoneText: "۱۴۰ خدمت انجام‌شده",
        specialty: "رنگ و لایت",
        imageSrc: "/public/assets/img/img-for-test/img-4.jpg",
        profileHref: "/public/staff.html",
      },
    ],
    [
      {
        name: "نرگس شریفی",
        rating: 4.6,
        reviewsText: "نظرات (۵ نظر)",
        jobsDoneText: "۷۲ خدمت انجام‌شده",
        specialty: "پاکسازی و فیشال",
        imageSrc: "/public/assets/img/img-for-test/img-5.jpg",
        profileHref: "/public/staff.html",
      },
      {
        name: "الهام رستمی",
        rating: 4.8,
        reviewsText: "نظرات (۱۵ نظر)",
        jobsDoneText: "۱۱۰ خدمت انجام‌شده",
        specialty: "ابرو و مژه",
        imageSrc: "/public/assets/img/img-for-test/img-6.jpg",
        profileHref: "/public/staff.html",
      },
    ],
    [
      {
        name: "آوا حسینی",
        rating: 4.8,
        reviewsText: "نظرات (۱۲ نظر)",
        jobsDoneText: "۱۰۲ خدمت انجام‌شده",
        specialty: "مانیکور و پدیکور",
        imageSrc: "/public/assets/img/img-for-test/img-7.jpg",
        profileHref: "/public/staff.html",
      },
      {
        name: "نوشین رحیمی",
        rating: 4.7,
        reviewsText: "نظرات (۹ نظر)",
        jobsDoneText: "۸۹ خدمت انجام‌شده",
        specialty: "اصلاح و براشینگ",
        imageSrc: "/public/assets/img/img-for-test/img-8.jpg",
        profileHref: "/public/staff.html",
      },
    ],
  ],
});


// (اختیاری) Event-based usage بدون coupling مستقیم
document.addEventListener("search:submit", (e) => {
  // console.log("event search submit:", e.detail.value);
});
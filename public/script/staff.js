import { mountHeader } from "/public/script/components/header.js";
import {
  mountStaffPortfolio,
  createStaffPortfolioClient,
} from "/public/script/components/staffPortfolio.js";
import { mountStaffProfile } from "/public/script/components/staffProfile.js";

// ---------------- Header ----------------
const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  logoSrc: "/public/assent/img/logo.jpg",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// ---------------- Portfolio (Mock now, API later) ----------------
const PORTFOLIO_API_BASE_URL = ""; // وقتی بک‌اند آماده شد، اینو پر کن
const portfolioClient = createStaffPortfolioClient({
  baseUrl: PORTFOLIO_API_BASE_URL,
  // اگر مسیر APIت فرق داشت، اینجا override می‌کنی:
  // routes: { list: ({staffId}) => `${PORTFOLIO_API_BASE_URL}/portfolio?staffId=${staffId}` }
});

const staffId = "staff-1"; // بعداً از route/params می‌گیری

const portfolioRoot = document.getElementById("staff-portfolio");
mountStaffPortfolio(portfolioRoot, {
  staffId,
  client: portfolioClient,

  // seedImages فقط برای Mock/LocalStorage (فعلاً)
  seedImages: [
    "/public/assent/img/img-for-test/img-1.jpg",
    "/public/assent/img/img-for-test/img-2.jpg",
    "/public/assent/img/img-for-test/img-3.jpg",
    "/public/assent/img/img-for-test/img-4.jpg",
    "/public/assent/img/img-for-test/img-1.jpg",
    "/public/assent/img/img-for-test/img-2.jpg",
  ],

  title: "نمونه کار",
  previewCount: 4,
});

// ---------------- Staff Profile ----------------
const profileRoot = document.getElementById("staff-profile");
mountStaffProfile(profileRoot, {
  name: "مهسا محبی",
  role: "سالن زیبایی مهسا بیوتی",
  rating: 4.8,
  avatarSrc: "/public/assent/img/img-for-test/img-4.jpg",
});

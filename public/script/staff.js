import { mountHeader } from "/public/script/components/header.js";
import {
  mountStaffPortfolio,
  createStaffPortfolioClient,
} from "/public/script/components/staffPortfolio.js";
import { mountStaffProfile } from "/public/script/components/staffProfile.js";
import { mountStaffDetails } from "/public/script/components/staffDetails.js";

// Header
const headerRoot = document.getElementById("app-header");
mountHeader(headerRoot, {
  logoSrc: "/public/assent/img/logo.jpg",
  logoAlt: "SEVRA",
  cityLabel: "شهر خود را انتخاب کنید",
});

// Portfolio (Mock now, API later)
const PORTFOLIO_API_BASE_URL = "";
const portfolioClient = createStaffPortfolioClient({ baseUrl: PORTFOLIO_API_BASE_URL });

const staffId = "staff-1";

const portfolioRoot = document.getElementById("staff-portfolio");
mountStaffPortfolio(portfolioRoot, {
  staffId,
  client: portfolioClient,
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

// Profile
const profileRoot = document.getElementById("staff-profile");
mountStaffProfile(profileRoot, {
  name: "مهسا محبی",
  role: "میکاپ آرتیست تخصصی عروس",
  rating: 4.8,
  avatarSrc: "/public/assent/img/img-for-test/img-4.jpg",
});

// ✅ Details (Description + Specialties)
const detailsRoot = document.getElementById("staff-details");
mountStaffDetails(detailsRoot, {
  description:
    "با بیش از 5 سال تجربه در زمینه آرایش تخصصی عروس، تمرکز من روی\nطبیعی‌سازی چهره و ماندگاری بالا در طول مراسم است.\nهر خدمات متناسب با فرم صورت و سلیقه شما شخصی‌سازی می‌شود.",
  specialties: [
    { id: "classic-bridal", title: "آرایش عروس کلاسیک", priceToman: 280000, durationMin: 90 },
    { id: "contouring", title: "گریم تخصصی و کانتورینگ", priceToman: 280000, durationMin: 90 },
  ],
});


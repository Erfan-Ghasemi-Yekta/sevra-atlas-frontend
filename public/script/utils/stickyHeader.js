// public/script/utils/stickyHeader.js
export function enableStickyHeader(containerEl, { threshold = 8 } = {}) {
  if (!containerEl) return;

  const onScroll = () => {
    const scrolled = window.scrollY > threshold;

    containerEl.classList.toggle(
      "shadow-[0_10px_24px_rgba(49,49,49,0.10)]",
      scrolled
    );
    containerEl.classList.toggle("border-b", scrolled);
    containerEl.classList.toggle("border-[#F0F1F7]", scrolled);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => window.removeEventListener("scroll", onScroll);
} 
/* =====================================================
   main.js
   - Mobile menu open/close
   - Language switch AR/DE + RTL/LTR
   - Year
   ===================================================== */

/* YEAR */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =========================
   MOBILE MENU
   ========================= */
const menuBtn = document.querySelector(".menu-btn");
const overlay = document.getElementById("mobileMenu");
const closeBtn = overlay ? overlay.querySelector(".menu-close") : null;
const panel = overlay ? overlay.querySelector(".menu-panel") : null;

function openMenu() {
  if (!overlay) return;
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
  if (!overlay) return;
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
  if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
}

if (menuBtn) menuBtn.addEventListener("click", openMenu);
if (closeBtn) closeBtn.addEventListener("click", closeMenu);

/* close when click outside panel */
if (overlay && panel) {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  /* close when click any menu link */
  overlay.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", closeMenu);
  });
}

/* ESC close */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

/* =========================
   LANGUAGE SWITCH
   ========================= */
const langButtons = document.querySelectorAll(".lang-btn");

function setLang(lang) {
  if (lang === "de") {
    document.documentElement.lang = "de";
    document.documentElement.dir = "ltr";
    langButtons.forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === "de" ? "true" : "false"));
  } else {
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    langButtons.forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === "ar" ? "true" : "false"));
  }
}

langButtons.forEach(btn => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});
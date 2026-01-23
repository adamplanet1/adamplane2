/* =====================================================
   main.js
   - Mobile menu toggle (robust)
   - Close on outside click / Esc / link click
   - Language switch AR/DE + RTL/LTR + localStorage
   - Footer year
   ===================================================== */

(function () {
  // Year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Elements
  const htmlEl = document.documentElement;

  const menuBtn = document.querySelector(".menu-btn");
  const overlay = document.getElementById("mobileMenu");
  const closeBtn = overlay ? overlay.querySelector(".menu-close") : null;
  const panel = overlay ? overlay.querySelector(".menu-panel") : null;

  // ===== i18n dictionary =====
  const I18N = {
    ar: {
      nav_home: "الرئيسية",
      nav_gifts: "الهدايا",
      nav_decoration: "الديكور",
      nav_kids: "هدايا الأطفال",
      nav_service: "الخدمات",
      menu_btn: "Menu",
      menu_title: "Menu",
      hero_title_1: "مرحبًا بكم في",
      hero_subtitle: "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",
      card_gifts_title: "الهدايا 🎁",
      card_gifts_text: "أفكار هدايا مميزة لكل المناسبات.",
      card_decoration_title: "الديكور 🏠",
      card_decoration_text: "لمسات ديكور تضيف جمالًا للمكان.",
      card_kids_title: "هدايا الأطفال 🧸",
      card_kids_text: "هدايا مصنوعة بحب وآمنة للأطفال.",
      card_service_title: "الخدمات 🛠️",
      card_service_text: "خدمات مخصصة حسب الطلب.",
      card_btn: "عرض القسم →"
    },
    de: {
      nav_home: "Startseite",
      nav_gifts: "Geschenke",
      nav_decoration: "Dekoration",
      nav_kids: "Kinder-Geschenke",
      nav_service: "Service",
      menu_btn: "Menü",
      menu_title: "Menü",
      hero_title_1: "Willkommen bei",
      hero_subtitle: "Hier findest du handgemachte Geschenke, Kinder-Deko und verschiedene Services.",
      card_gifts_title: "Geschenke 🎁",
      card_gifts_text: "Besondere Geschenkideen für jeden Anlass.",
      card_decoration_title: "Dekoration 🏠",
      card_decoration_text: "Deko-Highlights für dein Zuhause.",
      card_kids_title: "Kinder-Geschenke 🧸",
      card_kids_text: "Liebevoll gemacht und kinderfreundlich.",
      card_service_title: "Service 🛠️",
      card_service_text: "Individuelle Services nach Wunsch.",
      card_btn: "Bereich ansehen →"
    }
  };

  // ===== Language switch =====
  const langButtons = document.querySelectorAll(".lang-btn");
  const applyLang = (lang) => {
    const dict = I18N[lang] || I18N.ar;

    // Set html lang/dir
    if (lang === "de") {
      htmlEl.lang = "de";
      htmlEl.dir = "ltr";
      document.body.style.direction = "ltr";
    } else {
      htmlEl.lang = "ar";
      htmlEl.dir = "rtl";
      document.body.style.direction = "rtl";
    }

    // Update pressed state
    langButtons.forEach((b) => {
      const isActive = b.dataset.lang === lang;
      b.setAttribute("aria-pressed", String(isActive));
    });

    // Replace text by data-i18n
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) el.textContent = dict[key];
    });

    // Save
    try {
      localStorage.setItem("dekokraft_lang", lang);
    } catch (_) {}
  };

  // Load saved language
  let savedLang = "ar";
  try {
    savedLang = localStorage.getItem("dekokraft_lang") || "ar";
  } catch (_) {}
  applyLang(savedLang);

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang || "ar");
    });
  });

  // ===== Mobile menu =====
  if (!menuBtn || !overlay || !panel) return;

  const openMenu = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  // Ensure closed on load
  closeMenu();

  menuBtn.addEventListener("click", () => {
    const isOpen = overlay.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  // Click outside panel closes
  overlay.addEventListener("click", () => closeMenu());

  // Click inside panel does NOT close
  panel.addEventListener("click", (e) => e.stopPropagation());

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  // Close when clicking any link inside menu
  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });
})();

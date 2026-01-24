/* =====================================================
   main.js
   - Mobile menu toggle (robust)
   - Close on outside click / Esc / link click
   - Language switch AR/DE + RTL/LTR + localStorage
   - Footer year
   ===================================================== */

(function () {
  /* ===============================
     FOOTER YEAR
     =============================== */
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ===============================
     ELEMENTS
     =============================== */
  const htmlEl = document.documentElement;
  const bodyEl = document.body;

  const menuBtn = document.querySelector(".menu-btn");
  const overlay = document.getElementById("mobileMenu");
  const closeBtn = overlay ? overlay.querySelector(".menu-close") : null;
  const panel = overlay ? overlay.querySelector(".menu-panel") : null;

  /* ===============================
     I18N DICTIONARY
     =============================== */
  const I18N = {
    ar: {
      nav_home: "الرئيسية",
      nav_gifts: "الهدايا",
      nav_decoration: "الديكور",
      nav_kids: "هدايا الأطفال",
      nav_service: "الخدمات",
      menu_title: "القائمة",

      hero_title_1: "مرحبًا بكم في",
      hero_subtitle:
        "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",

      card_gifts_title: "الهدايا 🎁",
      card_gifts_text: "أفكار هدايا مميزة لكل المناسبات.",
      card_decoration_title: "الديكور 🏠",
      card_decoration_text: "لمسات ديكور تضيف جمالًا للمكان.",
      card_kids_title: "هدايا الأطفال 🧸",
      card_kids_text: "هدايا مصنوعة بحب وآمنة للأطفال.",
      card_service_title: "الخدمات 🛠️",
      card_service_text: "خدمات مخصصة حسب الطلب.",
      card_btn: "عرض القسم →",

      contact_title: "التواصل",
      contact_social: "وسائل التواصل",
      contact_direct: "مباشر"
    },

    de: {
      nav_home: "Startseite",
      nav_gifts: "Geschenke",
      nav_decoration: "Dekoration",
      nav_kids: "Kinder-Geschenke",
      nav_service: "Service",
      menu_title: "Menü",

      hero_title_1: "Willkommen bei",
      hero_subtitle:
        "Hier findest du handgemachte Geschenke, Kinder-Deko und verschiedene Services.",

      card_gifts_title: "Geschenke 🎁",
      card_gifts_text: "Besondere Geschenkideen für jeden Anlass.",
      card_decoration_title: "Dekoration 🏠",
      card_decoration_text: "Deko-Highlights für dein Zuhause.",
      card_kids_title: "Kinder-Geschenke 🧸",
      card_kids_text: "Liebevoll gemacht und kinderfreundlich.",
      card_service_title: "Service 🛠️",
      card_service_text: "Individuelle Services nach Wunsch.",
      card_btn: "Bereich ansehen →",

      contact_title: "KONTAKT",
      contact_social: "Social",
      contact_direct: "Direkt"
    }
  };

  /* ===============================
     LANGUAGE SWITCH
     =============================== */
  const langButtons = document.querySelectorAll(".lang-btn");

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.ar;

    if (lang === "de") {
      htmlEl.lang = "de";
      htmlEl.dir = "ltr";
      bodyEl.style.direction = "ltr";
    } else {
      htmlEl.lang = "ar";
      htmlEl.dir = "rtl";
      bodyEl.style.direction = "rtl";
    }

    langButtons.forEach((btn) => {
      btn.setAttribute(
        "aria-pressed",
        btn.dataset.lang === lang ? "true" : "false"
      );
    });

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    try {
      localStorage.setItem("dekokraft_lang", lang);
    } catch (e) {}
  }

  let savedLang = "ar";
  try {
    savedLang = localStorage.getItem("dekokraft_lang") || "ar";
  } catch (e) {}

  applyLang(savedLang);

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
    });
  });

  /* ===============================
     MOBILE MENU
     =============================== */
  if (!menuBtn || !overlay || !panel) return;

  function openMenu() {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    bodyEl.classList.add("menu-open");
  }

  function closeMenu() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    bodyEl.classList.remove("menu-open");
  }

  closeMenu();

  menuBtn.addEventListener("click", () => {
    overlay.classList.contains("is-open") ? closeMenu() : openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeMenu();
    });
  }

  overlay.addEventListener("click", () => closeMenu());
  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeMenu();
    }
  });

  overlay.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });
})();
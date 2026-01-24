/* =========================================================
   DekoKraft - main.js
   - Language switch AR/DE (localStorage)
   - Robust mobile menu (click outside / ESC)
   - Load products from assets/data/products.json
   - Index: categories + random mixed products
   - Category page: products of one category
   - Product page: one product + related products
   ========================================================= */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const LS_LANG = "dekokraft_lang";
  const DATA_URL = "assets/data/products.json";

  // ---------------------------------------------------------
  // Language
  // ---------------------------------------------------------
  const I18N = {
    ar: {
      nav_home: "الرئيسية",
      nav_gifts: "الهدايا",
      nav_decor: "الديكور",
      nav_kids: "هدايا الأطفال",
      nav_services: "الخدمات",
      nav_contact: "التواصل",
      menu: "Menu",

      hero_title_1: "مرحباً بكم في ",
      hero_subtitle: "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",

      cat_gifts_title: "الهدايا 🎁",
      cat_gifts_text: "أفكار هدايا مميزة لكل المناسبات.",
      cat_decor_title: "الديكور 🏡",
      cat_decor_text: "لمسات ديكور تضيف جمالاً للمكان.",
      cat_kids_title: "هدايا الأطفال 🧸",
      cat_kids_text: "هدايا مصنوعة بحب وآمنة للأطفال.",
      cat_services_title: "الخدمات 🛠️",
      cat_services_text: "خدمات مخصصة حسب الطلب.",

      view_section: "عرض القسم →",

      random_products: "منتجات مختارة",
      similar_products: "منتجات مشابهة",

      kontakt: "KONTAKT",
      kontakt_direct: "مباشراً",
      kontakt_social: "وسائل التواصل",
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      facebook: "Facebook",
      instagram: "Instagram",
      email: "Email",

      back_to_category: "العودة للقسم"
    },
    de: {
      nav_home: "Startseite",
      nav_gifts: "Geschenke",
      nav_decor: "Dekoration",
      nav_kids: "Kinder-Geschenke",
      nav_services: "Services",
      nav_contact: "Kontakt",
      menu: "Menu",

      hero_title_1: "Willkommen bei ",
      hero_subtitle: "Hier finden Sie liebevoll gemachte Geschenke, Kinder-Deko und vielfältige Services.",

      cat_gifts_title: "Geschenke 🎁",
      cat_gifts_text: "Besondere Geschenkideen für alle Anlässe.",
      cat_decor_title: "Dekoration 🏡",
      cat_decor_text: "Schöne Dekoration für Ihr Zuhause.",
      cat_kids_title: "Kinder-Geschenke 🧸",
      cat_kids_text: "Sicheres & liebevolles für Kinder.",
      cat_services_title: "Services 🛠️",
      cat_services_text: "Individuelle Dienstleistungen nach Wunsch.",

      view_section: "Bereich ansehen →",

      random_products: "Ausgewählte Produkte",
      similar_products: "Ähnliche Produkte",

      kontakt: "KONTAKT",
      kontakt_direct: "Direkt",
      kontakt_social: "Soziale Medien",
      whatsapp: "WhatsApp",
      telegram: "Telegram",
      facebook: "Facebook",
      instagram: "Instagram",
      email: "E-Mail",

      back_to_category: "Zurück zur Kategorie"
    }
  };

  function getLang() {
    return localStorage.getItem(LS_LANG) || "ar";
  }

  function setLang(lang) {
    localStorage.setItem(LS_LANG, lang);
    applyLang(lang);
    // re-render pages that depend on language
    bootstrap();
  }

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.ar;

    // RTL/LTR
    document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);

    // Toggle active lang buttons
    $$(".lang button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    // Set text for elements having data-i18n
    $$("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
  }

  // ---------------------------------------------------------
  // Menu (robust)
  // ---------------------------------------------------------
  function setupMenu() {
    const btn = $(".menu-btn");
    const overlay = $("#mobileMenu");
    if (!btn || !overlay) return;

    const closeBtn = $(".menu-close", overlay);

    const open = () => overlay.classList.add("open");
    const close = () => overlay.classList.remove("open");

    btn.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);

    // click outside panel closes
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });

    // ESC closes
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // clicking a link closes
    $$(".menu-links a", overlay).forEach(a => {
      a.addEventListener("click", () => close());
    });
  }

  // ---------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------
  async function loadProducts() {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Cannot load products.json");
    const json = await res.json();
    return Array.isArray(json.products) ? json.products : [];
  }

  function byId(products, id) {
    return products.find(p => String(p.id) === String(id));
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getParam(name) {
    const u = new URL(window.location.href);
    return u.searchParams.get(name);
  }

  // ---------------------------------------------------------
  // Rendering helpers
  // ---------------------------------------------------------
  function productCardHTML(p, lang) {
    const title = p?.title?.[lang] || p?.title?.ar || p?.id || "";
    const desc = p?.description?.[lang] || p?.description?.ar || "";
    const img = p?.image || "";
    return `
      <article class="card product" data-product-id="${p.id}">
        <div class="badge">neu</div>
        <div class="card-media">
          <img src="${img}" alt="${escapeHtml(title)}" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(title)}</h3>
          <p class="card-text">${escapeHtml(desc)}</p>
        </div>
      </article>
    `;
  }

  function categoryCardHTML(catKey, lang, dict) {
    // catKey: gifts | decor | kids | services
    const map = {
      gifts: { icon: "🎁", titleKey: "cat_gifts_title", textKey: "cat_gifts_text", img: "assets/images/products/gifts/gift-001.webp" },
      decor: { icon: "🏡", titleKey: "cat_decor_title", textKey: "cat_decor_text", img: "assets/images/products/decor/decor-001.webp" },
      kids: { icon: "🧸", titleKey: "cat_kids_title", textKey: "cat_kids_text", img: "assets/images/products/kids/kids-001.webp" },
      services: { icon: "🛠️", titleKey: "cat_services_title", textKey: "cat_services_text", img: "assets/images/products/services/service-001.webp" }
    };
    const c = map[catKey];
    const title = dict[c.titleKey];
    const text = dict[c.textKey];
    const btnText = dict.view_section;

    return `
      <article class="card">
        <div class="badge">neu</div>
        <div class="card-media">
          <img src="${c.img}" alt="${escapeHtml(title)}" loading="lazy">
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(title)}</h3>
          <p class="card-text">${escapeHtml(text)}</p>
          <div class="card-actions">
            <a class="btn" href="category.html?cat=${encodeURIComponent(catKey)}">${escapeHtml(btnText)}</a>
          </div>
        </div>
      </article>
    `;
  }

  function wireProductClicks(root = document) {
    $$(".card.product", root).forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-product-id");
        if (!id) return;
        window.location.href = `product.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ---------------------------------------------------------
  // Pages
  // ---------------------------------------------------------
  async function renderIndex() {
    const lang = getLang();
    const dict = I18N[lang];

    // hero title
    const heroTitle = $("#heroTitle");
    if (heroTitle) {
      heroTitle.innerHTML = `${escapeHtml(dict.hero_title_1)}<span class="brand-word">DekoKraft</span>`;
    }

    const catGrid = $("#categoriesGrid");
    const prodGrid = $("#randomProductsGrid");
    const prodTitle = $("#randomProductsTitle");
    if (prodTitle) prodTitle.textContent = dict.random_products;

    if (!catGrid || !prodGrid) return;

    // categories
    catGrid.innerHTML = ["gifts","decor","kids","services"]
      .map(k => categoryCardHTML(k, lang, dict))
      .join("");

    // products mixed random
    const products = await loadProducts();
    const mixed = shuffle(products).slice(0, 8); // show 8 random products
    prodGrid.innerHTML = mixed.map(p => productCardHTML(p, lang)).join("");

    wireProductClicks();
  }

  async function renderCategory() {
    const lang = getLang();
    const dict = I18N[lang];

    const cat = (getParam("cat") || "").toLowerCase();
    const titleEl = $("#categoryTitle");
    const grid = $("#categoryGrid");
    if (!grid) return;

    // title
    const catTitles = {
      gifts: dict.cat_gifts_title,
      decor: dict.cat_decor_title,
      kids: dict.cat_kids_title,
      services: dict.cat_services_title
    };
    if (titleEl) titleEl.textContent = catTitles[cat] || cat;

    const products = await loadProducts();
    const filtered = products.filter(p => String(p.category).toLowerCase() === cat);
    grid.innerHTML = filtered.map(p => productCardHTML(p, lang)).join("");

    wireProductClicks();
  }

  async function renderProduct() {
    const lang = getLang();
    const dict = I18N[lang];

    const id = getParam("id");
    const products = await loadProducts();
    const p = byId(products, id);

    const titleEl = $("#productTitle");
    const descEl = $("#productDesc");
    const mainImg = $("#productMainImg");
    const thumbs = $("#thumbRow");
    const relatedTitle = $("#relatedTitle");
    const relatedGrid = $("#relatedGrid");
    const backLink = $("#backToCategory");

    if (!p) {
      if (titleEl) titleEl.textContent = "Not found";
      return;
    }

    const title = p?.title?.[lang] || p?.title?.ar || p.id;
    const desc = p?.description?.[lang] || p?.description?.ar || "";
    const main = p.image || (p.images && p.images[0]) || "";

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (mainImg) mainImg.src = main;

    // back link to category
    if (backLink) {
      backLink.textContent = dict.back_to_category;
      backLink.href = `category.html?cat=${encodeURIComponent(p.category)}`;
    }

    // thumbs
    if (thumbs) {
      const images = Array.isArray(p.images) && p.images.length ? p.images : [main];
      thumbs.innerHTML = images.map(src => `
        <div class="thumb" data-src="${src}">
          <img src="${src}" alt="" loading="lazy">
        </div>
      `).join("");
      $$(".thumb", thumbs).forEach(t => {
        t.addEventListener("click", () => {
          const src = t.getAttribute("data-src");
          if (src && mainImg) mainImg.src = src;
        });
      });
    }

    // related
    if (relatedTitle) relatedTitle.textContent = dict.similar_products;

    if (relatedGrid) {
      const ids = Array.isArray(p.related) ? p.related : [];
      const rel = ids.map(rid => byId(products, rid)).filter(Boolean);
      // if none: show random from same category
      const fallback = shuffle(products.filter(x => x.category === p.category && x.id !== p.id)).slice(0, 6);
      const list = rel.length ? rel : fallback;

      relatedGrid.innerHTML = list.map(x => productCardHTML(x, lang)).join("");
      wireProductClicks(relatedGrid);
    }
  }

  // ---------------------------------------------------------
  // Bootstrap
  // ---------------------------------------------------------
  async function bootstrap() {
    const lang = getLang();
    applyLang(lang);

    const page = document.body.getAttribute("data-page");
    try {
      if (page === "index") await renderIndex();
      if (page === "category") await renderCategory();
      if (page === "product") await renderProduct();
    } catch (e) {
      console.error(e);
    }
  }

  // init events once
  function init() {
    // Language buttons
    $$(".lang button").forEach(btn => {
      btn.addEventListener("click", () => setLang(btn.dataset.lang));
    });

    setupMenu();

    // year
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    bootstrap();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
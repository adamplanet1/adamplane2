/* =========================================================
   DekoKraft - main.js
   - Menu toggle (mobile)
   - Language switch AR/DE + RTL/LTR + localStorage
   - Load products.json
   - Render product page + related
   - Robust responsive images: prefers -600/-1200 webp
========================================================= */

(() => {
  "use strict";

  const DATA_URL = "assets/data/products.json";
  const LS_LANG_KEY = "dekokraft_lang";

  // -----------------------------
  // Helpers
  // -----------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function safeText(el, txt) {
    if (el) el.textContent = txt ?? "";
  }

  function getPageType() {
    return document.body?.dataset?.page || "";
  }

  // -----------------------------
  // i18n dictionary
  // -----------------------------
  const I18N = {
    ar: {
      menu: "Menu",
      nav_home: "الرئيسية",
      nav_gifts: "الهدايا",
      nav_decor: "الديكور",
      nav_kids: "هدايا الأطفال",
      nav_services: "الخدمات",
      nav_contact: "التواصل",

      // kontakt
      kontakt_title: "KONTAKT",
      kontakt_direct: "مباشر",
      kontakt_social: "وسائل التواصل",
      label_whatsapp: "WhatsApp",
      label_email: "Email",
      label_instagram: "Instagram",
      label_facebook: "Facebook",

      // product page
      product_related_title: "منتجات مشابهة",
      back_home: "العودة للرئيسية",
    },
    de: {
      menu: "Menu",
      nav_home: "Startseite",
      nav_gifts: "Geschenke",
      nav_decor: "Dekoration",
      nav_kids: "Kinder-Geschenke",
      nav_services: "Services",
      nav_contact: "Kontakt",

      // kontakt
      kontakt_title: "KONTAKT",
      kontakt_direct: "Direkt",
      kontakt_social: "Social",
      label_whatsapp: "WhatsApp",
      label_email: "E-Mail",
      label_instagram: "Instagram",
      label_facebook: "Facebook",

      // product page
      product_related_title: "Ähnliche Produkte",
      back_home: "Zur Startseite",
    }
  };

  function getInitialLang() {
    const saved = localStorage.getItem(LS_LANG_KEY);
    if (saved === "ar" || saved === "de") return saved;
    // default: AR because your site is Arabic-first
    return "ar";
  }

  function applyLang(lang) {
    const dict = I18N[lang] || I18N.ar;

    // html lang + direction
    document.documentElement.lang = lang === "ar" ? "ar" : "de";
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // translate text nodes
    $$("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      if (dict[key] != null) el.textContent = dict[key];
    });

    // translate placeholders (optional)
    $$("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      if (dict[key] != null) el.setAttribute("placeholder", dict[key]);
    });

    // mark active language buttons
    $$("[data-lang]").forEach(btn => {
      const isActive = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    localStorage.setItem(LS_LANG_KEY, lang);

    // rerender product page content in the new language (if needed)
    if (getPageType() === "product") {
      renderProductPage(lang).catch(() => {});
    }
  }

  // -----------------------------
  // Mobile Menu (robust)
  // -----------------------------
  function setupMenu() {
    const btn = $(".menu-btn");
    const nav = $(".nav");
    if (!btn || !nav) return;

    // create backdrop dynamically (no HTML edits needed)
    let backdrop = $(".menu-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "menu-backdrop";
      document.body.appendChild(backdrop);
    }

    function open() {
      document.body.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
    }
    function close() {
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
    }
    function toggle() {
      document.body.classList.contains("menu-open") ? close() : open();
    }

    btn.addEventListener("click", toggle);
    backdrop.addEventListener("click", close);

    // close when clicking a link (mobile)
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      close();
    });

    // close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    // initial state
    btn.setAttribute("aria-expanded", "false");
  }

  // -----------------------------
  // Responsive Images (fix your issue)
  // -----------------------------
  function buildResponsiveWebp(url) {
    // If url already ends with -600.webp or -1200.webp, derive base
    // Else if url ends with .webp, derive -600/-1200 variants
    if (!url || typeof url !== "string") return null;

    const lower = url.toLowerCase();
    if (!lower.endsWith(".webp")) {
      return {
        src: url,
        srcset: "",
      };
    }

    const base = url.slice(0, -5); // remove ".webp"
    const has600 = base.endsWith("-600");
    const has1200 = base.endsWith("-1200");

    let core = base;
    if (has600) core = base.slice(0, -4);
    if (has1200) core = base.slice(0, -5);

    const src600 = `${core}-600.webp`;
    const src1200 = `${core}-1200.webp`;
    const fallback = `${core}.webp`;

    return { src600, src1200, fallback };
  }

  function setProductImg(imgEl, originalUrl, altText) {
    if (!imgEl) return;

    imgEl.alt = altText || "";
    imgEl.loading = "lazy";
    imgEl.decoding = "async";

    const r = buildResponsiveWebp(originalUrl);
    if (!r) {
      imgEl.src = originalUrl;
      return;
    }

    // Prefer -600 as main src (your case)
    imgEl.src = r.src600 || originalUrl;

    // Use srcset if we have both
    imgEl.srcset = r.src1200
      ? `${r.src600} 600w, ${r.src1200} 1200w`
      : "";

    // sensible sizes for cards / product page
    imgEl.sizes = "(max-width: 700px) 92vw, 520px";

    // Fallback chain:
    // 1) if -600 missing -> try fallback .webp
    // 2) if fallback missing -> keep broken (so you notice file naming)
    imgEl.onerror = () => {
      // already tried fallback? stop
      if (imgEl.dataset.fallbackTried === "1") return;

      imgEl.dataset.fallbackTried = "1";
      imgEl.srcset = ""; // avoid repeated requests
      imgEl.src = r.fallback || originalUrl;
    };
  }

  // -----------------------------
  // Data Loading
  // -----------------------------
  let _productsCache = null;

  async function loadProducts() {
    if (_productsCache) return _productsCache;
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products.json");
    const json = await res.json();
    _productsCache = json;
    return json;
  }

  function getLocalized(product, lang) {
    const l = lang === "de" ? "de" : "ar";
    const title = product?.title?.[l] ?? product?.title?.ar ?? "";
    const desc = product?.description?.[l] ?? product?.description?.ar ?? "";
    return { title, desc };
  }

  // -----------------------------
  // Product Page Rendering
  // Expects in product.html:
  // #productTitle, #productDesc, #productImg, #relatedGrid, #relatedTitle
  // -----------------------------
  async function renderProductPage(lang) {
    const page = getPageType();
    if (page !== "product") return;

    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) return;

    const data = await loadProducts();
    const products = data.products || [];
    const product = products.find(p => p.id === id);
    if (!product) return;

    const { title, desc } = getLocalized(product, lang);

    safeText($("#productTitle"), title);
    safeText($("#productDesc"), desc);

    const img = $("#productImg");
    setProductImg(img, product.image, title);

    // Related
    const relatedTitleEl = $("#relatedTitle");
    if (relatedTitleEl) {
      const dict = I18N[lang] || I18N.ar;
      relatedTitleEl.textContent = dict.product_related_title;
    }

    const grid = $("#relatedGrid");
    if (!grid) return;

    grid.innerHTML = "";
    const relatedIds = Array.isArray(product.related) ? product.related : [];
    const related = products.filter(p => relatedIds.includes(p.id));

    related.forEach(p => {
      const { title: t, desc: d } = getLocalized(p, lang);

      const a = document.createElement("a");
      a.className = "p-card";
      a.href = `product.html?id=${encodeURIComponent(p.id)}`;

      const media = document.createElement("div");
      media.className = "p-card__media";

      const im = document.createElement("img");
      setProductImg(im, p.image, t);
      media.appendChild(im);

      const body = document.createElement("div");
      body.className = "p-card__body";

      const h = document.createElement("h3");
      h.className = "p-card__title";
      h.textContent = t;

      const small = document.createElement("p");
      small.className = "p-card__desc";
      small.textContent = d;

      body.appendChild(h);
      body.appendChild(small);

      a.appendChild(media);
      a.appendChild(body);

      grid.appendChild(a);
    });
  }

  // -----------------------------
  // Language buttons
  // -----------------------------
  function setupLangButtons() {
    $$("[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (lang === "ar" || lang === "de") applyLang(lang);
      });
    });
  }

  // -----------------------------
  // Init
  // -----------------------------
  document.addEventListener("DOMContentLoaded", async () => {
    setupMenu();
    setupLangButtons();

    const lang = getInitialLang();
    applyLang(lang);

    // render product page if we are there
    if (getPageType() === "product") {
      try { await renderProductPage(lang); } catch (e) {}
    }
  });
})();
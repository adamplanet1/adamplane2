/* =========================
File: assets/js/main.js
Menu + AR/DE + JSON render + product gallery + fullscreen + swipe
NO Facebook
========================= */

(function () {
  // =========================
  // Helpers
  // =========================
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getParam = (key) => {
    const url = new URL(window.location.href);
    return url.searchParams.get(key);
  };

  const setParamWithoutReload = (key, value) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    history.replaceState({}, "", url.toString());
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  // Image resolver:
  // - For "stem": we expect it already includes the angle number like "...-01"
  // - Final files become: `${stem}-1200.webp` or `${stem}-600.webp`
  const imageCandidates = (stem) => ({
    w1200: `${stem}-1200.webp`,
    w600: `${stem}-600.webp`,
    fallback: "assets/images/logo/logo-dekokraft.png"
  });

  const loadImg = (imgEl, stem, alt = "") => {
    const { w1200, w600, fallback } = imageCandidates(stem);
    imgEl.alt = alt;

    imgEl.src = w1200;
    imgEl.onerror = () => {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = fallback;
      };
      imgEl.src = w600;
    };
  };

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // =========================
  // i18n
  // =========================
  const I18N = {
    ar: {
      menu: "Menu",
      nav_home: "الرئيسية",
      nav_candel: "الشموع",
      nav_gifts: "الهدايا",
      nav_kids: "هدايا الأطفال",
      nav_services: "الخدمات",

      hero_title_1: "مرحبًا بكم في",
      hero_subtitle: "هدايا بعناية، ديكور جميل، منتجات للأطفال وخدمات متنوعة.",

      sections_title: "الأقسام الرئيسية",
      featured_title: "منتجات مختارة",
      featured_subtitle: "اختيارات عشوائية من مجموعات مختلفة",

      view_group: "عرض المجموعة",

      kontakt_title: "KONTAKT",
      kontakt_whatsapp: "WhatsApp:",
      kontakt_email: "Email:",

      gallery_title: "صور إضافية",
      similar_title: "منتجات من نفس المجموعة",

      cat_subtitle: "تصفح منتجات هذا القسم"
    },
    de: {
      menu: "Menü",
      nav_home: "Startseite",
      nav_candel: "Kerzen",
      nav_gifts: "Geschenke",
      nav_kids: "Kinder",
      nav_services: "Service",

      hero_title_1: "Willkommen bei",
      hero_subtitle: "Handgemachte Geschenke, schöne Deko, Kinderprodukte und Services.",

      sections_title: "Hauptkategorien",
      featured_title: "Ausgewählte Produkte",
      featured_subtitle: "Zufällige Auswahl aus verschiedenen Gruppen",

      view_group: "Gruppe ansehen",

      kontakt_title: "KONTAKT",
      kontakt_whatsapp: "WhatsApp:",
      kontakt_email: "E-Mail:",

      gallery_title: "Weitere Fotos",
      similar_title: "Mehr aus derselben Gruppe",

      cat_subtitle: "Produkte dieser Kategorie ansehen"
    }
  };

  const htmlEl = document.documentElement;
  const langButtons = qsa(".lang-btn");

  const applyLang = (lang) => {
    const dict = I18N[lang] || I18N.ar;

    if (lang === "de") {
      htmlEl.lang = "de";
      htmlEl.dir = "ltr";
      document.body.style.direction = "ltr";
    } else {
      htmlEl.lang = "ar";
      htmlEl.dir = "rtl";
      document.body.style.direction = "rtl";
    }

    langButtons.forEach((b) => {
      const active = b.dataset.lang === lang;
      b.setAttribute("aria-pressed", String(active));
    });

    qsa("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) el.textContent = dict[key];
    });

    try { localStorage.setItem("dekokraft_lang", lang); } catch (_) {}
  };

  let savedLang = "ar";
  try { savedLang = localStorage.getItem("dekokraft_lang") || "ar"; } catch (_) {}
  applyLang(savedLang);
// =========================
// Tidio language sync (AR/DE)
// =========================
const syncTidioLang = (lang) => {
  try {
    // Store language preference for Tidio (best-effort)
    localStorage.setItem("tidio_lang", lang);

    // Some Tidio setups read browser lang; we emulate it
    document.documentElement.setAttribute("lang", lang === "de" ? "de" : "ar");

    // If Tidio is already loaded, re-inject script to apply new lang
    const existing = document.querySelector('script[src*="tidio.co"]');
    const iframe = document.querySelector('iframe[src*="tidio"]');

    // If widget exists, remove iframe so it reloads cleanly
    if (iframe) iframe.remove();

    // Re-add script (force reload)
    if (existing) existing.remove();

    const s = document.createElement("script");
    s.src = "//code.tidio.co/ockwmcmhludlxq0hduty5zot7lq8hcm4.js";
    s.async = true;
    document.body.appendChild(s);
  } catch (_) {}
};

// Call once on load
syncTidioLang(savedLang);

// When clicking language buttons
langButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang || "ar";
    syncTidioLang(lang);
  });
});

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang || "ar"));
  });

  // =========================
  // Menu (mobile)
  // =========================
  const menuBtn = qs(".menu-btn");
  const overlay = qs("#mobileMenu");
  const panel = overlay ? qs(".menu-panel", overlay) : null;
  const closeBtn = overlay ? qs(".menu-close", overlay) : null;

  const openMenu = () => {
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("menu-open");
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
  };

  if (menuBtn && overlay && panel) {
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

    overlay.addEventListener("click", () => closeMenu());
    panel.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeMenu();
    });

    qsa("a", overlay).forEach((a) => a.addEventListener("click", () => closeMenu()));
  }

  // =========================
  // Footer year
  // =========================
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // =========================
  // Data load
  // =========================
  const DATA_URL = "assets/data/products.json";
  const loadData = async () => {
    const res = await fetch(DATA_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load products.json");
    return res.json();
  };

  // =========================
  // Render: index
  // =========================
  const renderIndex = (data) => {
    const sectionsGrid = qs("#sectionsGrid");
    const featuredGrid = qs("#featuredGrid");
    if (!sectionsGrid || !featuredGrid) return;

    const lang = (htmlEl.lang === "de") ? "de" : "ar";
    const dict = I18N[lang];

    const firstIds = new Set();
    const firstProductByCat = {};
    data.categories.forEach((cat) => {
      firstIds.add(cat.firstProductId);
      const p = data.products.find((x) => x.id === cat.firstProductId);
      if (p) firstProductByCat[cat.id] = p;
    });

    sectionsGrid.innerHTML = "";
    data.categories.forEach((cat) => {
      const p = firstProductByCat[cat.id];
      const title = (lang === "de") ? cat.title_de : cat.title_ar;
      const desc = (lang === "de") ? cat.desc_de : cat.desc_ar;
      const productId = cat.firstProductId;

      const card = document.createElement("article");
      card.className = "card card--clean";

      const media = document.createElement("div");
      media.className = "card-media";

      const img = document.createElement("img");
      if (p) {
        // first image stem already includes "-01" (angle 01)
        loadImg(img, p.imageStem, title);
      } else {
        img.src = "assets/images/logo/logo-dekokraft.png";
        img.alt = title;
      }
      media.appendChild(img);

      const body = document.createElement("div");
      body.className = "card-body";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = title;

      const t = document.createElement("p");
      t.className = "card-text";
      t.textContent = desc;

      const row = document.createElement("div");
      row.className = "btn-row";

      const btn = document.createElement("a");
      btn.className = "btn";
      btn.href = `product.html?id=${encodeURIComponent(productId)}`;
      btn.textContent = dict.view_group;

      row.appendChild(btn);
      body.appendChild(h3);
      body.appendChild(t);
      body.appendChild(row);

      card.appendChild(media);
      card.appendChild(body);
      sectionsGrid.appendChild(card);
    });

    const rest = data.products.filter((p) => !firstIds.has(p.id));
    const featured = shuffle(rest).slice(0, 8);

    featuredGrid.innerHTML = "";
    featured.forEach((p) => {
      const title = (lang === "de") ? p.title_de : p.title_ar;
      const desc = (lang === "de") ? p.desc_de : p.desc_ar;

      const a = document.createElement("a");
      a.className = "card card--fog";
      a.href = `product.html?id=${encodeURIComponent(p.id)}`;
      a.setAttribute("aria-label", title);

      const media = document.createElement("div");
      media.className = "card-media";

      const img = document.createElement("img");
      loadImg(img, p.imageStem, title);
      media.appendChild(img);

      const body = document.createElement("div");
      body.className = "card-body";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = title;

      const t = document.createElement("p");
      t.className = "card-text";
      t.textContent = desc;

      body.appendChild(h3);
      body.appendChild(t);

      a.appendChild(media);
      a.appendChild(body);

      featuredGrid.appendChild(a);
    });
  };

  // =========================
  // Render: category
  // =========================
  const renderCategory = (data) => {
    const catId = (getParam("cat") || "").toLowerCase();
    const grid = qs("#categoryGrid");
    const titleEl = qs("#categoryTitle");
    const subEl = qs("#categorySubtitle");
    if (!grid || !titleEl || !subEl) return;

    const lang = (htmlEl.lang === "de") ? "de" : "ar";
    const dict = I18N[lang];

    const cat = data.categories.find((c) => c.id === catId) || data.categories[0];
    const title = (lang === "de") ? cat.title_de : cat.title_ar;

    titleEl.textContent = title;
    subEl.textContent = dict.cat_subtitle;

    const list = data.products.filter((p) => p.category === cat.id);

    grid.innerHTML = "";
    list.forEach((p) => {
      const t = (lang === "de") ? p.title_de : p.title_ar;
      const d = (lang === "de") ? p.desc_de : p.desc_ar;

      const a = document.createElement("a");
      a.className = "card card--clean";
      a.href = `product.html?id=${encodeURIComponent(p.id)}`;
      a.setAttribute("aria-label", t);

      const media = document.createElement("div");
      media.className = "card-media";

      const img = document.createElement("img");
      loadImg(img, p.imageStem, t);
      media.appendChild(img);

      const body = document.createElement("div");
      body.className = "card-body";

      const h3 = document.createElement("h3");
      h3.className = "card-title";
      h3.textContent = t;

      const desc = document.createElement("p");
      desc.className = "card-text";
      desc.textContent = d;

      body.appendChild(h3);
      body.appendChild(desc);

      a.appendChild(media);
      a.appendChild(body);

      grid.appendChild(a);
    });
  };

  // =========================
  // Render: product
  // =========================
  const renderProductPage = (data) => {
    const mainImg = qs("#productMainImage");
    const titleEl = qs("#productTitle");
    const descEl = qs("#productDesc");
    const galleryTrack = qs("#galleryTrack");
    const similarList = qs("#similarList");

    const openFsBtn = qs("#openFullscreen");
    const fullscreen = qs("#fullscreen");
    const fullscreenImg = qs("#fullscreenImg");
    const closeFsBtn = qs("#closeFullscreen");

    const prevBtn = qs("#galleryPrev");
    const nextBtn = qs("#galleryNext");

    if (!mainImg || !titleEl || !descEl || !galleryTrack || !similarList) return;

    const lang = (htmlEl.lang === "de") ? "de" : "ar";

    const getProductById = (id) => data.products.find((p) => p.id === id);

    // For candel/gifts/kids we need to replace the last "-01" (angle) in imageStem
    // imageStem example: ".../candel-001-03-01"
    const stemToAngleStem = (baseStem, angle) => {
      const a = pad2(angle);
      return baseStem.replace(/-\d{2}$/, `-${a}`);
    };

    let currentAngle = 1;
    let currentMax = 0;

    const setMainByAngle = (p, angle) => {
      currentAngle = angle;
      const stem = (p.galleryCount && p.galleryCount > 0)
        ? stemToAngleStem(p.imageStem, angle)
        : p.imageStem;

      loadImg(mainImg, stem, mainImg.alt || "");
      if (fullscreenImg) {
        fullscreenImg.src = mainImg.src;
        fullscreenImg.alt = mainImg.alt || "";
      }

      qsa(".gallery-thumb", galleryTrack).forEach((x) => x.classList.remove("is-active"));
      const activeBtn = qs(`.gallery-thumb[data-angle="${String(angle)}"]`, galleryTrack);
      if (activeBtn) activeBtn.classList.add("is-active");
    };

    const buildGallery = (p) => {
      galleryTrack.innerHTML = "";
      const count = Number(p.galleryCount || 0);
      currentMax = count;

      if (!count) {
        // services: show just one thumb (main)
        const btn = document.createElement("button");
        btn.className = "gallery-thumb is-active";
        btn.type = "button";
        btn.setAttribute("data-angle", "1");

        const img = document.createElement("img");
        loadImg(img, p.imageStem, "thumb");
        btn.appendChild(img);

        btn.addEventListener("click", () => setMainByAngle(p, 1));
        galleryTrack.appendChild(btn);
        return;
      }

      for (let angle = 1; angle <= count; angle++) {
        const btn = document.createElement("button");
        btn.className = "gallery-thumb" + (angle === 1 ? " is-active" : "");
        btn.type = "button";
        btn.setAttribute("data-angle", String(angle));
        btn.setAttribute("aria-label", "thumb");

        const img = document.createElement("img");
        const angleStem = stemToAngleStem(p.imageStem, angle);
        loadImg(img, angleStem, "thumb");

        btn.appendChild(img);
        btn.addEventListener("click", () => setMainByAngle(p, angle));
        galleryTrack.appendChild(btn);
      }
    };

    const buildSimilar = (p) => {
      similarList.innerHTML = "";
      const same = data.products.filter((x) => x.category === p.category && x.id !== p.id);

      same.forEach((s) => {
        const title = (lang === "de") ? s.title_de : s.title_ar;
        const desc = (lang === "de") ? s.desc_de : s.desc_ar;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "side-item";

        const thumb = document.createElement("div");
        thumb.className = "side-thumb";
        const img = document.createElement("img");
        loadImg(img, s.imageStem, title);
        thumb.appendChild(img);

        const info = document.createElement("div");
        info.className = "side-info";

        const name = document.createElement("div");
        name.className = "side-name";
        name.textContent = title;

        const d = document.createElement("div");
        d.className = "side-desc";
        d.textContent = desc;

        info.appendChild(name);
        info.appendChild(d);

        btn.appendChild(thumb);
        btn.appendChild(info);

        btn.addEventListener("click", () => {
          setParamWithoutReload("id", s.id);
          renderById(s.id, true);
        });

        similarList.appendChild(btn);
      });
    };

    const renderById = (id, smoothTop) => {
      const p = getProductById(id) || data.products[0];
      if (!p) return;

      const title = (lang === "de") ? p.title_de : p.title_ar;
      const desc = (lang === "de") ? p.desc_de : p.desc_ar;

      titleEl.textContent = title;
      descEl.textContent = desc;
      mainImg.alt = title;

      currentAngle = 1;
      buildGallery(p);
      setMainByAngle(p, 1);
      buildSimilar(p);

      if (smoothTop) window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Fullscreen
    const openFullscreen = () => {
      if (!fullscreen) return;
      fullscreen.classList.add("is-open");
      fullscreen.setAttribute("aria-hidden", "false");
      if (fullscreenImg) {
        fullscreenImg.src = mainImg.src;
        fullscreenImg.alt = mainImg.alt || "";
      }
    };

    const closeFullscreen = () => {
      if (!fullscreen) return;
      fullscreen.classList.remove("is-open");
      fullscreen.setAttribute("aria-hidden", "true");
    };

    if (openFsBtn && fullscreen && closeFsBtn && fullscreenImg) {
      openFsBtn.addEventListener("click", () => openFullscreen());
      closeFsBtn.addEventListener("click", () => closeFullscreen());
      fullscreen.addEventListener("click", () => closeFullscreen());
      fullscreenImg.addEventListener("click", (e) => e.stopPropagation());
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && fullscreen.classList.contains("is-open")) closeFullscreen();
      });
    }

    // Gallery scroll controls
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", () => {
        galleryTrack.scrollBy({ left: -240, behavior: "smooth" });
      });
      nextBtn.addEventListener("click", () => {
        galleryTrack.scrollBy({ left: 240, behavior: "smooth" });
      });
    }

    // Swipe on main image (touch)
    let touchStartX = 0;
    let touchStartY = 0;
    let touching = false;

    const onTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      touching = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e) => {
      if (!touching) return;
      touching = false;

      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if (!t) return;

      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;

      // ignore vertical scroll
      if (Math.abs(dy) > Math.abs(dx)) return;

      const activeId = getParam("id") || data.products[0]?.id;
      const p = getProductById(activeId);
      if (!p) return;

      const max = Number(p.galleryCount || 0);
      if (max <= 1) return;

      if (dx <= -45) {
        // next
        const next = currentAngle >= max ? 1 : currentAngle + 1;
        setMainByAngle(p, next);
      } else if (dx >= 45) {
        // prev
        const prev = currentAngle <= 1 ? max : currentAngle - 1;
        setMainByAngle(p, prev);
      }
    };

    mainImg.addEventListener("touchstart", onTouchStart, { passive: true });
    mainImg.addEventListener("touchend", onTouchEnd, { passive: true });

    const id = getParam("id") || data.products[0]?.id || "";
    renderById(id, false);
  };

  // =========================
  // Boot
  // =========================
  const boot = async () => {
    try {
      const data = await loadData();
      const page = document.body.getAttribute("data-page");

      // Re-render on language change
      langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          if (page === "index") renderIndex(data);
          if (page === "category") renderCategory(data);
          if (page === "product") renderProductPage(data);
        });
      });

      if (page === "index") renderIndex(data);
      if (page === "category") renderCategory(data);
      if (page === "product") renderProductPage(data);
    } catch (err) {
      console.error(err);
    }
  };

  boot();
})();
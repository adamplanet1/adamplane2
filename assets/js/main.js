/* =========================
File: assets/js/main.js
Menu + AR/DE + JSON render + product slider + fullscreen
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

  // Try to load -1200 first, then -600, then placeholder
  const resolveImage = (imageBase) => {
    const try1200 = `${imageBase}-1200.webp`;
    const try600 = `${imageBase}-600.webp`;
    const placeholder = `assets/images/products/${imageBase.includes("/products/") ? "" : ""}`; // not used
    const fallback = "assets/images/qr/qr-site.webp"; // safe existing file if no placeholder exists
    return { try1200, try600, fallback };
  };

  const loadImageWithFallback = (imgEl, imageBase, alt = "") => {
    const { try1200, try600, fallback } = resolveImage(imageBase);
    imgEl.alt = alt;

    imgEl.src = try1200;
    imgEl.onerror = () => {
      imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = fallback;
      };
      imgEl.src = try600;
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
      nav_gifts: "الهدايا",
      nav_decor: "الديكور",
      nav_kids: "هدايا الأطفال",
      nav_services: "الخدمات",

      hero_title_1: "مرحبًا بكم في",
      hero_subtitle: "هدايا بعناية، ديكور جميل، منتجات للأطفال وخدمات متنوعة.",

      sections_title: "الأقسام الرئيسية",
      featured_title: "منتجات مختارة",
      featured_subtitle: "اختيارات عشوائية من مجموعات مختلفة",

      view_group: "عرض المجموعة",
      view_product: "عرض المنتج →",

      kontakt_title: "KONTAKT",
      kontakt_whatsapp: "WhatsApp:",
      kontakt_email: "Email:",

      gallery_title: "صور إضافية",
      similar_title: "منتجات من نفس المجموعة",

      cat_gifts: "الهدايا",
      cat_decor: "الديكور",
      cat_kids: "هدايا الأطفال",
      cat_services: "الخدمات",

      cat_subtitle: "تصفح منتجات هذا القسم"
    },
    de: {
      menu: "Menü",
      nav_home: "Startseite",
      nav_gifts: "Geschenke",
      nav_decor: "Dekoration",
      nav_kids: "Kinder-Geschenke",
      nav_services: "Service",

      hero_title_1: "Willkommen bei",
      hero_subtitle: "Handgemachte Geschenke, schöne Deko, Kinderprodukte und Services.",

      sections_title: "Hauptkategorien",
      featured_title: "Ausgewählte Produkte",
      featured_subtitle: "Zufällige Auswahl aus verschiedenen Gruppen",

      view_group: "Gruppe ansehen",
      view_product: "Produkt ansehen →",

      kontakt_title: "KONTAKT",
      kontakt_whatsapp: "WhatsApp:",
      kontakt_email: "E-Mail:",

      gallery_title: "Weitere Fotos",
      similar_title: "Mehr aus derselben Gruppe",

      cat_gifts: "Geschenke",
      cat_decor: "Dekoration",
      cat_kids: "Kinder-Geschenke",
      cat_services: "Service",

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

    // Build a map of first products per category
    const firstIds = new Set();
    const firstProductByCat = {};
    data.categories.forEach((cat) => {
      firstIds.add(cat.firstProductId);
      const p = data.products.find((x) => x.id === cat.firstProductId);
      if (p) firstProductByCat[cat.id] = p;
    });

    // Sections: 4 cards 2x2 always
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
      if (p) loadImageWithFallback(img, p.imageBase, title);
      else {
        img.src = "assets/images/qr/qr-site.webp";
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

    // Featured products: random excluding first products
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
      loadImageWithFallback(img, p.imageBase, title);
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
      loadImageWithFallback(img, p.imageBase, t);
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

    const buildGallery = (p) => {
      galleryTrack.innerHTML = "";

      // main (hero) image thumb (always)
      const thumbs = [];
      thumbs.push({ srcBase: p.imageBase, label: "main" });

      const count = Number(p.galleryCount || 0);
      for (let i = 1; i <= count; i++) {
        thumbs.push({ srcBase: `${p.imageBase}-${i}`, label: `g${i}` });
      }

      thumbs.forEach((it, idx) => {
        const btn = document.createElement("button");
        btn.className = "gallery-thumb" + (idx === 0 ? " is-active" : "");
        btn.type = "button";
        btn.setAttribute("aria-label", "thumb");

        const img = document.createElement("img");
        // gallery images are "-1-1200.webp" style, so srcBase already includes "-1"
        // We still resolve with -1200 / -600 by appending:
        // if srcBase ends with "-1" => final becomes "-1-1200.webp"
        loadImageWithFallback(img, it.srcBase, "thumb");

        btn.appendChild(img);

        btn.addEventListener("click", () => {
          qsa(".gallery-thumb", galleryTrack).forEach((x) => x.classList.remove("is-active"));
          btn.classList.add("is-active");

          // set main image to this thumb srcBase
          loadImageWithFallback(mainImg, it.srcBase, mainImg.alt);
          // update fullscreen image too
          fullscreenImg.src = mainImg.src;
        });

        galleryTrack.appendChild(btn);
      });
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
        loadImageWithFallback(img, s.imageBase, title);
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
          // Update content in-place and update URL
          setParamWithoutReload("id", s.id);
          renderById(s.id);
          // scroll to top of product
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        similarList.appendChild(btn);
      });
    };

    const renderById = (id) => {
      const p = getProductById(id) || data.products[0];
      if (!p) return;

      const title = (lang === "de") ? p.title_de : p.title_ar;
      const desc = (lang === "de") ? p.desc_de : p.desc_ar;

      titleEl.textContent = title;
      descEl.textContent = desc;

      // main image:
      loadImageWithFallback(mainImg, p.imageBase, title);

      // ensure fullscreen uses current image
      fullscreenImg.src = mainImg.src;
      fullscreenImg.alt = title;

      // build gallery + similar
      buildGallery(p);
      buildSimilar(p);
    };

    // Fullscreen
    const openFullscreen = () => {
      if (!fullscreen) return;
      fullscreen.classList.add("is-open");
      fullscreen.setAttribute("aria-hidden", "false");
      fullscreenImg.src = mainImg.src;
      fullscreenImg.alt = mainImg.alt || "";
    };

    const closeFullscreen = () => {
      if (!fullscreen) return;
      fullscreen.classList.remove("is-open");
      fullscreen.setAttribute("aria-hidden", "true");
    };

    if (openFsBtn && fullscreen && closeFsBtn) {
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

    const id = getParam("id") || data.products[0]?.id || "gift-001";
    renderById(id);
  };

  // =========================
  // Boot
  // =========================
  const boot = async () => {
    try {
      const data = await loadData();

      const page = document.body.getAttribute("data-page");

      // re-render on lang change by listening to click (simple)
      langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          // reload current page content with new lang
          const currentPage = document.body.getAttribute("data-page");
          const langNow = (htmlEl.lang === "de") ? "de" : "ar";

          // Just re-render page sections after language applies
          if (currentPage === "index") renderIndex(data);
          if (currentPage === "category") renderCategory(data);
          if (currentPage === "product") renderProductPage(data);

          // Ensure some texts are updated
          const dict = I18N[langNow];
          // Update dynamic button labels in index if needed (handled by render)
          // Update titles in category/product (handled by render)
        });
      });

      if (page === "index") renderIndex(data);
      if (page === "category") renderCategory(data);
      if (page === "product") renderProductPage(data);
    } catch (err) {
      // Minimal fallback
      console.error(err);
    }
  };

  boot();
})();
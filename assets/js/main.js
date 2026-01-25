/* DekoKraft — main.js
   - Menu toggle
   - AR/DE language switch
   - Load products.json
   - Render: index/category/product
   - Smart image resolver: -1200.webp preferred, else -600.webp, else placeholder
   - Home:
     * Sections (2x2 always) + button opens product page of firstProductId
     * Featured: no button; card clickable; exclude section representative products
     * Blue fog overlay only for featured cards (class is-featured)
   - Product page:
     * Big view + short text
     * Vertical thumbnails for same category; click swaps main product (no reload)
   - Kontakt:
     * WhatsApp/Telegram/Email فقط (Facebook removed)
*/

const STATE = {
  lang: localStorage.getItem("dk_lang") || "ar",
  products: [],
};

const I18N = {
  ar: {
    menu: "Menu",
    nav_home: "الرئيسية",
    nav_gifts: "الهدايا",
    nav_decor: "الديكور",
    nav_kids: "هدايا الأطفال",
    nav_services: "الخدمات",
    nav_contact: "Kontakt",
    hero_welcome: "مرحباً بكم في",
    hero_sub: "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",
    sections_title: "الأقسام",
    featured_title: "منتجات مختارة",
    view_section: "عرض القسم →",
    view_product: "عرض المنتج →",
    back_home: "العودة للرئيسية",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    email: "Email",
    put_telegram: "ضع رابط التليجرام هنا",
    gallery_title: "منتجات من نفس المجموعة"
  },
  de: {
    menu: "Menu",
    nav_home: "Startseite",
    nav_gifts: "Geschenke",
    nav_decor: "Dekoration",
    nav_kids: "Kinder-Geschenke",
    nav_services: "Services",
    nav_contact: "Kontakt",
    hero_welcome: "Willkommen bei",
    hero_sub: "Handgemachte Geschenke, besondere Deko für Kinder und verschiedene Services.",
    sections_title: "Bereiche",
    featured_title: "Ausgewählte Produkte",
    view_section: "Bereich ansehen →",
    view_product: "Produkt ansehen →",
    back_home: "Zur Startseite",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    email: "Email",
    put_telegram: "Telegram-Link hier einfügen",
    gallery_title: "Produkte aus derselben Gruppe"
  }
};

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function setDirAndLang(lang){
  STATE.lang = lang;
  localStorage.setItem("dk_lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

  qsa(".lang-btn").forEach(btn=>{
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  qsa("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if (I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
  });
}

function toggleMenu(){
  const nav = qs(".nav");
  if (!nav) return;
  nav.classList.toggle("is-open");
}

async function loadProducts(){
  const res = await fetch("assets/data/products.json", { cache: "no-store" });
  const data = await res.json();
  STATE.products = data.products || [];
}

function buildPlaceholderDataURI(label=""){
  const txt = encodeURIComponent(label || "DekoKraft");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="rgba(120,140,255,0.18)" offset="0"/>
        <stop stop-color="rgba(255,255,255,0.06)" offset="1"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="rgba(0,0,0,0.25)"/>
    <rect x="40" y="40" rx="48" ry="48" width="1120" height="720" fill="url(#g)" stroke="rgba(255,255,255,0.12)" />
    <text x="50%" y="50%" font-size="60" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif">${txt}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

async function resolveImageFromBase(imageBase, label){
  if (!imageBase) return buildPlaceholderDataURI(label);
  const large = `${imageBase}-1200.webp`;
  const small = `${imageBase}-600.webp`;
  if (await urlExists(large)) return large;
  if (await urlExists(small)) return small;
  return buildPlaceholderDataURI(label);
}

async function urlExists(url){
  try{
    const res = await fetch(url, { method:"HEAD", cache:"no-store" });
    return res.ok;
  }catch(e){
    return false;
  }
}

function getLangText(obj){
  if (!obj) return "";
  return obj[STATE.lang] || obj.ar || obj.de || "";
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

/* ✅ Meta الأقسام + تعريف المنتج الأول لكل قسم */
function categoryMeta(){
  return {
    gifts:    { key:"nav_gifts",    emoji:"🎁", firstProductId:"gift-001",    imageBase:"assets/images/products/gifts/gift-001" },
    decor:    { key:"nav_decor",    emoji:"🏡", firstProductId:"decor-001",   imageBase:"assets/images/products/decor/decor-001" },
    kids:     { key:"nav_kids",     emoji:"🧸", firstProductId:"kids-001",    imageBase:"assets/images/products/kids/kids-001" },
    services: { key:"nav_services", emoji:"🛠️", firstProductId:"service-001", imageBase:"assets/images/products/services/service-001" }
  };
}

async function renderKontakt(){
  const wrap = qs("#kontaktCard");
  if (!wrap) return;
  const t = I18N[STATE.lang];

  const whatsappNumber = "+49 176 81213098";
  const whatsappHref = `https://wa.me/4917681213098`;

  const telegramHref = "#"; // ضع رابطك هنا لاحقاً

  const emailAddress = "ra_ahmed@hotmail.de";
  const emailHref = `mailto:${emailAddress}`;

  wrap.innerHTML = `
    <h2 class="kontakt-title">${t.kontakt_title}</h2>

    <div class="kontakt-list">
      <a class="kontakt-item" href="${whatsappHref}" target="_blank" rel="noopener">
        <div class="kontakt-icon" style="color:#3bd45a">
          <img src="assets/images/icons/whatsapp.svg" alt="WhatsApp">
        </div>
        <div class="kontakt-text">
          <div class="kontakt-label">${t.whatsapp}</div>
          <div class="kontakt-value">${whatsappNumber}</div>
        </div>
      </a>

      <a class="kontakt-item" href="${telegramHref}">
        <div class="kontakt-icon" style="color:#2aa8ff">
          <img src="assets/images/icons/telegram.svg" alt="Telegram">
        </div>
        <div class="kontakt-text">
          <div class="kontakt-label">${t.telegram}</div>
          <div class="kontakt-value">${t.put_telegram}</div>
        </div>
      </a>

      <a class="kontakt-item" href="${emailHref}">
        <div class="kontakt-icon" style="color:#8aa0ff">
          <img src="assets/images/icons/email.svg" alt="Email">
        </div>
        <div class="kontakt-text">
          <div class="kontakt-label">${t.email}</div>
          <div class="kontakt-value">${emailAddress}</div>
        </div>
      </a>
    </div>

    <div class="kontakt-logo-wrap">
      <img
        class="kontakt-logo"
        src="assets/images/logo/logo-dekokraft-600.webp"
        srcset="assets/images/logo/logo-dekokraft-600.webp 600w, assets/images/logo/logo-dekokraft-1200.webp 1200w"
        sizes="240px"
        alt="DekoKraft Logo"
      />
    </div>
  `;
}

/* =========================
   HOME
   ========================= */
async function renderHome(){
  const sectionsGrid = qs("#sectionsGrid");
  const featuredGrid = qs("#featuredGrid");
  if (!sectionsGrid || !featuredGrid) return;

  const meta = categoryMeta();
  const t = I18N[STATE.lang];

  // ✅ 1) الأقسام الرئيسية
  sectionsGrid.innerHTML = "";
  for (const cat of Object.keys(meta)){
    const m = meta[cat];
    const title = (I18N[STATE.lang][m.key] || cat);
    const img = await resolveImageFromBase(m.imageBase, title);

    const productHref = `product.html?id=${encodeURIComponent(m.firstProductId)}`;

    const card = document.createElement("div");
    card.className = "card is-section";
    card.innerHTML = `
      <span class="badge">neu</span>

      <a class="card-link" href="${productHref}">
        <div class="card-inner">
          <div class="card-media">
            <img src="${img}" alt="${title}">
          </div>
          <div class="card-title">${title} ${m.emoji}</div>
          <p class="card-desc">${title}</p>
        </div>
      </a>

      <div class="card-inner" style="padding-top:0">
        <div class="card-actions">
          <a class="btn" href="${productHref}">${t.view_section}</a>
        </div>
      </div>
    `;
    sectionsGrid.appendChild(card);
  }

  // ✅ 2) المنتجات المختارة (بدون زر) + استبعاد صور الأقسام الرئيسية
  const excludeIds = new Set(Object.values(meta).map(m => m.firstProductId));
  const candidates = STATE.products.filter(p => !excludeIds.has(p.id));

  // خذ أول 4 (أو أقل)
  const featured = candidates.slice(0, 4);

  featuredGrid.innerHTML = "";
  for (const p of featured){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);

    const href = `product.html?id=${encodeURIComponent(p.id)}`;

    const card = document.createElement("div");
    card.className = "card is-featured";
    card.innerHTML = `
      <span class="badge">neu</span>
      <a class="card-link" href="${href}">
        <div class="card-inner">
          <div class="card-media">
            <img src="${img}" alt="${title}">
          </div>
          <div class="card-title">${title}</div>
          <p class="card-desc">${desc}</p>
        </div>
      </a>
    `;
    featuredGrid.appendChild(card);
  }

  await renderKontakt();
}

/* =========================
   CATEGORY
   ========================= */
async function renderCategory(){
  const cat = getParam("cat") || "gifts";
  const grid = qs("#categoryGrid");
  const titleEl = qs("#categoryTitle");
  if (!grid || !titleEl) return;

  const meta = categoryMeta();
  const m = meta[cat] || meta.gifts;
  titleEl.textContent = (I18N[STATE.lang][m.key] || cat);

  const items = STATE.products.filter(p => p.category === cat);
  grid.innerHTML = "";

  for (const p of items){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);
    const href = `product.html?id=${encodeURIComponent(p.id)}`;

    const card = document.createElement("div");
    card.className = "card is-featured";
    card.innerHTML = `
      <span class="badge">neu</span>
      <a class="card-link" href="${href}">
        <div class="card-inner">
          <div class="card-media">
            <img src="${img}" alt="${title}">
          </div>
          <div class="card-title">${title}</div>
          <p class="card-desc">${desc}</p>
        </div>
      </a>
    `;
    grid.appendChild(card);
  }

  await renderKontakt();
}

/* =========================
   PRODUCT (Gallery)
   ========================= */
async function renderProduct(){
  const imgEl = qs("#productImage");
  const titleEl = qs("#productTitle");
  const descEl = qs("#productDesc");
  const thumbsCol = qs("#thumbsCol");

  if (!imgEl || !titleEl || !descEl || !thumbsCol) return;

  const id = getParam("id");
  let current = STATE.products.find(x => x.id === id) || STATE.products[0];

  if (!current){
    titleEl.textContent = "Not found";
    descEl.textContent = "";
    imgEl.src = buildPlaceholderDataURI("Not found");
    await renderKontakt();
    return;
  }

  async function showProduct(prod, pushUrl){
    const title = getLangText(prod.title);
    const desc = getLangText(prod.description);

    titleEl.textContent = title;
    descEl.textContent = desc;
    imgEl.src = await resolveImageFromBase(prod.imageBase, title);

    if (pushUrl){
      const u = new URL(location.href);
      u.searchParams.set("id", prod.id);
      history.replaceState({}, "", u.toString());
    }

    // active state in thumbs
    qsa(".thumb", thumbsCol).forEach(el=>{
      el.classList.toggle("is-active", el.dataset.id === prod.id);
    });
  }

  // Build thumbs for same category
  const group = STATE.products.filter(p => p.category === current.category);
  thumbsCol.innerHTML = "";

  for (const p of group){
    const tt = getLangText(p.title);
    const sub = getLangText(p.description);
    const thumbImg = await resolveImageFromBase(p.imageBase, tt);

    const item = document.createElement("div");
    item.className = "thumb";
    item.dataset.id = p.id;
    item.innerHTML = `
      <img src="${thumbImg}" alt="${tt}">
      <div>
        <div class="thumb-title">${tt}</div>
        <div class="thumb-sub">${sub}</div>
      </div>
    `;
    item.addEventListener("click", async ()=>{
      current = p;
      await showProduct(p, true);
    });
    thumbsCol.appendChild(item);
  }

  await showProduct(current, false);
  await renderKontakt();
}

/* =========================
   INIT
   ========================= */
async function init(){
  setDirAndLang(STATE.lang);

  const menuBtn = qs(".menu-btn");
  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);

  qsa(".lang-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      setDirAndLang(btn.dataset.lang);
      bootRender();
    });
  });

  await loadProducts();
  await bootRender();
}

async function bootRender(){
  setDirAndLang(STATE.lang);
  const page = document.body.getAttribute("data-page");
  if (page === "home") return renderHome();
  if (page === "category") return renderCategory();
  if (page === "product") return renderProduct();
}

init();
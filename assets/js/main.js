/* DekoKraft — main.js
   - Menu toggle
   - AR/DE language switch
   - Load products.json
   - index: Sections (main) vs Featured (random)
   - product: viewer + thumbnails swap + pushState
   - Kontakt: WhatsApp + Telegram + Email (Facebook removed)
*/

const STATE = {
  lang: localStorage.getItem("dk_lang") || "ar",
  products: [],
};

const I18N = {
  ar: {
    menu: "Menu",
    nav_home: "الرئيسية",
    nav_sections: "الأقسام",
    nav_featured: "منتجات مختارة",
    nav_viewer: "عرض المنتج",
    nav_contact: "Kontakt",
    hero_welcome: "مرحباً بكم في",
    hero_sub: "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",
    sections_title: "الأقسام",
    featured_title: "منتجات مختارة",
    view_section: "عرض القسم →",
    same_category: "من نفس القسم",
    back_home: "العودة",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    email: "Email",
    put_telegram: "ضع رابط التليجرام هنا"
  },
  de: {
    menu: "Menu",
    nav_home: "Startseite",
    nav_sections: "Bereiche",
    nav_featured: "Ausgewählte Produkte",
    nav_viewer: "Produktansicht",
    nav_contact: "Kontakt",
    hero_welcome: "Willkommen bei",
    hero_sub: "Handgemachte Geschenke, besondere Deko für Kinder und verschiedene Services.",
    sections_title: "Bereiche",
    featured_title: "Ausgewählte Produkte",
    view_section: "Bereich ansehen →",
    same_category: "Aus der gleichen Kategorie",
    back_home: "Zurück",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    email: "Email",
    put_telegram: "Telegram-Link hier einfügen"
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

async function urlExists(url){
  try{
    const res = await fetch(url, { method:"HEAD", cache:"no-store" });
    return res.ok;
  }catch(e){
    return false;
  }
}

async function resolveImageFromBase(imageBase, label){
  if (!imageBase) return buildPlaceholderDataURI(label);

  const large = `${imageBase}-1200.webp`;
  const small = `${imageBase}-600.webp`;

  if (await urlExists(large)) return large;
  if (await urlExists(small)) return small;

  return buildPlaceholderDataURI(label);
}

function getLangText(obj){
  if (!obj) return "";
  return obj[STATE.lang] || obj.ar || obj.de || "";
}

function getParam(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

/* Categories order + label mapping */
function categoryMeta(){
  return {
    gifts:   { keyAR:"الهدايا 🎁", keyDE:"Geschenke 🎁" },
    decor:   { keyAR:"الديكور 🏡", keyDE:"Dekoration 🏡" },
    kids:    { keyAR:"هدايا الأطفال 🧸", keyDE:"Kinder-Geschenke 🧸" },
    services:{ keyAR:"الخدمات 🛠️", keyDE:"Services 🛠️" }
  };
}

function categoryTitle(cat){
  const m = categoryMeta()[cat];
  if (!m) return cat;
  return (STATE.lang === "ar") ? m.keyAR : m.keyDE;
}

/* Pick representative product per category (first one found) */
function getRepresentativeByCategory(cat){
  return STATE.products.find(p => p.category === cat) || null;
}

/* Featured products: exclude representative ones to avoid duplication */
function getFeaturedProducts(limit=6){
  const reps = new Set(["gifts","decor","kids","services"]
    .map(c => getRepresentativeByCategory(c))
    .filter(Boolean)
    .map(p => p.id));

  const rest = STATE.products.filter(p => !reps.has(p.id));
  // simple: take first N
  return rest.slice(0, limit);
}

async function renderKontakt(){
  const wrap = qs("#kontaktCard");
  if (!wrap) return;

  const t = I18N[STATE.lang];

  const whatsappNumber = "+49 176 81213098";
  const whatsappHref = `https://wa.me/4917681213098`;
  const telegramHref = "#";
  const emailAddress = "ra_ahmed@hotmail.de";
  const emailHref = `mailto:${emailAddress}`;

  wrap.innerHTML = `
    <h2 class="kontakt-title">${t.kontakt_title}</h2>

    <div class="kontakt-list">
      <a class="kontakt-item" href="${whatsappHref}" target="_blank" rel="noopener">
        <div>
          <div class="kontakt-label">${t.whatsapp}</div>
          <div class="kontakt-value">${whatsappNumber}</div>
        </div>
        <div class="kontakt-icon" style="color:#3bd45a">
          <img src="assets/images/icons/whatsapp.svg" alt="WhatsApp">
        </div>
      </a>

      <a class="kontakt-item" href="${telegramHref}">
        <div>
          <div class="kontakt-label">${t.telegram}</div>
          <div class="kontakt-value">${t.put_telegram}</div>
        </div>
        <div class="kontakt-icon" style="color:#2aa8ff">
          <img src="assets/images/icons/telegram.svg" alt="Telegram">
        </div>
      </a>

      <a class="kontakt-item" href="${emailHref}">
        <div>
          <div class="kontakt-label">${t.email}</div>
          <div class="kontakt-value">${emailAddress}</div>
        </div>
        <div class="kontakt-icon" style="color:#8aa0ff">
          <img src="assets/images/icons/email.svg" alt="Email">
        </div>
      </a>
    </div>

    <div class="kontakt-logo-wrap">
      <img
        class="kontakt-logo"
        src="assets/images/logo/logo-dekokraft-600.webp"
        srcset="assets/images/logo/logo-dekokraft-600.webp 600w, assets/images/logo/logo-dekokraft-1200.webp 1200w"
        sizes="220px"
        alt="DekoKraft Logo"
      />
    </div>
  `;
}

/* ---------- HOME RENDER ---------- */
async function renderHome(){
  const sectionsGrid = qs("#sectionsGrid");
  const featuredGrid = qs("#featuredGrid");
  if (!sectionsGrid || !featuredGrid) return;

  const t = I18N[STATE.lang];

  // Main sections (representative product per category)
  sectionsGrid.innerHTML = "";
  const cats = ["gifts","decor","kids","services"];

  for (const cat of cats){
    const rep = getRepresentativeByCategory(cat);
    const title = categoryTitle(cat);

    let img = buildPlaceholderDataURI(title);
    let productId = null;

    if (rep){
      productId = rep.id;
      img = await resolveImageFromBase(rep.imageBase, title);
    }

    const card = document.createElement("div");
    card.className = "card card--section";
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <a class="link-card" href="product.html?id=${encodeURIComponent(productId || "")}">
          <div class="card-media">
            <img src="${img}" alt="${title}">
          </div>
          <div class="card-title">${title}</div>
        </a>

        <div class="card-actions">
          <!-- ✅ زر عرض القسم يذهب لصفحة العرض مباشرة -->
          <a class="btn" href="product.html?id=${encodeURIComponent(productId || "")}">${t.view_section}</a>
        </div>
      </div>
    `;
    sectionsGrid.appendChild(card);
  }

  // Featured/random products: cards are links, no buttons, with mist overlay
  const featured = getFeaturedProducts(6);
  featuredGrid.innerHTML = "";

  for (const p of featured){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);

    const card = document.createElement("a");
    card.className = "card card--product link-card";
    card.href = `product.html?id=${encodeURIComponent(p.id)}`;
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media">
          <img src="${img}" alt="${title}">
        </div>
        <div class="card-title">${title}</div>
        <p class="card-desc">${desc}</p>
      </div>
    `;
    featuredGrid.appendChild(card);
  }

  await renderKontakt();
}

/* ---------- PRODUCT VIEWER ---------- */
function makeShortPitch(desc){
  // وصف قصير “يوحي بالحاجة” (بدون تعقيد)
  if (!desc) return "";
  // نتركه كما هو لكن نحسّن الإيقاع:
  return desc.length > 140 ? (desc.slice(0, 140) + "…") : desc;
}

async function setViewerProduct(productId, {push=true} = {}){
  const p = STATE.products.find(x => x.id === productId);
  if (!p) return;

  const imgEl = qs("#viewerImage");
  const titleEl = qs("#viewerTitle");
  const descEl = qs("#viewerDesc");

  const title = getLangText(p.title);
  const desc = makeShortPitch(getLangText(p.description));

  titleEl.textContent = title;
  descEl.textContent = desc;
  imgEl.src = await resolveImageFromBase(p.imageBase, title);
  imgEl.alt = title;

  // active thumb
  qsa(".thumb").forEach(el=>{
    el.classList.toggle("is-active", el.dataset.id === productId);
  });

  if (push){
    const url = new URL(location.href);
    url.searchParams.set("id", productId);
    history.pushState({id: productId}, "", url.toString());
  }
}

async function renderProduct(){
  const id = getParam("id");
  const thumbList = qs("#thumbList");
  if (!thumbList) return;

  const p = STATE.products.find(x => x.id === id) || STATE.products[0];
  if (!p){
    await renderKontakt();
    return;
  }

  // Build thumbnails of same category
  const sameCat = STATE.products.filter(x => x.category === p.category);

  thumbList.innerHTML = "";
  for (const item of sameCat){
    const title = getLangText(item.title);
    const sub = getLangText(item.description);
    const img = await resolveImageFromBase(item.imageBase, title);

    const div = document.createElement("div");
    div.className = "thumb";
    div.dataset.id = item.id;
    div.innerHTML = `
      <img src="${img}" alt="${title}">
      <div>
        <p class="thumb-title">${title}</p>
        <p class="thumb-sub">${makeShortPitch(sub)}</p>
      </div>
    `;
    div.addEventListener("click", ()=> setViewerProduct(item.id, {push:true}));
    thumbList.appendChild(div);
  }

  // initial viewer
  await setViewerProduct(p.id, {push:false});
  await renderKontakt();

  // handle back/forward
  window.onpopstate = (e)=>{
    const newId = (e.state && e.state.id) ? e.state.id : getParam("id");
    if (newId) setViewerProduct(newId, {push:false});
  };
}

/* ---------- CATEGORY (optional) ---------- */
async function renderCategory(){
  const cat = getParam("cat") || "gifts";
  const grid = qs("#categoryGrid");
  const titleEl = qs("#categoryTitle");
  if (!grid || !titleEl) return;

  titleEl.textContent = categoryTitle(cat);
  const items = STATE.products.filter(p => p.category === cat);

  grid.innerHTML = "";
  for (const p of items){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);

    const a = document.createElement("a");
    a.className = "card card--product link-card";
    a.href = `product.html?id=${encodeURIComponent(p.id)}`;
    a.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media"><img src="${img}" alt="${title}"></div>
        <div class="card-title">${title}</div>
        <p class="card-desc">${desc}</p>
      </div>
    `;
    grid.appendChild(a);
  }

  await renderKontakt();
}

/* ---------- INIT ---------- */
async function bootRender(){
  setDirAndLang(STATE.lang);
  const page = document.body.getAttribute("data-page");

  if (page === "home") return renderHome();
  if (page === "product") return renderProduct();
  if (page === "category") return renderCategory();
}

async function init(){
  setDirAndLang(STATE.lang);

  const menuBtn = qs
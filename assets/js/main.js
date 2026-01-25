/* DekoKraft — main.js (Vanilla JS)
   - Menu toggle
   - AR/DE language switch
   - Load products.json
   - Render: index/category/product
   - Smart image resolver: -1200.webp preferred, else -600.webp, else placeholder
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
    related_title: "منتجات مشابهة",
    back_home: "العودة للرئيسية",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    facebook: "Facebook",
    email: "Email",
    put_telegram: "ضع رابط التليجرام هنا",
    put_facebook: "ضع رابط فيسبوك هنا"
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
    related_title: "Ähnliche Produkte",
    back_home: "Zur Startseite",
    kontakt_title: "KONTAKT",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    facebook: "Facebook",
    email: "Email",
    put_telegram: "Telegram-Link hier einfügen",
    put_facebook: "Facebook-Link hier einfügen"
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

  // Replace i18n texts
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

/* ✅ Smart image resolver:
   tries -1200.webp then -600.webp then placeholder
*/
async function resolveImageFromBase(imageBase, label){
  if (!imageBase) return buildPlaceholderDataURI(label);

  const large = `${imageBase}-1200.webp`;
  const small = `${imageBase}-600.webp`;

  // Try large first
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

function categoryMeta(){
  return {
    gifts:   { key:"nav_gifts",  emoji:"🎁", imageBase:"assets/images/products/gifts/gift-001" },
    decor:   { key:"nav_decor",  emoji:"🏡", imageBase:"assets/images/products/decor/decor-001" },
    kids:    { key:"nav_kids",   emoji:"🧸", imageBase:"assets/images/products/kids/kids-001" },
    services:{ key:"nav_services",emoji:"🛠️", imageBase:"assets/images/products/services/service-001" }
  };
}

async function renderKontakt(){
  const wrap = qs("#kontaktCard");
  if (!wrap) return;

  const t = I18N[STATE.lang];

  // You can replace these links later:
  const whatsappNumber = "+49 176 81213098";
  const whatsappHref = `https://wa.me/4917681213098`;
  const telegramHref = "#";
  const facebookHref = "#";
  const emailAddress = "ra_ahmed@hotmail.de";
  const emailHref = `mailto:${emailAddress}`;

  wrap.innerHTML = `
    <div class="kontakt-top">
      <h2 class="kontakt-title">${t.kontakt_title}</h2>
      <div style="opacity:.0"></div>
    </div>

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

      <a class="kontakt-item" href="${facebookHref}">
        <div>
          <div class="kontakt-label">${t.facebook}</div>
          <div class="kontakt-value">${t.put_facebook}</div>
        </div>
        <div class="kontakt-icon" style="color:#8aa0ff">
          <img src="assets/images/icons/facebook.svg" alt="Facebook">
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

async function renderHome(){
  const sectionsGrid = qs("#sectionsGrid");
  const featuredGrid = qs("#featuredGrid");
  if (!sectionsGrid || !featuredGrid) return;

  const meta = categoryMeta();
  const t = I18N[STATE.lang];

  // Sections
  sectionsGrid.innerHTML = "";
  for (const cat of Object.keys(meta)){
    const m = meta[cat];
    const title = (I18N[STATE.lang][m.key] || cat);
    const img = await resolveImageFromBase(m.imageBase, title);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media">
          <img src="${img}" alt="${title}">
        </div>
        <div class="card-title">${title} ${m.emoji}</div>
        <p class="card-desc">${title}</p>
        <div class="card-actions">
          <a class="btn" href="category.html?cat=${cat}">${t.view_section}</a>
        </div>
      </div>
    `;
    sectionsGrid.appendChild(card);
  }

  // Featured products (first 4)
  const featured = STATE.products.slice(0, 4);
  featuredGrid.innerHTML = "";
  for (const p of featured){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media">
          <img src="${img}" alt="${title}">
        </div>
        <div class="card-title">${title}</div>
        <p class="card-desc">${desc}</p>
        <div class="card-actions">
          <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">${t.view_product}</a>
        </div>
      </div>
    `;
    featuredGrid.appendChild(card);
  }

  await renderKontakt();
}

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

  const t = I18N[STATE.lang];

  for (const p of items){
    const title = getLangText(p.title);
    const desc = getLangText(p.description);
    const img = await resolveImageFromBase(p.imageBase, title);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media">
          <img src="${img}" alt="${title}">
        </div>
        <div class="card-title">${title}</div>
        <p class="card-desc">${desc}</p>
        <div class="card-actions">
          <a class="btn" href="product.html?id=${encodeURIComponent(p.id)}">${t.view_product}</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  }

  await renderKontakt();
}

async function renderProduct(){
  const id = getParam("id");
  const imgEl = qs("#productImage");
  const titleEl = qs("#productTitle");
  const descEl = qs("#productDesc");
  const relatedGrid = qs("#relatedGrid");

  if (!id || !imgEl || !titleEl || !descEl || !relatedGrid) return;

  const p = STATE.products.find(x => x.id === id);
  if (!p){
    titleEl.textContent = "Not found";
    descEl.textContent = "";
    imgEl.src = buildPlaceholderDataURI("Not found");
    await renderKontakt();
    return;
  }

  const title = getLangText(p.title);
  const desc = getLangText(p.description);

  titleEl.textContent = title;
  descEl.textContent = desc;
  imgEl.src = await resolveImageFromBase(p.imageBase, title);

  // Related: same category or explicit list
  const t = I18N[STATE.lang];
  const relatedIds = Array.isArray(p.related) ? p.related : [];
  let related = [];

  if (relatedIds.length){
    related = STATE.products.filter(x => relatedIds.includes(x.id));
  } else {
    related = STATE.products.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  }

  relatedGrid.innerHTML = "";
  for (const r of related){
    const rt = getLangText(r.title);
    const rd = getLangText(r.description);
    const img = await resolveImageFromBase(r.imageBase, rt);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span class="badge">neu</span>
      <div class="card-inner">
        <div class="card-media">
          <img src="${img}" alt="${rt}">
        </div>
        <div class="card-title">${rt}</div>
        <p class="card-desc">${rd}</p>
        <div class="card-actions">
          <a class="btn" href="product.html?id=${encodeURIComponent(r.id)}">${t.view_product}</a>
        </div>
      </div>
    `;
    relatedGrid.appendChild(card);
  }

  await renderKontakt();
}

async function init(){
  setDirAndLang(STATE.lang);

  const menuBtn = qs(".menu-btn");
  if (menuBtn) menuBtn.addEventListener("click", toggleMenu);

  qsa(".lang-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      setDirAndLang(btn.dataset.lang);
      // re-render current page texts + content
      bootRender();
    });
  });

  await loadProducts();
  await bootRender();
}

async function bootRender(){
  // Update i18n texts
  setDirAndLang(STATE.lang);

  const page = document.body.getAttribute("data-page");

  if (page === "home") return renderHome();
  if (page === "category") return renderCategory();
  if (page === "product") return renderProduct();
}

init();
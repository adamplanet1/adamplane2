/* DekoKraft main.js
   - Menu
   - Language AR/DE (dir switch)
   - Load products.json
   - Render index/category/product
   - Image auto resolve from imageBase (-1200.webp then -600.webp then placeholder)
*/

const I18N = {
  ar: {
    menu: "Menu",
    nav_home: "الرئيسية",
    nav_gifts: "الهدايا",
    nav_decor: "الديكور",
    nav_kids: "هدايا الأطفال",
    nav_services: "الخدمات",
    nav_contact: "التواصل",
    hero_welcome: "مرحباً بكم في",
    hero_sub: "هنا تجدون هدايا مصنوعة بعناية، ديكور مميز للأطفال، وخدمات متنوعة.",
    sections_title: "الأقسام",
    featured_title: "منتجات مختارة",
    related_title: "منتجات مشابهة",
    view_section: "عرض القسم",
    back_home: "الرئيسية",
    back_to_section: "الرجوع للقسم",
    telegram_hint: "ضع رابط التليجرام هنا",
    facebook_hint: "ضع رابط فيسبوك هنا",
    cat_gifts_title: "الهدايا",
    cat_decor_title: "الديكور",
    cat_kids_title: "هدايا الأطفال",
    cat_services_title: "الخدمات",
    cat_gifts_sub: "أفكار هدايا مميزة لكل المناسبات.",
    cat_decor_sub: "لمسات ديكور تضيف جمالاً للمكان.",
    cat_kids_sub: "هدايا ممتعة ومناسبة للأطفال.",
    cat_services_sub: "خدمات مخصصة حسب الطلب."
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
    related_title: "Ähnliche Produkte",
    view_section: "Bereich ansehen",
    back_home: "Startseite",
    back_to_section: "Zur Kategorie",
    telegram_hint: "Telegram-Link hier einfügen",
    facebook_hint: "Facebook-Link hier einfügen",
    cat_gifts_title: "Geschenke",
    cat_decor_title: "Dekoration",
    cat_kids_title: "Kinder-Geschenke",
    cat_services_title: "Services",
    cat_gifts_sub: "Besondere Geschenkideen für alle Anlässe.",
    cat_decor_sub: "Schöne Dekoration für Ihr Zuhause.",
    cat_kids_sub: "Sicheres & liebevolles für Kinder.",
    cat_services_sub: "Individuelle Dienstleistungen nach Wunsch."
  }
};

const CATEGORY_META = {
  gifts:   { icon: "🎁", titleKey: "cat_gifts_title",   subKey: "cat_gifts_sub",   imageBase: "assets/images/products/gifts/gift-001" },
  decor:   { icon: "🏡", titleKey: "cat_decor_title",   subKey: "cat_decor_sub",   imageBase: "assets/images/products/decor/decor-001" },
  kids:    { icon: "🧸", titleKey: "cat_kids_title",    subKey: "cat_kids_sub",    imageBase: "assets/images/products/kids/kids-001" },
  services:{ icon: "🛠️", titleKey: "cat_services_title",subKey: "cat_services_sub",imageBase: "assets/images/products/services/service-001" }
};

function getLang(){
  return localStorage.getItem("lang") || "ar";
}
function setLang(lang){
  localStorage.setItem("lang", lang);
  applyLang(lang);
  rerenderCurrentPage();
}
function t(key){
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) ? I18N[lang][key] : key;
}
function applyLang(lang){
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar") ? "rtl" : "ltr";

  // buttons state
  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });

  // i18n text
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  });
}

/* Menu */
function initMenu(){
  const nav = document.getElementById("nav");
  const menuBtn = document.getElementById("menuBtn");
  const navClose = document.getElementById("navClose");
  if(!nav || !menuBtn || !navClose) return;

  const open = ()=> nav.classList.add("is-open");
  const close = ()=> nav.classList.remove("is-open");

  menuBtn.addEventListener("click", open);
  navClose.addEventListener("click", close);
  nav.addEventListener("click", (e)=>{
    if(e.target === nav) close();
  });
}

/* Safe URL params */
function qs(name){
  const u = new URL(location.href);
  return u.searchParams.get(name);
}

/* Data */
let PRODUCTS_CACHE = null;

async function loadProducts(){
  if(PRODUCTS_CACHE) return PRODUCTS_CACHE;
  const res = await fetch("assets/data/products.json", {cache:"no-store"});
  const json = await res.json();
  PRODUCTS_CACHE = json.products || [];
  return PRODUCTS_CACHE;
}

/* Placeholder (no file needed) */
function placeholderDataURI(label="No Image"){
  const text = encodeURIComponent(label);
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#141a35"/>
      <stop offset="1" stop-color="#0b1024"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect x="60" y="60" width="1080" height="680" rx="40" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="rgba(234,240,255,0.75)" font-family="Arial" font-size="44">${text}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function tryLoadImage(url){
  return new Promise((resolve)=>{
    const img = new Image();
    img.onload = ()=> resolve(true);
    img.onerror = ()=> resolve(false);
    img.src = url;
  });
}

/* Auto resolve imageBase */
async function resolveImageFromBase(imageBase){
  if(!imageBase) return placeholderDataURI("No imageBase");
  const big = `${imageBase}-1200.webp`;
  const small = `${imageBase}-600.webp`;

  // prefer 1200 then 600
  if(await tryLoadImage(big)) return big;
  if(await tryLoadImage(small)) return small;

  return placeholderDataURI("Image not found");
}

/* Render cards */
async function createTileCard({badgeText, title, desc, imageBase, href, showButton, buttonText}){
  const card = document.createElement("a");
  card.className = "card tile";
  card.href = href;

  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = badgeText;
  card.appendChild(badge);

  const media = document.createElement("div");
  media.className = "tile-media";
  const img = document.createElement("img");
  img.alt = title;
  img.src = placeholderDataURI("Loading...");
  media.appendChild(img);
  card.appendChild(media);

  const h = document.createElement("h3");
  h.className = "tile-title";
  h.textContent = title;
  card.appendChild(h);

  const p = document.createElement("p");
  p.className = "tile-desc";
  p.textContent = desc;
  card.appendChild(p);

  if(showButton){
    const btn = document.createElement("span");
    btn.className = "btn";
    btn.textContent = buttonText;
    card.appendChild(btn);
  }

  // load real image
  resolveImageFromBase(imageBase).then(url=> { img.src = url; });

  return card;
}

/* Pages render */
async function renderHome(){
  const catGrid = document.getElementById("categoryGrid");
  const featuredGrid = document.getElementById("featuredGrid");
  if(!catGrid || !featuredGrid) return;

  catGrid.innerHTML = "";
  featuredGrid.innerHTML = "";

  // categories tiles
  for(const cat of Object.keys(CATEGORY_META)){
    const meta = CATEGORY_META[cat];
    const title = `${meta.icon} ${t(meta.titleKey)}`;
    const desc = t(meta.subKey);

    const tile = await createTileCard({
      badgeText: "neu",
      title,
      desc,
      imageBase: meta.imageBase,
      href: `category.html?cat=${encodeURIComponent(cat)}`,
      showButton: true,
      buttonText: t("view_section") + " →"
    });

    catGrid.appendChild(tile);
  }

  // featured products random mix
  const products = await loadProducts();
  const shuffled = [...products].sort(()=> Math.random() - 0.5);
  const picks = shuffled.slice(0, 6);

  for(const pr of picks){
    const lang = getLang();
    const title = pr.title?.[lang] || pr.id;
    const desc  = pr.description?.[lang] || "";
    const tile = await createTileCard({
      badgeText: "neu",
      title,
      desc,
      imageBase: pr.imageBase,
      href: `product.html?id=${encodeURIComponent(pr.id)}`,
      showButton: false,
      buttonText: ""
    });
    featuredGrid.appendChild(tile);
  }
}

async function renderCategory(){
  const cat = qs("cat") || "gifts";
  const titleEl = document.getElementById("categoryTitle");
  const subEl = document.getElementById("categorySub");
  const grid = document.getElementById("categoryGrid");
  if(!titleEl || !subEl || !grid) return;

  const meta = CATEGORY_META[cat] || CATEGORY_META.gifts;

  titleEl.textContent = `${meta.icon} ${t(meta.titleKey)}`;
  subEl.textContent = t(meta.subKey);

  grid.innerHTML = "";

  const products = await loadProducts();
  const list = products.filter(p => p.category === cat);

  for(const pr of list){
    const lang = getLang();
    const title = pr.title?.[lang] || pr.id;
    const desc  = pr.description?.[lang] || "";
    const tile = await createTileCard({
      badgeText: "neu",
      title,
      desc,
      imageBase: pr.imageBase,
      href: `product.html?id=${encodeURIComponent(pr.id)}`,
      showButton: false,
      buttonText: ""
    });
    grid.appendChild(tile);
  }
}

async function renderProduct(){
  const id = qs("id");
  const imgEl = document.getElementById("productImage");
  const titleEl = document.getElementById("productTitle");
  const descEl = document.getElementById("productDesc");
  const relatedGrid = document.getElementById("relatedGrid");
  const backToCategory = document.getElementById("backToCategory");

  if(!imgEl || !titleEl || !descEl || !relatedGrid) return;

  const products = await loadProducts();
  const pr = products.find(p => p.id === id) || products[0];

  const lang = getLang();
  const title = pr.title?.[lang] || pr.id;
  const desc  = pr.description?.[lang] || "";

  titleEl.textContent = title;
  descEl.textContent = desc;

  // back link
  if(backToCategory){
    backToCategory.href = `category.html?cat=${encodeURIComponent(pr.category)}`;
  }

  imgEl.alt = title;
  imgEl.src = placeholderDataURI("Loading...");
  imgEl.src = await resolveImageFromBase(pr.imageBase);

  // related
  relatedGrid.innerHTML = "";
  const relatedIds = Array.isArray(pr.related) ? pr.related : [];
  let related = products.filter(p => relatedIds.includes(p.id));

  // fallback: same category
  if(related.length === 0){
    related = products.filter(p => p.category === pr.category && p.id !== pr.id).slice(0, 6);
  }

  for(const r of related){
    const rTitle = r.title?.[lang] || r.id;
    const rDesc  = r.description?.[lang] || "";
    const tile = await createTileCard({
      badgeText: "neu",
      title: rTitle,
      desc: rDesc,
      imageBase: r.imageBase,
      href: `product.html?id=${encodeURIComponent(r.id)}`,
      showButton: false,
      buttonText: ""
    });
    relatedGrid.appendChild(tile);
  }
}

/* rerender when language changes */
function rerenderCurrentPage(){
  const page = document.body.getAttribute("data-page");
  if(page === "home") renderHome();
  if(page === "category") renderCategory();
  if(page === "product") renderProduct();
}

/* init */
document.addEventListener("DOMContentLoaded", async ()=>{
  initMenu();

  document.querySelectorAll(".lang-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> setLang(btn.dataset.lang));
  });

  applyLang(getLang());

  const page = document.body.getAttribute("data-page");
  if(page === "home") await renderHome();
  if(page === "category") await renderCategory();
  if(page === "product") await renderProduct();
});
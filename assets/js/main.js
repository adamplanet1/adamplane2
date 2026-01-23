/* =====================================================
   main.js
   - Mobile menu toggle (open/close)
   - Close on outside click / Esc / link click
   - Footer year
   ===================================================== */

(function () {
  const menuBtn = document.querySelector(".menu-btn");
  const overlay = document.getElementById("mobileMenu");
  const closeBtn = document.querySelector(".menu-close");
  const yearEl = document.getElementById("year");

  // Footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (!menuBtn || !overlay || !closeBtn) return;

  const openMenu = () => {
    overlay.hidden = false;
    document.body.classList.add("menu-open");
    menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeMenu = () => {
    overlay.hidden = true;
    document.body.classList.remove("menu-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  // Toggle
  menuBtn.addEventListener("click", () => {
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    if (isOpen) closeMenu();
    else openMenu();
  });

  // Close button
  closeBtn.addEventListener("click", closeMenu);

  // Close when clicking on overlay background (outside panel)
  overlay.addEventListener("click", (e) => {
    const panel = overlay.querySelector(".menu-panel");
    if (!panel) return;
    if (!panel.contains(e.target)) closeMenu();
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeMenu();
  });

  // Close when clicking a link inside mobile menu
  overlay.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });
})();

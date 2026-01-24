/* YEAR */
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* LANGUAGE SWITCH (basic) */
document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lang-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.lang === "de") {
      document.documentElement.dir = "ltr";
      document.documentElement.lang = "de";
    } else {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  });
});
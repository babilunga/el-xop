// El Xop — book reader: reading progress, current chapter in the contents,
// and a viewer for the photographs of the original pages.
(function () {
  var pages = window.BOOK_PAGES || [];

  // ---- reading progress (a hairline under the header) ----
  var bar = document.querySelector(".progress span");
  var ticking = false;
  function progress() {
    ticking = false;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ")";
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(progress); }
  }, { passive: true });
  progress();

  // ---- contents: collapsed on small screens, current chapter marked ----
  var details = document.querySelector(".toc details");
  var wide = window.matchMedia("(min-width: 901px)");
  if (details) {
    var fit = function () { details.open = wide.matches; };
    fit();
    if (wide.addEventListener) wide.addEventListener("change", fit);
    details.querySelector("summary").addEventListener("click", function (e) {
      if (wide.matches) e.preventDefault();
    });
    // on phones, close the contents again after jumping to a chapter
    details.addEventListener("click", function (e) {
      if (!wide.matches && e.target.closest("a")) details.open = false;
    });
  }
  var links = {};
  document.querySelectorAll(".toc a").forEach(function (a) { links[a.hash.slice(1)] = a; });
  if ("IntersectionObserver" in window) {
    var current;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (current) current.removeAttribute("aria-current");
          current = links[en.target.id];
          if (current) current.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    document.querySelectorAll(".chapter").forEach(function (s) { io.observe(s); });
  }

  // ---- original page viewer ----
  var dlg = document.querySelector(".viewer");
  if (!dlg || !dlg.showModal) return;
  var img = dlg.querySelector(".viewer-img");
  var count = dlg.querySelector(".viewer-count");
  var at = 0, opener = null;
  var word = { ca: "Pàgina", es: "Página", en: "Page" };
  var of = { ca: "de", es: "de", en: "of" };

  function show(n) {
    at = (n + pages.length) % pages.length;
    img.src = "../assets/images/library/pages/" + pages[at] + ".webp";
    var l = document.documentElement.lang || "en";
    img.alt = (word[l] || word.en) + " " + (at + 1);
    count.textContent = (word[l] || word.en) + " " + (at + 1) + " " + (of[l] || of.en) + " " + pages.length;
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".scan");
    if (!b) return;
    opener = b;
    show(Number(b.dataset.page));
    dlg.showModal();
  });
  dlg.querySelector(".viewer-prev").addEventListener("click", function () { show(at - 1); });
  dlg.querySelector(".viewer-next").addEventListener("click", function () { show(at + 1); });
  dlg.querySelector(".viewer-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) { if (e.target === img || e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(at - 1);
    if (e.key === "ArrowRight") show(at + 1);
  });
  dlg.addEventListener("close", function () { if (opener) opener.focus(); });
})();

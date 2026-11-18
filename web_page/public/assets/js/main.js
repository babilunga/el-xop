// El Xop — language switch.
// English lives in the markup; Catalan and Spanish sit beside it as data-ca / data-es,
// so every sentence can be edited in one place.
(function () {
  var root = document.documentElement;

  // what this device can afford: no extra motion with reduced-motion, Save-Data,
  // little memory or few CPU cores (old computers and phones)
  var conn = navigator.connection || {};
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lite = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || "") ||
    (navigator.deviceMemory && navigator.deviceMemory < 2) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
  if (lite) root.classList.add("lite");
  var fancy = !lite && !reduceMotion;

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  var texts = Array.prototype.slice.call(document.querySelectorAll("[data-ca], [data-es]"));
  texts.forEach(function (el) { el.dataset.en = el.innerHTML; });
  var labels = Array.prototype.slice.call(document.querySelectorAll("[data-ca-aria], [data-es-aria]"));
  labels.forEach(function (el) { el.dataset.enAria = el.getAttribute("aria-label"); });
  var alts = Array.prototype.slice.call(document.querySelectorAll("[data-ca-alt], [data-es-alt]"));
  alts.forEach(function (el) { el.dataset.enAlt = el.getAttribute("alt"); });

  // language dropdown
  var langBox = document.querySelector(".lang");
  var langToggle = document.querySelector(".lang-toggle");
  var langCurrent = document.querySelector(".lang-current");
  function setLangMenu(open) {
    if (!langToggle) return;
    langToggle.setAttribute("aria-expanded", String(open));
    langBox.classList.toggle("open", open);
  }
  if (langToggle) langToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setLangMenu(langToggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", function (e) {
    if (langBox && !langBox.contains(e.target)) setLangMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && langBox && langBox.classList.contains("open")) { setLangMenu(false); langToggle.focus(); }
  });

  var stopTyping = function () {};
  function setLang(lang) {
    stopTyping();
    root.lang = lang;
    texts.forEach(function (el) {
      var t = el.dataset[lang];
      el.innerHTML = t != null ? t : el.dataset.en;
    });
    labels.forEach(function (el) {
      el.setAttribute("aria-label", el.dataset[lang + "Aria"] || el.dataset.enAria);
    });
    alts.forEach(function (el) {
      el.setAttribute("alt", el.dataset[lang + "Alt"] || el.dataset.enAlt);
    });
    document.querySelectorAll("[data-lang-set]").forEach(function (b) {
      var on = b.dataset.langSet === lang;
      b.setAttribute("aria-pressed", String(on));
      if (on && langCurrent) {
        var flag = b.querySelector(".flag");
        langCurrent.innerHTML = (flag ? flag.outerHTML : "") + '<span class="lang-code">' + b.dataset.code + "</span>";
      }
    });
    if (typeof measureTitles === "function") measureTitles();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang-set]");
    if (b) { setLang(b.dataset.langSet); store("elxop-lang-choice", b.dataset.langSet); setLangMenu(false); if (langToggle) langToggle.focus(); }
  });

  // back-to-top button: shown once the visitor is past the first screen
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var ticking = false;
    var check = function () {
      ticking = false;
      toTop.classList.toggle("show", window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(check); }
    }, { passive: true });
    check();
  }

  // menu: burger on small screens, dropdowns (L'entorn, Arxiu) everywhere
  var header = document.querySelector(".site-header");
  var burger = document.querySelector(".burger");
  var subs = Array.prototype.slice.call(document.querySelectorAll(".has-sub"));
  function setMenu(open) {
    if (!burger) return;
    burger.setAttribute("aria-expanded", String(open));
    header.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("no-scroll", open);
  }
  // open one dropdown (or none) and close the others
  function setSub(item, open) {
    subs.forEach(function (li) {
      var on = open && li === item;
      var btn = li.querySelector(".sub-toggle");
      if (btn) btn.setAttribute("aria-expanded", String(on));
      li.classList.toggle("sub-open", on);
    });
  }
  // arriving from another page with a #target (e.g. Contacte → index.html#contacte):
  // browsers can lose the jump while images and the map are still loading, so do it again once loaded
  if (location.hash.length > 1) {
    window.addEventListener("load", function () {
      var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (!target) return;
      var y = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
      window.scrollTo({ top: y, behavior: "instant" });
    });
  }

  // close the phone menu when a link in it is followed (e.g. Contacte on the same page)
  var panel = document.querySelector(".nav-panel");
  if (panel) panel.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  if (burger) burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  subs.forEach(function (li) {
    var btn = li.querySelector(".sub-toggle");
    if (btn) btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setSub(li, btn.getAttribute("aria-expanded") !== "true");
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-sub") && window.matchMedia("(min-width: 961px)").matches) setSub(null, false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setSub(null, false); if (header && header.classList.contains("menu-open")) { setMenu(false); burger.focus(); } }
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  // museum page: tell each room how tall its sticky title is, so the sticky photo sits just below it
  var roomTitles = document.querySelectorAll(".museum-section > .section-title");
  var setTitleH = function (t) { t.parentNode.style.setProperty("--title-h", t.offsetHeight + "px"); };
  var measureTitles = function () { roomTitles.forEach(setTitleH); };
  if (roomTitles.length) {
    measureTitles();
    window.addEventListener("resize", measureTitles);
    window.addEventListener("load", measureTitles); // web fonts can change the title height
    if ("ResizeObserver" in window) {
      var titleObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (en) { setTitleH(en.target); });
      });
      roomTitles.forEach(function (t) { titleObserver.observe(t); });
    }
  }

  // language on opening: the visitor's own pick from the menu if they made one, otherwise the
  // first of the browser's languages the site has (ca, es, en), otherwise Catalan
  function browserLang() {
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < list.length; i++) {
      var code = String(list[i]).toLowerCase().slice(0, 2);
      if (code === "ca" || code === "es" || code === "en") return code;
    }
    return "ca";
  }
  var saved = store("elxop-lang-choice");
  setLang(saved === "ca" || saved === "es" || saved === "en" ? saved : browserLang());

  // photos fade in the first time they come into view
  if (fancy && "IntersectionObserver" in window) {
    var reveal = function (img) {
      if (img.complete) img.classList.add("is-in");
      else {
        var done = function () { img.classList.add("is-in"); };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        reveal(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll("main img, .site-footer img"), function (img) {
      // already painted on screen: leave it alone so nothing blinks
      if (img.complete && img.naturalWidth) {
        var r = img.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) return;
      }
      img.classList.add("fade-in");
      io.observe(img);
    });
  }

  // home page: "Benvinguts!" types itself out once, when it is visible
  var welcome = document.body.classList.contains("home") && document.querySelector(".nav-welcome span");
  if (welcome && !reduceMotion) {
    var timer = 0, started = false;
    var esc = function (t) { return t.replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    stopTyping = function () {
      clearTimeout(timer);
      if (started && welcome.dataset.twFull != null) welcome.innerHTML = welcome.dataset.twFull;
    };
    var type = function () {
      if (started) return;
      started = true;
      var full = welcome.textContent, html = welcome.innerHTML, i = 0;
      welcome.dataset.twFull = html;
      var chars = Array.from(full);
      var step = function () {
        var typed = chars.slice(0, i).join(""), rest = chars.slice(i).join("");
        welcome.innerHTML = '<span class="visually-hidden">' + esc(full) + "</span>" +
          '<span aria-hidden="true"><span class="tw-typed">' + esc(typed) + '</span><span class="tw-rest">' + esc(rest) + "</span></span>";
        if (i < chars.length) { i++; timer = setTimeout(step, 70 + Math.random() * 90); }
        else timer = setTimeout(function () { welcome.innerHTML = html; delete welcome.dataset.twFull; }, 1800); // caret blinks a moment, then goes
      };
      timer = setTimeout(step, 350);
    };
    type();
  }
})();

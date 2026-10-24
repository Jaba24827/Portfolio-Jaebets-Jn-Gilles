/* Jaebets Jn Gilles portfolio: dependency-free enhancements (i18n, theme, sidebar, media) */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, body = doc.body;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = function () { return window.innerWidth <= 960; };

  /* ---------- Language (EN / FR) ---------- */
  var FR = window.I18N_FR || {};
  var lang = "en";
  var counters = [];
  function fmt(n) { return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-US"); }
  function setLang(l, persist) {
    lang = l === "fr" ? "fr" : "en";
    root.setAttribute("lang", lang);
    $$("[data-i18n]").forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      var k = el.getAttribute("data-i18n");
      el.innerHTML = lang === "fr" && FR[k] != null ? FR[k] : el.dataset.en;
    });
    $$("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"), a = p[0], k = p[1];
        if (el.getAttribute("data-en-" + a) === null) el.setAttribute("data-en-" + a, el.getAttribute(a) || "");
        el.setAttribute(a, lang === "fr" && FR[k] != null ? FR[k] : el.getAttribute("data-en-" + a));
      });
    });
    var t = $('meta[name="title-fr"]');
    if (t) { if (!doc.documentElement.dataset.titleEn) doc.documentElement.dataset.titleEn = doc.title; doc.title = lang === "fr" ? t.content : doc.documentElement.dataset.titleEn; }
    $$(".seg button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    counters.forEach(function (c) { if (c.done) c.el.textContent = fmt(c.end) + c.suf; });
    if (persist) store.set("lang", lang);
  }
  $$(".seg button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.lang, true); }); });
  var urlLang = (location.search.match(/[?&]lang=(en|fr)/) || [])[1];
  var initial = urlLang || store.get("lang") || ((navigator.language || "en").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");

  /* ---------- Theme ---------- */
  var tbtn = $("#theme-toggle");
  if (tbtn) tbtn.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next); store.set("theme", next);
  });

  /* ---------- Sidebar drawer ---------- */
  var dbtn = $("#drawer-btn"), scrim = $(".scrim");
  function syncDrawer() {
    var open = mobile() ? body.classList.contains("sb-open") : !body.classList.contains("sb-collapsed");
    if (dbtn) dbtn.setAttribute("aria-expanded", String(open));
  }
  if (store.get("sb") === "collapsed" && !mobile()) body.classList.add("sb-collapsed");
  if (dbtn) dbtn.addEventListener("click", function () {
    if (mobile()) body.classList.toggle("sb-open");
    else { body.classList.toggle("sb-collapsed"); store.set("sb", body.classList.contains("sb-collapsed") ? "collapsed" : "open"); }
    syncDrawer();
  });
  if (scrim) scrim.addEventListener("click", function () { body.classList.remove("sb-open"); syncDrawer(); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape") { body.classList.remove("sb-open"); syncDrawer(); } });
  $$(".sb-menu a").forEach(function (a) { a.addEventListener("click", function () { body.classList.remove("sb-open"); }); });
  window.addEventListener("resize", function () { if (!mobile()) body.classList.remove("sb-open"); syncDrawer(); });
  syncDrawer();

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } }); }, { threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("is-visible"); }); }

  /* ---------- Count-up numbers ---------- */
  $$("[data-count]").forEach(function (el) {
    var c = { el: el, end: parseInt(el.getAttribute("data-count"), 10), suf: el.getAttribute("data-suffix") || "", done: false };
    counters.push(c);
    function run() {
      if (reduce) { c.done = true; el.textContent = fmt(c.end) + c.suf; return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(Math.round(c.end * e)) + c.suf;
        if (p < 1) requestAnimationFrame(step); else c.done = true;
      })(performance.now());
    }
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { run(); o.unobserve(el); } }); }, { threshold: 0.6 });
      o.observe(el);
    } else run();
  });

  /* ---------- Images that are not added yet ---------- */
  $$("img[data-hide-on-error]").forEach(function (img) {
    function hide() { img.style.display = "none"; var g = img.closest("[data-gal-item]"); if (g) g.style.display = "none"; checkGallery(); }
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });
  function checkGallery() {
    $$("[data-gallery-optional]").forEach(function (g) {
      var vis = $$("[data-gal-item]", g).some(function (i) { return i.style.display !== "none"; });
      g.hidden = !vis;
      var note = $("[data-gallery-note]", g.parentNode); if (note) note.hidden = vis;
    });
  }
  checkGallery();

  /* ---------- Lightbox ---------- */
  var lb = $("#lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = $("img", lb), lbCap = $("figcaption", lb);
    $$(".gal-item").forEach(function (b) {
      b.addEventListener("click", function () {
        var im = $("img", b); lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt; lbCap.textContent = (b.querySelector("span") || {}).textContent || "";
        lb.showModal();
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest("button")) lb.close(); });
  }

  /* ---------- Video slots: show a friendly message if the file is missing ---------- */
  $$(".video").forEach(function (v) {
    var yt = v.getAttribute("data-youtube"), vid = $("video", v);
    if (yt) {
      var f = doc.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + yt; f.title = v.getAttribute("data-title") || "Video";
      f.allow = "accelerometer; encrypted-media; picture-in-picture"; f.allowFullscreen = true; f.loading = "lazy";
      v.appendChild(f); if (vid) vid.remove(); return;
    }
    if (!vid) return;
    var src = $("source", vid);
    function miss() { v.classList.add("is-missing"); vid.remove(); }
    if (src) src.addEventListener("error", miss);
    if (src && window.fetch) fetch(src.getAttribute("src"), { method: "HEAD" }).then(function (r) { if (!r.ok) miss(); }).catch(function () {});
    vid.addEventListener("error", miss);
  });

  /* ---------- Contact form → mailto ---------- */
  var form = $("#contact-form"), status = $("#form-status");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    if (d.get("website")) return;
    var name = (d.get("name") || "").trim(), email = (d.get("email") || "").trim(), msg = (d.get("message") || "").trim();
    if (!(name && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && msg)) {
      status.textContent = lang === "fr" ? "Veuillez indiquer votre nom, un courriel valide et un message." : "Please complete your name, a valid email, and a message.";
      return;
    }
    var subject = (lang === "fr" ? "Demande via le portfolio : " : "Portfolio inquiry: ") + d.get("topic");
    window.location.href = "mailto:jjaebets@jaeka.ca?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg + "\n\n-- " + name + " (" + email + ")");
    status.textContent = lang === "fr" ? "Ouverture de votre application de courriel. Sinon, écrivez à jjaebets@jaeka.ca." : "Opening your email app. If nothing happens, write to jjaebets@jaeka.ca.";
  });

  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
  setLang(initial, false);
})();

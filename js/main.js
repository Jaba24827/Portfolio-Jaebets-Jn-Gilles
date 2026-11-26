/* Jaebets Jn Gilles portfolio: jQuery + Bootstrap enhancements (i18n, theme, sidebar, reveal, media, form) */
(function ($) {
  "use strict";
  var $doc = $(document), $win = $(window), $root = $(document.documentElement), $body = $("body");
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
    $root.attr("lang", lang);
    $("[data-i18n]").each(function () {
      var $el = $(this);
      if ($el.data("en") === undefined) $el.data("en", $el.html());
      var k = $el.attr("data-i18n");
      $el.html(lang === "fr" && FR[k] != null ? FR[k] : $el.data("en"));
    });
    $("[data-i18n-attr]").each(function () {
      var $el = $(this);
      $.each($el.attr("data-i18n-attr").split(";"), function (_, pair) {
        var p = pair.split(":"), a = p[0], k = p[1];
        if ($el.attr("data-en-" + a) === undefined) $el.attr("data-en-" + a, $el.attr(a) || "");
        $el.attr(a, lang === "fr" && FR[k] != null ? FR[k] : $el.attr("data-en-" + a));
      });
    });
    var $t = $('meta[name="title-fr"]');
    if ($t.length) {
      if (!$root.data("titleEn")) $root.data("titleEn", document.title);
      document.title = lang === "fr" ? $t.attr("content") : $root.data("titleEn");
    }
    $(".seg button").each(function () { $(this).attr("aria-pressed", String($(this).data("lang") === lang)); });
    $.each(counters, function (_, c) { if (c.done) c.el.text(fmt(c.end) + c.suf); });
    if (persist) store.set("lang", lang);
  }
  $(".seg button").on("click", function () { setLang($(this).data("lang"), true); });
  var urlLang = (location.search.match(/[?&]lang=(en|fr)/) || [])[1];
  var initial = urlLang || store.get("lang") || ((navigator.language || "en").toLowerCase().indexOf("fr") === 0 ? "fr" : "en");

  /* ---------- Theme (also drives Bootstrap's data-bs-theme) ---------- */
  $("#theme-toggle").on("click", function () {
    var next = $root.attr("data-theme") === "dark" ? "light" : "dark";
    $root.attr({ "data-theme": next, "data-bs-theme": next }); store.set("theme", next);
  });

  /* ---------- Bootstrap tooltips (sidebar social icons, theme toggle) ---------- */
  if (window.bootstrap && bootstrap.Tooltip) {
    $('[data-bs-toggle="tooltip"]').each(function () { new bootstrap.Tooltip(this, { trigger: "hover focus" }); });
  }

  /* ---------- Sidebar drawer ---------- */
  var $dbtn = $("#drawer-btn"), $scrim = $(".scrim");
  function syncDrawer() {
    var open = mobile() ? $body.hasClass("sb-open") : !$body.hasClass("sb-collapsed");
    $dbtn.attr("aria-expanded", String(open));
  }
  if (store.get("sb") === "collapsed" && !mobile()) $body.addClass("sb-collapsed");
  $dbtn.on("click", function () {
    if (mobile()) $body.toggleClass("sb-open");
    else { $body.toggleClass("sb-collapsed"); store.set("sb", $body.hasClass("sb-collapsed") ? "collapsed" : "open"); }
    syncDrawer();
  });
  $scrim.on("click", function () { $body.removeClass("sb-open"); syncDrawer(); });
  $doc.on("keydown", function (e) { if (e.key === "Escape") { $body.removeClass("sb-open"); syncDrawer(); } });
  $(".sb-menu a").on("click", function () { $body.removeClass("sb-open"); });
  $win.on("resize", function () { if (!mobile()) $body.removeClass("sb-open"); syncDrawer(); });
  syncDrawer();

  /* ---------- Reveal on scroll ---------- */
  var $reveals = $(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      $.each(es, function (_, en) { if (en.isIntersecting) { $(en.target).addClass("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    $reveals.each(function () { io.observe(this); });
  } else { $reveals.addClass("is-visible"); }

  /* ---------- Count-up numbers ---------- */
  $("[data-count]").each(function () {
    var $el = $(this);
    var c = { el: $el, end: parseInt($el.attr("data-count"), 10), suf: $el.attr("data-suffix") || "", done: false };
    counters.push(c);
    function run() {
      if (reduce) { c.done = true; $el.text(fmt(c.end) + c.suf); return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
        $el.text(fmt(Math.round(c.end * e)) + c.suf);
        if (p < 1) requestAnimationFrame(step); else c.done = true;
      })(performance.now());
    }
    if ("IntersectionObserver" in window) {
      var o = new IntersectionObserver(function (es) { $.each(es, function (_, en) { if (en.isIntersecting) { run(); o.unobserve($el[0]); } }); }, { threshold: 0.6 });
      o.observe($el[0]);
    } else run();
  });

  /* ---------- Images that are not added yet ---------- */
  function checkGallery() {
    $("[data-gallery-optional]").each(function () {
      var $g = $(this);
      var vis = $g.find("[data-gal-item]").filter(function () { return this.style.display !== "none"; }).length > 0;
      $g.prop("hidden", vis ? false : true);
      $g.parent().find("[data-gallery-note]").prop("hidden", vis);
    });
  }
  $("img[data-hide-on-error]").each(function () {
    var img = this;
    function hide() { $(img).hide(); $(img).closest("[data-gal-item]").hide(); checkGallery(); }
    $(img).on("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });
  checkGallery();

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  if (lb && typeof lb.showModal === "function") {
    var $lb = $(lb);
    $(".gal-item").on("click", function () {
      var im = $(this).find("img")[0];
      $lb.find("img").attr({ src: im.currentSrc || im.src, alt: im.alt });
      $lb.find("figcaption").text($(this).find("span").first().text());
      lb.showModal();
    });
    $lb.on("click", function (e) { if (e.target === lb || $(e.target).closest("button").length) lb.close(); });
  }

  /* ---------- Video slots ---------- */
  $(".video").each(function () {
    var $v = $(this), yt = $v.attr("data-youtube"), $vid = $v.find("video");
    if (yt) {
      $("<iframe>", { src: "https://www.youtube-nocookie.com/embed/" + yt, title: $v.attr("data-title") || "Video", allow: "accelerometer; encrypted-media; picture-in-picture", loading: "lazy" })
        .prop("allowFullscreen", true).appendTo($v);
      $vid.remove(); return;
    }
    if (!$vid.length) return;
    var $src = $vid.find("source");
    function miss() { $v.addClass("is-missing"); $vid.remove(); }
    $src.on("error", miss); $vid.on("error", miss);
    if ($src.length && window.fetch) fetch($src.attr("src"), { method: "HEAD" }).then(function (r) { if (!r.ok) miss(); }).catch(function () {});
  });

  /* ---------- Contact form → mailto ---------- */
  var $form = $("#contact-form"), $status = $("#form-status");
  $form.on("submit", function (e) {
    e.preventDefault();
    var d = new FormData($form[0]);
    if (d.get("website")) return;
    var name = (d.get("name") || "").trim(), email = (d.get("email") || "").trim(), msg = (d.get("message") || "").trim();
    if (!(name && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && msg)) {
      $status.text(lang === "fr" ? "Veuillez indiquer votre nom, un courriel valide et un message." : "Please complete your name, a valid email, and a message.");
      return;
    }
    var subject = (lang === "fr" ? "Demande via le portfolio : " : "Portfolio inquiry: ") + d.get("topic");
    window.location.href = "mailto:jjaebets@jaeka.ca?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg + "\n\n-- " + name + " (" + email + ")");
    $status.text(lang === "fr" ? "Ouverture de votre application de courriel. Sinon, écrivez à jjaebets@jaeka.ca." : "Opening your email app. If nothing happens, write to jjaebets@jaeka.ca.");
  });

  $("#year").text(new Date().getFullYear());
  setLang(initial, false);
})(jQuery);

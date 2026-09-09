/* =============================================================
   main.js — rendering + interactions
   -------------------------------------------------------------
   Renders immediately from the bundled content, then re-renders
   once Firestore content arrives (event: bdm:content).
   No dependencies. Observers rather than scroll handlers; the one
   scroll listener is passive and rAF-throttled.
   ============================================================= */
(function () {
  "use strict";

  var C = window.BDM_DEFAULT_CONTENT;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------- helpers */
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&(?![a-zA-Z#][a-zA-Z0-9]{1,7};)/g, "&amp;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  /* Content is authored by the studio, not by visitors, and may carry
     entities such as &amp; — keep those, but never any markup. */
  function txt(s) { return String(s == null ? "" : s).replace(/<[^>]*>/g, ""); }
  function lines(s) { return txt(s).split("\n").join("<br>"); }

  function path(obj, p) {
    return p.split(".").reduce(function (o, k) { return (o == null) ? undefined : o[k]; }, obj);
  }

  /* ------------------------------------------------- reveal observer */
  var io = null;
  function observe(root) {
    if (reduced) {
      $$("[data-reveal],.frame", root).forEach(function (el) { el.classList.add("in"); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    }
    $$("[data-reveal],.frame", root).forEach(function (el) {
      if (!el.classList.contains("in")) io.observe(el);
    });
  }

  /* -------------------------------------------------- lazy media play */
  /* Muted clips play only while on screen, so several videos never
     decode at once. */
  var mediaIO = null;
  function autoplayInView(root) {
    if (reduced) return;
    if (!mediaIO) {
      mediaIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var v = e.target;
          if (e.isIntersecting) {
            if (!v.src && v.dataset.src) v.src = v.dataset.src;
            var p = v.play(); if (p && p.catch) p.catch(function () {});
          } else if (!v.paused) { v.pause(); }
        });
      }, { threshold: 0.35 });
    }
    $$("video[data-autoplay]", root).forEach(function (v) { mediaIO.observe(v); });
  }

  /* ================================================== 1. TEXT BINDING */
  function bindText(c) {
    $$("[data-bind]").forEach(function (el) {
      var v = path(c, el.dataset.bind);
      if (typeof v === "string") el.innerHTML = txt(v);
    });
    $$("[data-bind-lines]").forEach(function (el) {
      var v = path(c, el.dataset.bindLines);
      if (typeof v === "string") el.innerHTML = lines(v);
    });

    var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();

    $$('a[href^="tel:"]').forEach(function (a) {
      if (c.business.phoneHref) a.setAttribute("href", c.business.phoneHref);
    });

    /* Email is optional — its lines stay hidden until the studio adds one */
    var mail = (c.business.email || "").trim();
    $$("[data-email-link]").forEach(function (a) {
      a.setAttribute("href", "mailto:" + mail);
      a.textContent = mail;
    });
    var eb = $("[data-email-block]"); if (eb) eb.hidden = !mail;
    var fe = $("[data-foot-email]"); if (fe) fe.hidden = !mail;
  }

  /* ==================================================== 2. NAV / MENU */
  function initNav() {
    var nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), hero = $("#hero");
    if (!nav) return;
    if (menu) menu.hidden = false;

    var trigger = hero ? function () { return hero.offsetHeight - 90; } : function () { return 40; };
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var past = window.scrollY > trigger();
        nav.classList.toggle("nav--solid", past || !hero);
        nav.classList.toggle("nav--over", !past && !!hero);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
      document.body.classList.toggle("menu-open", open);
      document.body.classList.toggle("is-locked", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) { var f = $("a", menu); if (f) f.focus(); }
    }
    if (burger && menu) {
      burger.addEventListener("click", function () {
        setMenu(!document.body.classList.contains("menu-open"));
      });
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) setMenu(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
          setMenu(false); burger.focus();
        }
      });
    }

    /* Current-section highlight */
    var links = $$('.nav__menu a[href^="#"]');
    if (links.length && "IntersectionObserver" in window) {
      var byId = {};
      links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
      var secIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          var a = byId[e.target.id];
          if (a && e.isIntersecting) {
            links.forEach(function (l) { l.removeAttribute("aria-current"); });
            a.setAttribute("aria-current", "true");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(byId).forEach(function (id) {
        var s = document.getElementById(id); if (s) secIO.observe(s);
      });
    }
  }

  /* ========================================================== 3. HERO */
  function heroHeadline(h) {
    return '<span class="ln"><span>' + txt(h.headlineTop) + "</span></span>" +
           '<span class="ln"><span><em>' + txt(h.headlineEm) + "</em></span></span>" +
           '<span class="ln"><span>' + txt(h.headlineBottom) + "</span></span>";
  }

  function initHero(c) {
    var hero = $("#hero"), v = $("#heroVideo"), sound = $("#heroSound");
    if (!hero) return;

    var h1 = $("#heroTitle");
    if (h1) h1.innerHTML = heroHeadline(c.hero);

    requestAnimationFrame(function () { hero.classList.add("ready"); });
    if (!v) return;

    if (c.hero.poster) v.poster = c.hero.poster;

    /* Only fetch the film on capable, non-saver connections */
    var conn = navigator.connection || {};
    var thrifty = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || "");
    if (reduced || thrifty || !c.hero.video) return;

    v.src = c.hero.video;
    v.load();
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* the poster stands in */ });

    if (sound) {
      sound.hidden = false;
      sound.addEventListener("click", function () {
        v.muted = !v.muted;
        sound.setAttribute("aria-label", v.muted ? "Play hero film sound" : "Mute hero film sound");
        sound.style.background = v.muted ? "" : "rgba(176,141,87,.85)";
        if (!v.muted && v.paused) v.play();
      });
    }
  }

  /* ================================================= 4. TICKER / STATS */
  function renderTicker(c) {
    var t = $("[data-ticker]"); if (!t) return;
    var one = (c.manifesto.words || []).map(function (w) { return "<span>" + esc(w) + "</span>"; }).join("");
    t.innerHTML = one + one + one + one;   /* well past 200%, so the loop never gaps */
  }

  function renderStats(c) {
    var host = $("[data-stats]"); if (!host) return;
    host.innerHTML = c.difference.items.map(function (s, i) {
      return '<div class="stat" data-reveal data-delay="' + (i % 4) + '">' +
        '<p class="stat__fig"><span data-count="' + esc(s.figure) + '">' + esc(s.figure) + "</span>" +
        "<sup>" + esc(s.suffix) + "</sup></p>" +
        '<p class="stat__label">' + esc(s.label) + "</p>" +
        '<p class="stat__copy">' + esc(s.copy) + "</p></div>";
    }).join("");

    var notes = $("[data-notes]");
    if (notes) {
      notes.innerHTML = c.difference.notes.map(function (n, i) {
        return '<div class="note" data-reveal data-delay="' + i + '">' +
          '<h3 class="display">' + esc(n.title) + "</h3><p>" + esc(n.copy) + "</p></div>";
      }).join("");
    }
    countUp(host);
  }

  function countUp(root) {
    if (reduced || !("IntersectionObserver" in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        var el = e.target, end = parseInt(el.dataset.count, 10);
        if (isNaN(end)) return;
        var dur = 1200, t0 = performance.now();
        (function step(now) {
          var k = Math.min(1, (now - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString("en-US");
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.5 });
    $$("[data-count]", root).forEach(function (el) { obs.observe(el); });
  }

  /* ====================================================== 5. STORIES */
  function renderStories(c) {
    var host = $("[data-stories]"); if (!host) return;
    var base = c.storiesBaseUrl || "";
    host.innerHTML = c.stories.map(function (s, i) {
      var href = /^https?:/.test(s.slug) ? s.slug : base + s.slug;
      return '<a class="story" role="listitem" href="' + esc(href) + '" target="_blank" rel="noopener" ' +
        'data-reveal data-delay="' + (i % 4) + '">' +
        '<div class="frame frame--zoom">' +
          '<span class="story__badge">' + esc(s.pkg) + " package</span>" +
          '<img src="' + esc(s.img) + '" alt="' + esc(txt(s.couple)) + " — " + esc(s.type) +
            '" loading="lazy" decoding="async" width="360" height="480">' +
        "</div>" +
        '<p class="story__type">' + txt(s.type) + "</p>" +
        '<p class="story__loc">' + esc(s.location) + "</p>" +
        '<p class="story__couple">' + txt(s.couple) + "</p></a>";
    }).join("");
    observe(host);
  }

  /* ======================================================== 6. REELS */
  function renderReels(c) {
    var host = $("[data-reels]"); if (!host) return;
    host.innerHTML = c.reels.items.map(function (r, i) {
      var ig = (r.instagram || "").trim();
      return '<figure class="reel' + (i === 0 ? " reel--feature" : "") + '" data-src="' + esc(r.src) + '" ' +
        'data-reveal data-delay="' + (i % 4) + '">' +
        '<img src="' + esc(r.poster) + '" alt="' + esc(r.alt || r.caption) + '" ' +
          'loading="lazy" decoding="async" width="' + (r.w || 405) + '" height="' + (r.h || 720) + '">' +
        '<button class="reel__btn" type="button" aria-label="Play reel: ' + esc(r.caption) + '">' +
          '<span class="reel__play">' +
            '<svg width="15" height="17" viewBox="0 0 15 17" fill="currentColor" aria-hidden="true"><path d="M15 8.5 0 17V0z"/></svg>' +
          "</span></button>" +
        '<figcaption class="reel__cap"><span>' + esc(r.caption) + "</span>" +
          (ig ? '<a href="' + esc(ig) + '" target="_blank" rel="noopener">Instagram</a>' : "") +
        "</figcaption></figure>";
    }).join("");

    if (!host.dataset.wired) {
      host.dataset.wired = "1";
      host.addEventListener("click", function (e) {
        var btn = e.target.closest(".reel__btn"); if (!btn) return;
        var fig = btn.closest(".reel");
        /* One reel at a time */
        $$("video", host).forEach(function (v) {
          v.pause();
          var f = v.closest(".reel");
          if (f && f !== fig) f.classList.remove("playing");
        });
        var v = $("video", fig);
        if (!v) {
          v = document.createElement("video");
          v.src = fig.dataset.src;
          v.controls = true; v.preload = "metadata";
          v.setAttribute("playsinline", "");
          fig.appendChild(v);
        }
        fig.classList.add("playing");
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      });
    }
    observe(host);
  }

  /* ====================================================== 7. GALLERY */
  /* Editorial rhythm. Rather than one repeating span, the mosaic is laid
     out from explicit row templates: every row sums to the full six
     columns, so the right edge stays clean while the sizes keep varying.
     Each slot also states the orientation it wants, and photographs are
     drawn from separate portrait/landscape queues to match. */
  var ROW_TEMPLATES = [
    [[4, "L"], [2, "P"]],
    [[2, "P"], [2, "P"], [2, "P"]],
    [[3, "L"], [3, "L"]],
    [[2, "P"], [4, "L"]],
    [[6, "L"]],
    [[2, "P"], [2, "P"], [2, "P"]],
    [[3, "L"], [3, "L"]],
    [[4, "L"], [2, "P"]]
  ];

  var galleryState = { items: [], filter: "All" };

  /* Walk the row templates, taking each slot from the queue that matches
     its orientation and falling back to the other when one runs dry. */
  function layOut(list) {
    var portrait = [], landscape = [];
    list.forEach(function (it) { (it.h > it.w ? portrait : landscape).push(it); });

    var out = [], row = 0;
    while (portrait.length || landscape.length) {
      var tpl = ROW_TEMPLATES[row % ROW_TEMPLATES.length];
      row++;
      var band = (row - 1) % 3;          /* three row heights, cycled */
      var taken = [];
      for (var i = 0; i < tpl.length; i++) {
        var want = tpl[i][1] === "P" ? portrait : landscape;
        var other = tpl[i][1] === "P" ? landscape : portrait;
        var pick = want.length ? want.shift() : other.shift();
        if (!pick) break;
        taken.push({ item: pick, span: tpl[i][0], band: band });
      }
      if (!taken.length) break;
      /* A short final row would leave a hole — widen it to fill the six. */
      if (!portrait.length && !landscape.length && taken.length < tpl.length) {
        var used = taken.reduce(function (n, t) { return n + t.span; }, 0);
        var spare = 6 - used;
        while (spare > 0) { taken[taken.length - 1].span += Math.min(spare, 2); spare -= 2; }
      }
      out = out.concat(taken);
    }
    return out;
  }

  function renderGallery(c) {
    var host = $("[data-mosaic]"); if (!host) return;
    var all = c.gallery.items || [];
    var limit = window.BDM_GALLERY_LIMIT || 12;

    var fhost = $("[data-filters]");
    if (fhost && !fhost.childElementCount) {
      fhost.innerHTML = (c.gallery.categories || ["All"]).map(function (cat) {
        return '<button type="button" data-cat="' + esc(cat) + '" aria-pressed="' +
          (cat === galleryState.filter) + '">' + esc(cat) + "</button>";
      }).join("");
      fhost.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-cat]"); if (!b) return;
        galleryState.filter = b.dataset.cat;
        $$("button", fhost).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        paint();
      });
    }

    function paint() {
      var list = all.filter(function (it) {
        return galleryState.filter === "All" || it.cat === galleryState.filter;
      }).slice(0, limit);

      var laid = layOut(list);
      galleryState.items = laid.map(function (s) { return s.item; });

      host.innerHTML = laid.map(function (slot, i) {
        var it = slot.item;
        return '<figure class="cell cell--s' + slot.span + ' cell--h' + slot.band + '">' +
          '<button type="button" data-lb="' + i + '" aria-label="Open photograph: ' + esc(it.alt) + '">' +
            '<span class="frame frame--zoom">' +
              '<img src="' + esc(it.src) + '" alt="' + esc(it.alt) + '" loading="lazy" decoding="async" ' +
              'width="' + (it.w || 900) + '" height="' + (it.h || 675) + '" ' +
              'sizes="(min-width:1024px) ' + Math.round(slot.span / 6 * 100) + 'vw, (min-width:768px) 50vw, 100vw">' +
            "</span>" +
            '<span class="cell__zoom" aria-hidden="true">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16150F" stroke-width="1.4">' +
              '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg>' +
            "</span></button></figure>";
      }).join("");
      observe(host);
    }

    paint();

    if (!host.dataset.wired) {
      host.dataset.wired = "1";
      host.addEventListener("click", function (e) {
        var b = e.target.closest("[data-lb]"); if (!b) return;
        openLightbox(parseInt(b.dataset.lb, 10));
      });
    }
  }

  /* ===================================================== 8. LIGHTBOX */
  var lb = { i: 0, open: false, lastFocus: null };

  function openLightbox(i) {
    var box = $("#lightbox"); if (!box) return;
    lb.lastFocus = document.activeElement;
    lb.open = true; box.hidden = false; box.classList.add("is-open");
    document.body.classList.add("is-locked");
    showSlide(i);
    $("#lbClose").focus();
  }
  function closeLightbox() {
    var box = $("#lightbox"); if (!box) return;
    lb.open = false; box.classList.remove("is-open"); box.hidden = true;
    document.body.classList.remove("is-locked");
    if (lb.lastFocus && lb.lastFocus.focus) lb.lastFocus.focus();
  }
  function showSlide(i) {
    var list = galleryState.items; if (!list.length) return;
    lb.i = (i + list.length) % list.length;
    var it = list[lb.i], img = $("#lbImg");
    img.classList.remove("shown");
    var next = new Image();
    next.onload = function () {
      img.src = it.src; img.alt = it.alt;
      requestAnimationFrame(function () { img.classList.add("shown"); });
    };
    next.src = it.src;
    $("#lbCount").textContent = (lb.i + 1) + " / " + list.length;
    $("#lbCap").textContent = it.alt;
    /* Warm the neighbours so next/prev feels instant */
    [list[(lb.i + 1) % list.length], list[(lb.i - 1 + list.length) % list.length]]
      .forEach(function (n) { if (n) { var pre = new Image(); pre.src = n.src; } });
  }

  function initLightbox() {
    var box = $("#lightbox"); if (!box) return;
    $("#lbClose").addEventListener("click", closeLightbox);
    $("#lbNext").addEventListener("click", function () { showSlide(lb.i + 1); });
    $("#lbPrev").addEventListener("click", function () { showSlide(lb.i - 1); });
    box.addEventListener("click", function (e) {
      if (e.target === box || e.target.id === "lbStage") closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.open) return;
      if (e.key === "Escape") { closeLightbox(); }
      else if (e.key === "ArrowRight") { showSlide(lb.i + 1); }
      else if (e.key === "ArrowLeft") { showSlide(lb.i - 1); }
      else if (e.key === "Tab") {
        var f = $$("button", box), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    /* Swipe on touch */
    var x0 = null, y0 = null;
    box.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) showSlide(lb.i + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLightbox();
      x0 = y0 = null;
    }, { passive: true });
  }

  /* ======================================================== 9. FILMS */
  var MAXRES_MIN_WIDTH = 130;   /* below this, YouTube served a grey stub */

  function playerMarkup(f, big) {
    var id = esc(f.youtube);
    return '<div class="player" data-yt="' + id + '">' +
      '<img src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" ' +
        'alt="Still from the wedding film: ' + esc(txt(f.couple)) + '" loading="lazy" decoding="async" ' +
        'width="1280" height="720" data-fallback="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg">' +
      '<button class="player__btn" type="button" aria-label="Play film: ' + esc(txt(f.couple)) + '">' +
        '<span class="player__play">' +
          '<svg width="' + (big ? 20 : 15) + '" height="' + (big ? 23 : 17) + '" viewBox="0 0 15 17" ' +
          'fill="currentColor" aria-hidden="true"><path d="M15 8.5 0 17V0z"/></svg>' +
        "</span></button></div>" +
      '<div class="film__meta"><p class="film__couple">' + txt(f.couple) + "</p>" +
      '<p class="film__sub">' + esc(f.meta || "") + (f.note ? " · " + esc(f.note) : "") + "</p></div>";
  }

  /* Not every upload has a maxres still; fall back quietly to hqdefault. */
  function wireThumbFallback(root) {
    $$(".player img[data-fallback]", root).forEach(function (img) {
      function fall() {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = "1";
        img.src = img.dataset.fallback;
      }
      img.addEventListener("error", fall);
      img.addEventListener("load", function () {
        if (img.naturalWidth && img.naturalWidth < MAXRES_MIN_WIDTH) fall();
      });
      if (img.complete && img.naturalWidth && img.naturalWidth < MAXRES_MIN_WIDTH) fall();
    });
  }

  function renderFilms(c) {
    var feat = $("[data-film-featured]"), grid = $("[data-films]");
    if (feat) feat.innerHTML = "<div data-reveal>" + playerMarkup(c.films.featured, true) + "</div>";
    if (grid) {
      grid.innerHTML = c.films.items.map(function (f, i) {
        return '<div data-reveal data-delay="' + (i % 4) + '">' + playerMarkup(f, false) + "</div>";
      }).join("");
    }
    var host = $("#films");
    if (host) { observe(host); wirePlayers(host); wireThumbFallback(host); }
  }

  /* Facade: the YouTube iframe is created on click. Nothing is requested
     from youtube.com until the visitor asks for it. */
  function wirePlayers(root) {
    if (root.dataset.wiredPlayers) return;
    root.dataset.wiredPlayers = "1";
    root.addEventListener("click", function (e) {
      var btn = e.target.closest(".player__btn"); if (!btn) return;
      var p = btn.closest(".player");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + p.dataset.yt + "?autoplay=1&rel=0&modestbranding=1";
      f.title = "Wedding film";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.loading = "lazy";
      p.innerHTML = "";
      p.appendChild(f);
    });
  }

  /* ===================================================== 10. SERVICES */
  function renderServices(c) {
    var host = $("[data-services]"); if (!host) return;
    host.innerHTML = c.services.items.map(function (s, i) {
      return '<article class="svc__row" data-peek-src="' + esc(s.img) + '" data-reveal>' +
        '<p class="svc__num">' + String(i + 1).padStart(2, "0") + "</p>" +
        '<h3 class="svc__name">' + txt(s.name) + "</h3>" +
        '<p class="svc__copy">' + txt(s.copy) + "</p></article>";
    }).join("");
    observe(host);
    wirePeek(host);
  }

  /* Hover-follow image preview — fine pointers only. */
  function wirePeek(host) {
    var peek = $("[data-peek]");
    if (!peek || reduced) return;
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

    var img = $("img", peek), tx = 0, ty = 0, cx = 0, cy = 0, active = false;

    function loop() {
      if (!active) return;
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      peek.style.left = cx + "px"; peek.style.top = cy + "px";
      requestAnimationFrame(loop);
    }

    $$(".svc__row", host).forEach(function (row) {
      row.addEventListener("pointerenter", function () {
        img.src = row.dataset.peekSrc;
        peek.classList.add("on");
        if (!active) { active = true; loop(); }
      });
      row.addEventListener("pointerleave", function () {
        peek.classList.remove("on"); active = false;
      });
    });

    if (!host.dataset.wiredPeek) {
      host.dataset.wiredPeek = "1";
      host.addEventListener("pointermove", function (e) { tx = e.clientX + 130; ty = e.clientY; });
    }
  }

  /* ===================================================== 11. PACKAGES */
  function renderPackages(c) {
    var host = $("[data-packages]"); if (!host) return;
    host.innerHTML = c.packages.tiers.map(function (p, i) {
      return '<article class="pkg' + (p.featured ? " pkg--featured" : "") + '" data-reveal data-delay="' + (i % 4) + '">' +
        (p.featured ? '<p class="pkg__flag">Most popular</p>' : "") +
        '<h3 class="pkg__name">' + esc(p.name) + "</h3>" +
        '<p class="pkg__hours">' + esc(p.hours) + "</p>" +
        '<p class="pkg__price"><span class="pkg__amt">' + esc(p.price) + "</span>" +
          (p.was ? '<s class="pkg__was">' + esc(p.was) + "</s>" : "") + "</p>" +
        (p.priceNote ? '<p class="pkg__note">' + esc(p.priceNote) + "</p>" : "") +
        '<p class="pkg__blurb">' + txt(p.blurb) + "</p>" +
        '<ul class="pkg__inc">' + (p.includes || []).map(function (row) {
          return "<li><b>" + esc(row[0]) + "</b><span>" + esc(row[1] || "") + "</span></li>";
        }).join("") + "</ul>" +
        ((p.addons && p.addons.length)
          ? '<details class="pkg__addons"><summary>Add-ons</summary><ul>' +
            p.addons.map(function (a) { return "<li>" + txt(a) + "</li>"; }).join("") + "</ul></details>"
          : "") +
        '<div class="pkg__cta"><a class="btn ' + (p.featured ? "btn--light" : "btn--ghost") +
          ' btn--block" href="#inquire" data-pkg="' + esc(p.name) + '">Inquire</a></div></article>';
    }).join("");
    observe(host);

    if (host.dataset.wired) return;
    host.dataset.wired = "1";
    /* Carry the chosen package into the inquiry form */
    host.addEventListener("click", function (e) {
      var a = e.target.closest("[data-pkg]"); if (!a) return;
      var msg = $("#fMsg");
      if (msg && !msg.value.trim()) {
        msg.value = "We're interested in the " + a.dataset.pkg + " package. ";
      }
    });
  }

  /* ================================================= 12. LOVE LETTERS */
  var llState = { i: 0, timer: null };

  function renderLetters(c) {
    var host = $("[data-letters]"), photo = $("[data-letters-photo]"), film = $("[data-letters-film]");
    if (!host) return;
    var L = c.loveLetters, items = L.items || [];
    if (!items.length) { host.innerHTML = ""; return; }

    llState.i = 0;

    host.innerHTML =
      '<span class="ll__mark" aria-hidden="true">&ldquo;</span>' +
      items.map(function (t, i) {
        return '<blockquote class="ll__slide' + (i === 0 ? " on" : "") + '" data-ll="' + i + '">' +
          '<p class="ll__text">' + txt(t.quote) + "</p>" +
          '<footer><p class="ll__who">' + txt(t.couple) + "</p>" +
          (t.location ? '<p class="ll__where">' + esc(t.location) + "</p>" : "") +
          "</footer></blockquote>";
      }).join("") +
      '<div class="ll__ctrl">' +
        items.map(function (_, i) {
          return '<button class="ll__dot" type="button" data-go="' + i + '" aria-current="' + (i === 0) +
            '" aria-label="Show love letter ' + (i + 1) + '"></button>';
        }).join("") +
        '<div class="ll__arrows">' +
          '<button type="button" data-step="-1" aria-label="Previous love letter">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M15 18 9 12l6-6"/></svg></button>' +
          '<button type="button" data-step="1" aria-label="Next love letter">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>' +
        "</div></div>" +
      (L.placeholder ? '<p class="ll__flag">Placeholder copy — awaiting real client reviews</p>' : "");

    if (photo) {
      photo.innerHTML = '<div class="frame ll__photo" data-reveal>' +
        '<img data-ll-img src="' + esc(items[0].img || "") + '" alt="" loading="lazy" decoding="async" ' +
        'width="900" height="1200"></div>';
      observe(photo);
    }

    if (film && L.filmYoutube) {
      film.innerHTML = "<div data-reveal>" + playerMarkup(
        { youtube: L.filmYoutube, couple: "Hear it from them", meta: L.filmLabel || "" }, true) + "</div>";
      observe(film);
      wirePlayers(film);
      wireThumbFallback(film);
    }

    function go(i) {
      var slides = $$("[data-ll]", host);
      if (!slides.length) return;
      llState.i = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === llState.i); });
      $$("[data-go]", host).forEach(function (d, k) {
        d.setAttribute("aria-current", String(k === llState.i));
      });
      var im = $("[data-ll-img]");
      if (im && items[llState.i] && items[llState.i].img) im.src = items[llState.i].img;
    }

    function restart() {
      clearInterval(llState.timer);
      if (reduced || items.length < 2) return;
      llState.timer = setInterval(function () { go(llState.i + 1); }, 8000);
    }

    /* Listeners bind once and dispatch through host._ll, so a re-render
       swaps in fresh handlers rather than stacking new listeners. */
    host._ll = { go: go, restart: restart };
    if (!host.dataset.wired) {
      host.dataset.wired = "1";
      host.addEventListener("click", function (e) {
        var g = e.target.closest("[data-go]"), st = e.target.closest("[data-step]");
        if (g)  { host._ll.go(parseInt(g.dataset.go, 10)); host._ll.restart(); }
        if (st) { host._ll.go(llState.i + parseInt(st.dataset.step, 10)); host._ll.restart(); }
      });
      host.addEventListener("pointerenter", function () { clearInterval(llState.timer); });
      host.addEventListener("pointerleave", function () { host._ll.restart(); });
    }
    restart();
  }

  /* ======================================================== 13. ABOUT */
  function renderAbout(c) {
    var body = $("[data-about-body]"), clips = $("[data-clips]");
    if (body) body.innerHTML = (c.about.body || []).map(function (p) { return "<p>" + txt(p) + "</p>"; }).join("");
    if (clips) {
      clips.innerHTML = (c.about.clips || []).map(function (cl, i) {
        return '<div class="clip" data-reveal data-delay="' + (i % 4) + '">' +
          '<video data-autoplay data-src="' + esc(cl.src) + '" muted loop playsinline preload="none" ' +
          'aria-hidden="true" tabindex="-1"></video>' +
          '<span class="clip__lab">' + esc(cl.label) + "</span></div>";
      }).join("");
      observe(clips);
      autoplayInView(clips);
    }
  }

  /* ======================================================== 14. FORM */
  function renderForm(c) {
    var chips = $("[data-service-chips]"), heard = $("[data-heard]");
    if (chips) {
      chips.innerHTML = (c.inquire.services || []).map(function (s) {
        return '<label class="chip"><input type="checkbox" name="services" value="' + esc(s) +
          '"><span>' + esc(s) + "</span></label>";
      }).join("");
    }
    if (heard) {
      heard.innerHTML = '<option value="">Select&hellip;</option>' +
        (c.inquire.heardAbout || []).map(function (h) {
          return '<option value="' + esc(h) + '">' + esc(h) + "</option>";
        }).join("");
    }
  }

  function initForm(c) {
    var form = $("#inquiryForm"); if (!form) return;
    if (form.dataset.wired) return;
    form.dataset.wired = "1";

    var status = $("#formStatus"), submit = $("#formSubmit"), done = $("#formDone");

    function setErr(input, on) {
      var f = input.closest(".field");
      if (f) f.classList.toggle("field--err", on);
      input.setAttribute("aria-invalid", String(on));
    }
    $$("input,select,textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { if (el.validity.valid) setErr(el, false); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = ""; status.removeAttribute("data-tone");

      var bad = null;
      $$("[required]", form).forEach(function (el) {
        var ok = el.checkValidity() && String(el.value).trim() !== "";
        setErr(el, !ok);
        if (!ok && !bad) bad = el;
      });
      if (bad) {
        status.textContent = "Please check the highlighted fields.";
        status.setAttribute("data-tone", "err");
        bad.focus();
        return;
      }

      var fd = new FormData(form);
      var payload = {
        firstName: (fd.get("firstName") || "").trim(),
        lastName: (fd.get("lastName") || "").trim(),
        email: (fd.get("email") || "").trim(),
        phone: (fd.get("phone") || "").trim(),
        weddingDate: fd.get("weddingDate") || "",
        location: (fd.get("location") || "").trim(),
        services: fd.getAll("services"),
        guests: fd.get("guests") ? Number(fd.get("guests")) : null,
        heardAbout: fd.get("heardAbout") || "",
        message: (fd.get("message") || "").trim()
      };

      var label = submit.textContent;
      submit.disabled = true;
      submit.textContent = "Sending…";

      var send = (window.BDM_STORE && window.BDM_STORE.saveInquiry)
        ? window.BDM_STORE.saveInquiry(payload)
        : Promise.reject(new Error("NOT_CONFIGURED"));

      send.then(function () {
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      }).catch(function (err) {
        var phone = (C.business && C.business.phone) || "";
        status.textContent = (err && err.message === "NOT_CONFIGURED")
          ? "Our inquiry form is not connected yet. Please call us on " + phone + " and we'll take your details."
          : "Something went wrong sending that. Please try again, or call us on " + phone + ".";
        status.setAttribute("data-tone", "err");
        submit.disabled = false;
        submit.textContent = label;
      });
    });
  }

  /* ======================================================= 15. FOOTER */
  var ICONS = {
    instagram: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg>',
    youtube:   '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none"/></svg>',
    facebook:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V2.5h-2.5A4.5 4.5 0 0 0 10 7v1.5H7.5V12H10v9.5h4V12h2.6l.4-3.5z"/></svg>'
  };
  var LABEL = { instagram: "Instagram", youtube: "YouTube", facebook: "Facebook" };

  function renderSocial(c) {
    var s = (c.business && c.business.social) || {};
    var html = Object.keys(ICONS).filter(function (k) { return s[k]; }).map(function (k) {
      return '<a href="' + esc(s[k]) + '" target="_blank" rel="noopener me" aria-label="' + LABEL[k] +
        '" title="' + LABEL[k] + '">' + ICONS[k] + "</a>";
    }).join("");
    $$("[data-social]").forEach(function (el) { el.innerHTML = html; });
  }

  function renderMap(c) {
    var host = $("[data-map]");
    if (!host || !c.business.mapEmbed || host.childElementCount) return;
    /* The map iframe only loads when the footer comes near. */
    var obs = new IntersectionObserver(function (entries, o) {
      if (!entries[0].isIntersecting) return;
      o.disconnect();
      host.innerHTML = '<iframe src="' + esc(c.business.mapEmbed) +
        '" title="Map to the Aasri Productions studio in Los Angeles" loading="lazy" ' +
        'referrerpolicy="no-referrer-when-downgrade"></iframe>';
    }, { rootMargin: "300px" });
    obs.observe(host);
  }

  /* ========================================================= 16. BOOT */
  function render(c) {
    bindText(c);
    renderTicker(c);
    renderStats(c);
    renderStories(c);
    renderReels(c);
    renderGallery(c);
    renderFilms(c);
    renderServices(c);
    renderPackages(c);
    renderLetters(c);
    renderAbout(c);
    renderForm(c);
    renderSocial(c);
    renderMap(c);
    observe(document);
  }

  function start() {
    C = window.BDM_REMOTE_CONTENT || window.BDM_DEFAULT_CONTENT;
    render(C);
    initNav();
    initHero(C);
    initLightbox();
    initForm(C);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else { start(); }

  /* Firestore content landed after first paint. Re-render everything;
     the hero film keeps playing, only its headline is refreshed. */
  document.addEventListener("bdm:content", function (e) {
    C = e.detail;
    render(C);
    initForm(C);
    var t = $("#heroTitle");
    if (t) t.innerHTML = heroHeadline(C.hero);
  });

  window.BDM = { render: render, openLightbox: openLightbox };
})();

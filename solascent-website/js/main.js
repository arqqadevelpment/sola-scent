/* SOLASCENT — site behaviour: menu, cart, motion, contact form. No dependencies. */
(function () {
  "use strict";
  var C = window.SOLA || { products: {}, currency: "" };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KEY = "solascent-cart-v1";

  /* ---------- price helpers ---------- */
  function fmt(n) { return n == null ? "Price TBC" : (C.currency || "") + n; }
  function priceNodes() {
    $$("[data-price]").forEach(function (el) {
      var p = C.products[el.getAttribute("data-price")];
      if (!p) return;
      el.textContent = fmt(p.price);
      if (p.price == null) el.classList.add("ph"); else el.classList.remove("ph");
    });
  }

  /* ---------- cart state ---------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} }
  var cart = load();
  function count() { return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0); }
  function subtotal() {
    var priced = true, t = 0;
    Object.keys(cart).forEach(function (k) {
      var p = C.products[k]; if (!p) return;
      if (p.price == null) priced = false; else t += p.price * cart[k];
    });
    return priced ? t : null;
  }

  var drawer = $("#drawer"), scrim = $("#scrim"), lastFocus = null;

  function renderCart() {
    $$(".badge").forEach(function (b) { b.textContent = count(); b.hidden = count() === 0; });
    if (!drawer) return;
    var items = $("#cartItems"), keys = Object.keys(cart).filter(function (k) { return C.products[k] && cart[k] > 0; });
    if (!keys.length) {
      items.innerHTML = '<p class="empty">Your cart is empty.<br><a class="lnk" style="margin-left:0" href="shop.html">(Shop all diffusers)</a></p>';
    } else {
      items.innerHTML = keys.map(function (k) {
        var p = C.products[k];
        return '<div class="li" data-id="' + k + '">' +
          '<span class="th" style="background-image:url(' + p.img + ')"></span>' +
          '<div><div class="nm">' + p.name + '</div><small>Reed diffuser · ' + p.size + '</small>' +
          '<div class="row"><div class="qty"><button type="button" data-dec aria-label="Decrease quantity">−</button>' +
          '<input type="text" inputmode="numeric" value="' + cart[k] + '" aria-label="Quantity" readonly>' +
          '<button type="button" data-inc aria-label="Increase quantity">+</button></div>' +
          '<span' + (p.price == null ? ' class="ph"' : '') + '>' + fmt(p.price == null ? null : p.price * cart[k]) + '</span>' +
          '<button type="button" class="rm" data-rm>Remove</button></div></div></div>';
      }).join("");
    }
    var s = subtotal(), st = $("#cartTotal");
    st.textContent = keys.length ? (s == null ? "Price TBC" : (C.currency || "") + s) : "—";
    st.className = s == null && keys.length ? "ph" : "";
    var co = $("#checkout");
    if (co) co.setAttribute("aria-disabled", keys.length ? "false" : "true");
  }

  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add("open"); scrim.classList.add("show");
    drawer.setAttribute("aria-hidden", "false");
    var c = $("#cartClose"); if (c) c.focus();
    document.body.style.overflow = "hidden";
  }
  function closeCart() {
    if (!drawer) return;
    drawer.classList.remove("open"); scrim.classList.remove("show");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  function add(id, q) {
    if (!C.products[id]) return;
    cart[id] = Math.min(99, (cart[id] || 0) + (q || 1));
    save(cart); renderCart(); openCart();
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t.closest("[data-add]");
    if (a) {
      var wrap = a.closest("[data-buy]");
      var q = 1;
      if (wrap) { var inp = $("input", wrap); q = Math.max(1, parseInt(inp && inp.value, 10) || 1); }
      add(a.getAttribute("data-add"), q); return;
    }
    if (t.closest("[data-open-cart]")) { closeMenu(); openCart(); return; }
    if (t.closest("[data-close-cart]")) { closeCart(); return; }
    var li = t.closest(".li");
    if (li) {
      var id = li.getAttribute("data-id");
      if (t.closest("[data-inc]")) { cart[id] = Math.min(99, cart[id] + 1); }
      else if (t.closest("[data-dec]")) { cart[id] = Math.max(0, cart[id] - 1); }
      else if (t.closest("[data-rm]")) { cart[id] = 0; }
      else return;
      if (cart[id] <= 0) delete cart[id];
      save(cart); renderCart(); return;
    }
    var st = t.closest("[data-step]");
    if (st) {
      var box = st.closest(".qty"), i2 = $("input", box);
      var v = Math.max(1, Math.min(99, (parseInt(i2.value, 10) || 1) + parseInt(st.getAttribute("data-step"), 10)));
      i2.value = v; return;
    }
  });
  var co = $("#checkout");
  if (co) co.addEventListener("click", function (e) {
    e.preventDefault();
    if (co.getAttribute("aria-disabled") === "true") return;
    if (C.checkoutUrl) { window.location.href = C.checkoutUrl; return; }
    var n = $("#checkoutNote");
    if (n) n.textContent = "Checkout isn't connected yet. Add your payment link in js/config.js.";
  });

  /* ---------- mobile menu ---------- */
  var sheet = $("#sheet");
  function openMenu() { if (!sheet) return; sheet.classList.add("open"); sheet.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function closeMenu() { if (!sheet) return; sheet.classList.remove("open"); sheet.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
  $$("[data-open-menu]").forEach(function (b) { b.addEventListener("click", openMenu); });
  $$("[data-close-menu]").forEach(function (b) { b.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCart(); closeMenu(); } });
  window.matchMedia("(min-width:1101px)").addEventListener("change", closeMenu);

  /* ---------- header shadow ---------- */
  var hd = $(".site-header");
  function onScroll() {
    if (hd) hd.classList.toggle("stuck", window.scrollY > 10);
    $$(".big").forEach(function (b) {
      var r = b.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      b.style.transform = "translateY(" + ((r.top - 300) * -0.12) + "px)";
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- reveal on scroll ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var sel = ".tx>*:not(.big),.band>*,.sig,.ugc>*,.pcon>*,.revs>*,.closing>*,.news>*,.story>*,.steps>div,.notes>div,.pc,.xc,.sh>*,.fm>*,.sd>*,.info>*,.shopall>*";
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$(sel).forEach(function (el, i) { if (el.closest(".story-band") || el.classList.contains("pbg") || el.classList.contains("cbg")) return; el.classList.add("rv"); el.style.transitionDelay = (i % 4) * 90 + "ms"; io.observe(el); });
    /* choreographed sections: split headline into words, then trigger the whole section at once */
    $$("[data-split]").forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/); h.setAttribute("aria-label", words.join(" "));
      h.innerHTML = words.map(function (w, i) { return '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + i + '">' + w + "</span></span>"; }).join(" ");
    });
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("go"); sio.unobserve(e.target); } });
    }, { threshold: 0.3 });
    $$(".story-band").forEach(function (sec) { sec.classList.add("anim"); sio.observe(sec); });
    $$(".tl").forEach(function (t) { io.observe(t); });
  } else { $$(".tl").forEach(function (t) { t.classList.add("in"); }); }

  /* ---------- sticky buy bar (hidden while the buy section is in view) ---------- */
  var bar = $("#buybar"), buy = $("#shop");
  if (bar && buy && "IntersectionObserver" in window) {
    var hero = $(".lh"), heroOut = false, buyIn = false;
    function sync() { bar.classList.toggle("show", heroOut && !buyIn); }
    new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; sync(); }, { threshold: 0.35 }).observe(hero);
    new IntersectionObserver(function (es) { buyIn = es[0].isIntersecting; sync(); }, { threshold: 0.2 }).observe(buy);
  }

  /* ---------- contact form ---------- */
  var form = $("#contactForm");
  if (form) {
    var okEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
    var rules = {
      name: function (v) { return v.trim() ? "" : "Please enter your name."; },
      email: function (v) { return okEmail(v.trim()) ? "" : "Please enter a valid email address."; },
      message: function (v) { return v.trim().length >= 10 ? "" : "Please write at least 10 characters."; }
    };
    var check = function (el) {
      var m = rules[el.name](el.value), f = el.closest(".fld");
      f.classList.toggle("bad", !!m); $(".err", f).textContent = m; el.setAttribute("aria-invalid", m ? "true" : "false");
      return !m;
    };
    $$("input,textarea", form).forEach(function (el) { el.addEventListener("blur", function () { check(el); }); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$("input,textarea", form).filter(function (el) { return !check(el); });
      if (bad.length) { bad[0].focus(); return; }
      var btn = $("button[type=submit]", form), data = new FormData(form);
      var done = function (demo) {
        $("#contactWrap").classList.add("sent");
        var n = $("#demoNote"); if (n) n.style.display = demo ? "block" : "none";
      };
      btn.disabled = true; btn.textContent = "Sending…";
      if (C.formEndpoint) {
        fetch(C.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) { if (!r.ok) throw 0; done(false); })
          .catch(function () { btn.disabled = false; btn.textContent = "Send Message →"; $("#formErr").textContent = "Something went wrong. Please try again" + (C.email ? " or email " + C.email + "." : "."); });
      } else { setTimeout(function () { done(true); }, 600); }
    });
  }

  /* ---------- parallax sections ---------- */
  var par = $$("[data-parallax]");
  if (par.length && !reduce) {
    var ticking = false;
    var paint = function () {
      ticking = false;
      var vh = window.innerHeight;
      par.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);   // +1 entering, -1 leaving
        p = Math.max(-1, Math.min(1, p));
        var bg = $(".pbg", sec), tx = $(".pcon", sec);
        if (bg) bg.style.transform = "translate3d(0," + (-p * r.height * 0.16).toFixed(1) + "px,0)";
        if (tx) tx.style.transform = "translate3d(0," + (p * r.height * 0.05).toFixed(1) + "px,0)";
      });
    };
    var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req);
    window.addEventListener("load", req);
    req();
  }

  /* ---------- reviews: read more ---------- */
  var rt = $("[data-reviews-toggle]");
  if (rt) rt.addEventListener("click", function () {
    var grid = $("#revs"), open = grid.classList.toggle("open");
    rt.textContent = open ? "Show less" : "Read more";
    rt.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) $$(".rev-card.more", grid).forEach(function (el, i) { el.classList.add("rv"); el.style.transitionDelay = i * 90 + "ms"; requestAnimationFrame(function () { el.classList.add("in"); }); });
  });

  /* ---------- newsletter ---------- */
  var nl = $("#newsletterForm");
  if (nl) nl.addEventListener("submit", function (e) {
    e.preventDefault();
    var inp = $("input", nl), msg = $("#nlMsg"), btn = $("button", nl), v = inp.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { msg.textContent = "Please enter a valid email address."; inp.focus(); return; }
    var ok = function (demo) { msg.textContent = demo ? "Thank you. (Demo mode: not saved yet. Set newsletterEndpoint in js/config.js.)" : "Thank you. You're on the list."; inp.value = ""; btn.disabled = false; };
    btn.disabled = true;
    if (C.newsletterEndpoint) {
      fetch(C.newsletterEndpoint, { method: "POST", body: new FormData(nl), headers: { Accept: "application/json" } })
        .then(function (r) { if (!r.ok) throw 0; ok(false); })
        .catch(function () { msg.textContent = "Something went wrong. Please try again."; btn.disabled = false; });
    } else { ok(true); }
  });

  priceNodes(); renderCart();
})();

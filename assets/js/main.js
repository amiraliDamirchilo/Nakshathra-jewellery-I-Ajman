(function () {
  "use strict";
  var WA = "971527166916";
  var root = document.documentElement;
  function getPref(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function setPref(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lang() { return root.getAttribute("lang"); }
  function waLink(text) { return "https://wa.me/" + WA + "?text=" + encodeURIComponent(text); }

  /* ---------- language ---------- */
  var nodes = [].slice.call(document.querySelectorAll("[data-ar]"));
  var ph = [].slice.call(document.querySelectorAll("[data-ar-placeholder]"));
  var lbl = [].slice.call(document.querySelectorAll("[data-ar-label]"));
  nodes.forEach(function (n) { n.setAttribute("data-en", n.innerHTML); });
  ph.forEach(function (n) { n.setAttribute("data-en-placeholder", n.getAttribute("placeholder") || ""); });
  lbl.forEach(function (n) { n.setAttribute("data-en-label", n.getAttribute("aria-label") || ""); });
  var titleEl = document.querySelector("title");
  var tEn = titleEl ? titleEl.textContent : "", tAr = titleEl ? titleEl.getAttribute("data-title-ar") : "";

  function setLang(l, save) {
    var ar = l === "ar";
    root.setAttribute("lang", ar ? "ar" : "en");
    root.setAttribute("dir", ar ? "rtl" : "ltr");
    nodes.forEach(function (n) { n.innerHTML = n.getAttribute(ar ? "data-ar" : "data-en"); });
    ph.forEach(function (n) { n.setAttribute("placeholder", n.getAttribute(ar ? "data-ar-placeholder" : "data-en-placeholder")); });
    lbl.forEach(function (n) { n.setAttribute("aria-label", n.getAttribute(ar ? "data-ar-label" : "data-en-label")); });
    if (titleEl && tAr) titleEl.textContent = ar ? tAr : tEn;
    document.querySelectorAll(".lang-toggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === l)); });
    if (save) setPref("nk-lang", l);
    paintAsk(); paintOpen();
  }

  /* ---------- "ask price" links: message in the visitor's language ---------- */
  function askText(el) {
    var ar = lang() === "ar";
    var ref = el.getAttribute("data-ref");
    var name = el.getAttribute(ar ? "data-name-ar" : "data-name-en");
    if (!ref) return ar ? "مرحباً ناكشاترا عجمان، أود الاستفسار عن مجوهراتكم." : "Hi Nakshathra Ajman, I'd like to ask about your jewellery.";
    return ar
      ? "مرحباً ناكشاترا عجمان، أود معرفة السعر والوزن لهذه القطعة: " + name + " (رقم " + ref + "). هل هي متوفرة؟"
      : "Hi Nakshathra Ajman, could you share the price and weight of this piece: " + name + " (ref " + ref + ")? Is it available?";
  }
  function paintAsk() {
    document.querySelectorAll("[data-ask]").forEach(function (a) { a.href = waLink(askText(a)); });
    document.querySelectorAll("[data-wa]").forEach(function (a) {
      var ar = lang() === "ar";
      a.href = waLink(a.getAttribute(ar ? "data-wa-ar" : "data-wa") || "");
    });
  }

  /* ---------- open now (Dubai time) ---------- */
  var SCHED = { 0: [10, 24], 1: [11, 23.5], 2: [11, 23.5], 3: [11, 23.5], 4: [11, 23.5], 5: [10, 24], 6: [10, 24] };
  function paintOpen() {
    var p = {}; new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var d = map[p.weekday], h = (parseInt(p.hour, 10) % 24) + parseInt(p.minute, 10) / 60;
    var s = SCHED[d], open = h >= s[0] && h < s[1];
    var ar = lang() === "ar";
    var close = s[1] === 24 ? (ar ? "منتصف الليل" : "midnight") : (ar ? "11:30 مساءً" : "11:30pm");
    var opens = s[0] === 10 ? (ar ? "10 صباحاً" : "10am") : (ar ? "11 صباحاً" : "11am");
    document.querySelectorAll(".open-now").forEach(function (el) {
      el.classList.toggle("is-closed", !open);
      el.textContent = open ? (ar ? "مفتوح الآن حتى " + close : "Open now until " + close) : (ar ? "مغلق الآن، نفتح " + opens : "Closed now, opens " + opens);
    });
    document.querySelectorAll(".hours tr").forEach(function (tr) { tr.classList.toggle("is-today", Number(tr.getAttribute("data-day")) === d); });
  }

  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang"), true); });
  });
  var qs = new URLSearchParams(location.search).get("lang");
  setLang(qs === "ar" || qs === "en" ? qs : (getPref("nk-lang") || "en"), !!qs);

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", scrollY > 8); }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var mb = document.querySelector(".menu-btn");
  if (mb) {
    mb.addEventListener("click", function () { var o = document.body.classList.toggle("menu-open"); mb.setAttribute("aria-expanded", String(o)); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("menu-open")) { document.body.classList.remove("menu-open"); mb.setAttribute("aria-expanded", "false"); mb.focus(); } });
  }

  /* ---------- filters ---------- */
  document.querySelectorAll("[data-filter-group]").forEach(function (g) {
    var target = document.getElementById(g.getAttribute("data-filter-group"));
    g.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        g.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
        var f = b.getAttribute("data-filter");
        target.querySelectorAll("[data-tags]").forEach(function (it) {
          it.classList.toggle("is-hidden", !(f === "all" || it.getAttribute("data-tags").split(" ").indexOf(f) > -1));
        });
      });
    });
    var pre = new URLSearchParams(location.search).get("cat");
    if (pre) { var btn = g.querySelector('[data-filter="' + pre + '"]'); if (btn) btn.click(); }
  });

  /* ---------- lightbox ---------- */
  var lb = document.querySelector(".lightbox");
  if (lb) {
    var img = lb.querySelector("img"), cap = lb.querySelector(".lb-name"), ask = lb.querySelector(".lb-ask");
    var idx = 0, last = null;
    function vis() { return [].slice.call(document.querySelectorAll(".product:not(.is-hidden)")); }
    function show(i) {
      var list = vis(); idx = (i + list.length) % list.length; var p = list[idx];
      var a = p.querySelector("[data-ask]");
      img.src = p.querySelector(".ph").getAttribute("data-full"); img.alt = p.querySelector("img").alt;
      cap.textContent = p.querySelector("h3").textContent;
      ["data-ref", "data-name-en", "data-name-ar"].forEach(function (k) { ask.setAttribute(k, a.getAttribute(k)); });
      ask.href = waLink(askText(ask));
    }
    document.querySelectorAll(".product .ph").forEach(function (b) {
      b.addEventListener("click", function () { last = b; show(vis().indexOf(b.closest(".product"))); lb.classList.add("is-open"); document.body.style.overflow = "hidden"; lb.querySelector(".lb-close").focus(); });
    });
    function close() { lb.classList.remove("is-open"); document.body.style.overflow = ""; if (last) last.focus(); }
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      var rtl = root.getAttribute("dir") === "rtl";
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(idx + (rtl ? -1 : 1));
      if (e.key === "ArrowLeft") show(idx + (rtl ? 1 : -1));
    });
  }

  /* ---------- enquiry form -> WhatsApp ---------- */
  var form = document.getElementById("enquire-form");
  if (form) {
    var pref = new URLSearchParams(location.search).get("for");
    if (pref) { var box = form.querySelector('input[name=item][data-key="' + pref + '"]'); if (box) box.checked = true; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ar = lang() === "ar";
      var name = form.querySelector("#q-name"), err = form.querySelector("#q-name-err");
      if (!name.value.trim()) { err.textContent = ar ? "يرجى كتابة الاسم." : "Add your name so the team knows who to reply to."; name.focus(); return; }
      err.textContent = "";
      function val(id) { var el = form.querySelector(id); return el ? el.value.trim() : ""; }
      function selText(id) { var el = form.querySelector(id); return el && el.value ? el.selectedOptions[0].text : ""; }
      var items = [].slice.call(form.querySelectorAll("input[name=item]:checked")).map(function (c) { return c.getAttribute(ar ? "data-ar-value" : "value"); });
      var metal = form.querySelector("input[name=metal]:checked");
      var L = ar
        ? ["مرحباً ناكشاترا عجمان، لدي استفسار.", "الاسم: " + name.value.trim(),
           items.length ? "أبحث عن: " + items.join("، ") : "", metal ? "النوع: " + metal.getAttribute("data-ar-value") : "",
           selText("#q-occasion") ? "المناسبة: " + selText("#q-occasion") : "", selText("#q-budget") ? "الميزانية: " + selText("#q-budget") : "",
           val("#q-visit") ? "موعد الزيارة: " + val("#q-visit") : "", val("#q-notes") ? "ملاحظات: " + val("#q-notes") : ""]
        : ["Hi Nakshathra Ajman, I have an enquiry.", "Name: " + name.value.trim(),
           items.length ? "Looking for: " + items.join(", ") : "", metal ? "Type: " + metal.value : "",
           selText("#q-occasion") ? "Occasion: " + selText("#q-occasion") : "", selText("#q-budget") ? "Budget: " + selText("#q-budget") : "",
           val("#q-visit") ? "Planning to visit: " + val("#q-visit") : "", val("#q-notes") ? "Notes: " + val("#q-notes") : ""];
      open(waLink(L.filter(Boolean).join("\n")), "_blank", "noopener");
    });
  }

  document.querySelectorAll("[data-year]").forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

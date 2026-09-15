/*
 * ============================================================
 * AS 7.10 — Course Page | Banner Key Stats (Variation 1)
 * Test    : Hero banner redesign + key-stats USP strip (Figma Option 1-D)
 * Patterns: P2 (Insert Section), P5 (MO guard), P7 (tracking in share.js),
 *           P11 (URL gating — all course pages), P12 (viewport branch + resize)
 * Helpers : waitForElement + listener() (Nuxt SPA safe)
 *           NO live() — native anchors preserved, no custom events
 * Body CSS: .EG-AS-710-V1
 * ============================================================
 *
 * DYNAMIC CONTENT (works on every course page):
 *  - Eyebrow parsed from existing H2, e.g. "MBA (Online)" -> "MBA (ONLINE)"
 *  - Hero image reused from current .course-glance__img (per page)
 *  - CTA hrefs untouched (brochure + apply keep working)
 *  - USP icon/title/text pulled from desktop grid, re-rendered Figma style
 *  - V1 shows concise values (CSS 2-line clamp). V2 shows full text.
 */
(function () {
  try {
    /* ── Variables ────────────────────────────────────────── */
    var debug = 0;
    var variation_name = "EG-AS-710-V1";
    var BODY_CLASS = "EG-AS-710-V1";
    var MOBILE_BP = 1024;
    var observer = null;
    var isRunning = false;
    var resizeTimer = null;
    var resizeBound = false;
    var glanceEl = null; var uspTries = 0; var uspPending = false;

    /* ── Helpers ──────────────────────────────────────────── */

    // Polls for selector then triggers once; self-clears after timeout.
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    // SPA routing — re-run init after Nuxt client-side navigation.
    function listener() {
      window.addEventListener("locationchange", function () {
        glanceEl = null;
        waitForElement(".c-course-glance .c-course-glance__detail-item", init, 100, 20000);
      });
      history.pushState = ((f) => function pushState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event("pushstate"));
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      })(history.pushState);
      history.replaceState = ((f) => function replaceState() {
        var ret = f.apply(this, arguments);
        window.dispatchEvent(new Event("replacestate"));
        window.dispatchEvent(new Event("locationchange"));
        return ret;
      })(history.replaceState);
      window.addEventListener("popstate", () => {
        window.dispatchEvent(new Event("locationchange"));
      });
    }

    // Cached anchor — re-resolves if Nuxt re-renders the section.
    function getGlance() {
      if (!glanceEl || !document.contains(glanceEl)) {
        glanceEl = document.querySelector(".c-course-glance");
      }
      return glanceEl;
    }

    function isMobileView() {
      return window.innerWidth < MOBILE_BP;
    }

    // Eyebrow text from existing H2 — "MBA (Online)" becomes "MBA (ONLINE)".
    function getEyebrowText(glance) {
      var h2 = glance.querySelector(".course-glance__content-body h2");
      if (!h2) return "";
      return (h2.textContent || "").replace(/\s+/g, " ").trim().toUpperCase();
    }

    // Insert eyebrow above H1 once. Original H2 hidden via CSS.
    function insertEyebrow(glance) {
      if (glance.querySelector(".eg-eyebrow")) return;
      var h1 = glance.querySelector(".course-glance__content-wrap h1");
      var text = getEyebrowText(glance);
      if (!h1 || !text) return;
      var el = document.createElement("div");
      el.className = "eg-eyebrow";
      el.textContent = text;
      h1.insertAdjacentElement("beforebegin", el);
    }

    // Gradient blend on image left edge (desktop). Idempotent.
    function insertOverlay(glance) {
      var wrap = glance.querySelector(".course-glance__img-wrap");
      if (!wrap || wrap.querySelector(".eg-hero-fade")) return;
      var fade = document.createElement("div");
      fade.className = "eg-hero-fade";
      fade.setAttribute("aria-hidden", "true");
      wrap.insertAdjacentElement("beforeend", fade);
    }

    // Read USP items from desktop grid (stable source — never carousel clones).
    function getUspItems(glance) {
      var nodes = glance.querySelectorAll(".c-course-glance__details-wrap .hidden .c-course-glance__detail-item"); if (!nodes.length) nodes = glance.querySelectorAll(".c-course-glance__details-wrap .carousel__slide:not(.carousel__slide--clone) .c-course-glance__detail-item");
      var out = [];
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var icon = node.querySelector("img.icon");
        var title = node.querySelector(".c-course-glance__detail-item-title");
        var caption = node.querySelector(".c-course-glance__detail-item-caption");
        if (!title || !caption) continue;
        var link = node.querySelector("a.c-course-glance__detail-item-link");
        out.push({
          src: icon ? icon.getAttribute("src") : "",
          alt: icon ? (icon.getAttribute("alt") || "") : "",
          title: (title.textContent || "").replace(/\s+/g, " ").trim(),
          html: caption.innerHTML,
          href: link ? link.getAttribute("href") : ""
        });
      }
      return out;
    }

    // Build one USP item with DOM API (caption HTML preserved incl. links).
    function buildUspItem(doc, data) {
      var item = doc.createElement("div");
      item.className = "eg-usp-item";
      var box = doc.createElement(data.href ? "a" : "div");
      if (data.href) {
        box.className = "eg-usp-link";
        box.setAttribute("href", data.href);
      } else {
        box.className = "eg-usp-box";
      }
      var head = doc.createElement("div");
      head.className = "eg-usp-head";
      if (data.src) {
        var img = doc.createElement("img");
        img.className = "eg-usp-icon";
        img.setAttribute("src", data.src);
        img.setAttribute("alt", data.alt);
        img.setAttribute("loading", "lazy");
        head.appendChild(img);
      }
      var title = doc.createElement("div");
      title.className = "eg-usp-title";
      title.textContent = data.title;
      head.appendChild(title);
      var val = doc.createElement("div");
      val.className = "eg-usp-val";
      val.innerHTML = data.html;
      box.appendChild(head);
      box.appendChild(val);
      item.appendChild(box);
      return item;
    }

    // Build USP strip; desktop = below hero, mobile = white card inside hero.
    function buildUsp(glance) {
      var data = getUspItems(glance);
      if (!data.length) { if (uspTries < 10 && !uspPending) { uspPending = true; uspTries++; setTimeout(function () { uspPending = false; var g = getGlance(); if (g && !g.querySelector(".eg-usp-strip")) buildUsp(g); }, 500); } return; }
      var old = glance.querySelector(".eg-usp-strip");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var strip = document.createElement("div");
      strip.className = "eg-usp-strip";
      for (var i = 0; i < data.length; i++) {
        strip.appendChild(buildUspItem(document, data[i]));
      }
      if (isMobileView()) {
        var content = glance.querySelector(".course-glance__content-wrap");
        if (content && content.parentNode && glance.contains(content)) {
          content.parentNode.insertAdjacentElement("afterend", strip);
          return;
        }
      }
      var bg = glance.querySelector(".c-course-glance__bg-wrap");
      if (bg) bg.insertAdjacentElement("afterend", strip);
    }

    // Resize rebuild (P12) — move strip when crossing the lg breakpoint.
    function initResize() {
      if (resizeBound) return;
      resizeBound = true;
      window.addEventListener("resize", function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          var g = getGlance();
          if (g) buildUsp(g);
        }, 250);
      });
    }

    // Re-apply after Nuxt re-renders. Scoped to .c-course-glance only.
    function initObserver(glance) {
      if (observer) return;
      observer = new MutationObserver(function (mutations) {
        if (isRunning) return;
        var changed = false;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].type === "childList" &&
              (mutations[i].addedNodes.length || mutations[i].removedNodes.length)) {
            changed = true;
            break;
          }
        }
        if (!changed) return;
        isRunning = true;
        var g = getGlance();
        if (g && document.body.classList.contains(BODY_CLASS)) {
          insertEyebrow(g);
          insertOverlay(g);
          var stripNow = g.querySelector(".eg-usp-strip"); var sourceCount = g.querySelectorAll(".c-course-glance__details-wrap .hidden .c-course-glance__detail-item").length; if (!stripNow || stripNow.children.length !== sourceCount) buildUsp(g);
        }
        setTimeout(function () { isRunning = false; }, 300);
      });
      observer.observe(glance, { childList: true, subtree: true });
    }

    /* ── Init — orchestrates helpers only, no logic here ─── */
    function init() {
      var glance = getGlance();
      if (!glance) return;
      uspTries = 0; uspPending = false; document.body.classList.add(BODY_CLASS);
      insertEyebrow(glance);
      insertOverlay(glance);
      buildUsp(glance);
      initResize();
      initObserver(glance);
    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement("html body .c-course-glance .c-course-glance__details-wrap .c-course-glance__detail .title", init,500, 20000);
    listener();
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();

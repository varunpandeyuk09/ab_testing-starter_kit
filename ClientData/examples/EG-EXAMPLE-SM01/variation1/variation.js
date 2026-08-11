/*
 * ============================================================
 * REFERENCE EXAMPLE — EG-EXAMPLE-SM01
 * Test    : PLP Product Card Optimization
 * Patterns: P2 (Insert Block), P3 (Sticky/Scroll), P5 (MO guard), P7 (Click Tracking)
 * Helpers : live() — needed because click tracking is in share.js
 *            NO listener() — not a SPA
 * Body CSS : .EG-EXAMPLE-SM01
 * ============================================================
 *
 * HOW TO READ THIS FILE:
 *  1. IIFE wrapper + try/catch — always present, never restructure.
 *  2. All helpers are defined at the IIFE top level, above init().
 *  3. init() only calls helpers — NO logic inside init().
 *  4. waitForElement() guards init() — init() never runs on missing DOM.
 *  5. Every insertion is idempotent (checks .eg-* exists before inserting).
 *  6. MutationObserver is scoped to the smallest container that changes.
 */
(function () {
  try {
    /* ── Variables ────────────────────────────────────────── */
    var debug = 0;
    var variation_name = 'EG-EXAMPLE-SM01';
    var observer = null;
    var isRunning = false;

    /* ── Helpers ──────────────────────────────────────────── */

    // Polls for selector then triggers once; self-clears after timeout.
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (
          document &&
          document.querySelector(selector) &&
          document.querySelectorAll(selector).length > 0
        ) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    // Delegated event binding — use this instead of direct addEventListener.
    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent('on' + type, handler);
        else el.addEventListener(type, handler);
      }
      this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);
      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          while (el && el.matches && el !== context && !(found = el.matches(selector)))
            el = el.parentElement;
          if (el && found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    // Insert a "Free Shipping" badge above each product card's price.
    // Idempotent: skips cards that already have the badge.
    function insertShippingBadges() {
      var cards = document.querySelectorAll('.product-item');
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.querySelector('.eg-shipping-badge')) continue; // already done
        var priceEl = card.querySelector('.price');
        if (!priceEl) continue;
        var badge = document.createElement('span');
        badge.className = 'eg-shipping-badge';
        badge.textContent = 'Free Shipping';
        priceEl.insertAdjacentElement('beforebegin', badge);
      }
    }

    // Show/hide the sticky "Back to Top" bar based on scroll depth.
    function handleScroll() {
      var bar = document.querySelector('.eg-sticky-bar');
      if (!bar) return;
      var scrolled = window.scrollY || document.documentElement.scrollTop;
      if (scrolled > 400) {
        bar.classList.add('eg-sticky-bar--visible');
      } else {
        bar.classList.remove('eg-sticky-bar--visible');
      }
    }

    // Insert the sticky bar once at the bottom of the page.
    function insertStickyBar() {
      if (document.querySelector('.eg-sticky-bar')) return; // idempotent
      var bar = document.createElement('div');
      bar.className = 'eg-sticky-bar';
      bar.innerHTML = '<button class="eg-sticky-bar__btn">&#8679; Back to Top</button>';
      document.body.appendChild(bar);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // MutationObserver: reapply badges when the product grid re-renders (e.g. after filter).
    function initObserver() {
      var grid = document.querySelector('.product-grid');
      if (!grid || observer) return; // already observing
      observer = new MutationObserver(function (mutations) {
        if (isRunning) return; // re-entrancy guard
        var hasAdded = mutations.some(function (m) {
          return m.addedNodes && m.addedNodes.length > 0;
        });
        if (hasAdded) {
          isRunning = true;
          insertShippingBadges();
          setTimeout(function () { isRunning = false; }, 200);
        }
      });
      observer.observe(grid, { childList: true, subtree: true });
    }

    /* ── Init — orchestrates helpers only, no logic here ─── */
    function init() {
      document.body.classList.add('EG-EXAMPLE-SM01');
      insertShippingBadges();
      insertStickyBar();
      initObserver();
    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement('.product-grid', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

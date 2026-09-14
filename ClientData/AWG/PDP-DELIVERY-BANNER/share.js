(function () {
  try {
    /*
     * share.js — Goals / Click Tracking
     * ─────────────────────────────────
     * RULES:
     *  - Track clicks only. NO DOM mutation here.
     *  - One live() call per tracked element.
     *  - Use human-readable console.log labels.
     *  - This file runs on every variation (listed in v1.json).
     */
    var debug = 0;
    var variation_name = 'EG-PDP-DEL-BANNER';

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

    /* ── Tracking — one live() per goal ──────────────────── */
    function init() {
      /* Goal: User clicks the Add-to-Cart button (after banner is visible) */
      live('[data-track-id="addToCartPDP"]', 'click', function () {
        console.log('EG-PDP-DEL-BANNER: Add to Cart clicked');
      });
    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement('[data-track-id="addToCartPDP"]', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

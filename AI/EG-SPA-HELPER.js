/**
 * EG-SPA-HELPER — Universal React / Angular / Vue Re-Render Safe Snippet
 * ──────────────────────────────────────────────────────────────────────
 * Usage:
 *   1. Developer sirf `init()` mein changes likhta hai
 *   2. Ye snippet automatically:
 *      - Page load pe apply karta hai
 *      - Element delete/re-render hone pe re-apply karta hai
 *      - SPA route change pe bhi apply karta hai
 *
 * Example:
 *   EG_SPA_HELP.init = function () {
 *     // mini cart badge
 *     var badge = document.querySelector('.cart-badge');
 *     if (badge) badge.innerText = '3';
 *
 *     // CTA text change
 *     var cta = document.querySelector('.hero-cta');
 *     if (cta) cta.innerText = 'Shop Now';
 *   };
 */
var EG_SPA_HELP = (function () {
  var applied = {};       // selector → true (guard)
  var observer = null;

  function wait(sel, fn, interval, timeout) {
    var i = setInterval(function () {
      if (document.querySelector(sel)) { clearInterval(i); fn(); }
    }, interval || 100);
    setTimeout(function () { clearInterval(i); }, timeout || 20000);
  }

  // Developer ye change karega
  var initFn = function () {};

  // Kisi bhi element ke liye changes apply karo
  function apply(selector) {
    if (applied[selector]) return;
    var el = document.querySelector(selector);
    if (!el) return;
    applied[selector] = true;
    initFn();
  }

  // Reset — jab React element delete kare toh dubara apply ho sake
  function reset(selector) {
    delete applied[selector];
  }

  // MutationObserver — body pe, saare DOM changes catch karta hai
  function startObserving() {
    if (observer) return;

    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];

        // Added nodes — naya element aaya
        if (m.addedNodes.length > 0) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var node = m.addedNodes[j];
            if (node.nodeType !== 1) continue; // sirf elements

            // Check karo ki koi watched selector is node ke andar hai ya ye khud hai
            for (var sel in applied) {
              if (node.matches && node.matches(sel)) {
                reset(sel);
              }
              if (node.querySelector && node.querySelector(sel)) {
                reset(sel);
              }
            }
          }
          // Re-apply sab
          for (var sel in applied) {
            apply(sel);
          }
        }

        // Removed nodes — element delete hua
        if (m.removedNodes.length > 0) {
          for (var j = 0; j < m.removedNodes.length; j++) {
            var node = m.removedNodes[j];
            if (node.nodeType !== 1) continue;
            for (var sel in applied) {
              if (node.matches && node.matches(sel)) {
                reset(sel);
              }
              if (node.querySelector && node.querySelector(sel)) {
                reset(sel);
              }
            }
          }
          // Re-apply sab
          for (var sel in applied) {
            wait(sel, function () { apply(sel); }, 100, 5000);
          }
        }

        // Attribute change — class ya data attribute change
        if (m.type === 'attributes') {
          var target = m.target;
          for (var sel in applied) {
            if (target.matches && target.matches(sel)) {
              reset(sel);
            }
          }
          for (var sel in applied) {
            apply(sel);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-soul', 'data-testid', 'data-qa']
    });
  }

  // SPA route change
  function hookHistory() {
    var push = history.pushState;
    var replace = history.replaceState;

    history.pushState = function () {
      var ret = push.apply(this, arguments);
      scheduleReapply();
      return ret;
    };

    history.replaceState = function () {
      var ret = replace.apply(this, arguments);
      scheduleReapply();
      return ret;
    };

    window.addEventListener('popstate', scheduleReapply);
  }

  function scheduleReapply() {
    setTimeout(function () {
      for (var sel in applied) {
        reset(sel);
        wait(sel, function () { apply(sel); }, 100, 5000);
      }
    }, 500);
  }

  // Public API
  return {
    set init(fn) { initFn = fn; },
    get init() { return initFn; },

    // Kisi specific selector ko watch karo (optional — agar sirf kuch elements track karne ho)
    watch: function (selector) {
      applied[selector] = false;
      wait(selector, function () { apply(selector); }, 100, 15000);
      startObserving();
    },

    // Sab selectors ko ek saath watch karo (init ke andar se)
    start: function () {
      startObserving();
      hookHistory();
    },

    // Manual re-apply
    refresh: function () {
      for (var sel in applied) {
        reset(sel);
      }
      for (var sel in applied) {
        apply(sel);
      }
    }
  };
})();

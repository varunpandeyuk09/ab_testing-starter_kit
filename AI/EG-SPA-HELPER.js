/**
 * EG-SPA-HELPER — Universal React / Angular / Vue Re-Render Safe Snippet
 * ──────────────────────────────────────────────────────────────────────
 * Usage:
 *   1. Developer only writes changes in `init()`
 *   2. This snippet automatically:
 *      - Applies on page load
 *      - Re-applies when element is deleted/re-rendered
 *      - Re-applies on SPA route change
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

  // Developer will change this
  var initFn = function () {};

  // Apply changes for any element
  function apply(selector) {
    if (applied[selector]) return;
    var el = document.querySelector(selector);
    if (!el) return;
    applied[selector] = true;
    initFn();
  }

  // Reset — so it can be re-applied when React deletes/re-renders element
  function reset(selector) {
    delete applied[selector];
  }

  // MutationObserver — on body, catches all DOM changes
  function startObserving() {
    if (observer) return;

    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];

        // Added nodes — new element appeared
        if (m.addedNodes.length > 0) {
          for (var j = 0; j < m.addedNodes.length; j++) {
            var node = m.addedNodes[j];
            if (node.nodeType !== 1) continue; // only elements

            // Check if any watched selector is inside this node or is this node
            for (var sel in applied) {
              if (node.matches && node.matches(sel)) {
                reset(sel);
              }
              if (node.querySelector && node.querySelector(sel)) {
                reset(sel);
              }
            }
          }
          // Re-apply all
          for (var sel in applied) {
            apply(sel);
          }
        }

        // Removed nodes — element was deleted
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
          // Re-apply all
          for (var sel in applied) {
            wait(sel, function () { apply(sel); }, 100, 5000);
          }
        }

        // Attribute change — class or data attribute changed
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

    // Watch a specific selector (optional — when tracking only certain elements)
    watch: function (selector) {
      applied[selector] = false;
      wait(selector, function () { apply(selector); }, 100, 15000);
      startObserving();
    },

    // Watch all selectors together (call from init)
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

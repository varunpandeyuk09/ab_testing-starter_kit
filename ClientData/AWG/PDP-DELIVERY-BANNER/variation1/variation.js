/*
 * ============================================================
 * AWG — PDP Delivery Banner
 * Test    : Add free-returns banner below Add-to-Cart CTA
 * Patterns: P2 (Insert Section), XHR Hook (AJAX re-apply)
 * Helpers : waitForElement, live
 * Anchor  : [data-track-id="addToCartPDP"]
 * ============================================================
 */
(function () {
  try {
    var debug = 1;
    var variation_name = 'EG-PDP-DEL-BANNER';
    var ANCHOR_SEL = '[data-track-id="addToCartPDP"]';
    var INJECTED_CLASS = 'eg-del-banner-injected';

    /* ── Helpers ──────────────────────────────────────────── */

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

    /* ── Core: inject banner after CTA ────────────────────── */
    function injectBanner() {
      var btn = document.querySelector(ANCHOR_SEL);
      if (!btn) return;

      // already injected — skip
      if (btn.classList.contains(INJECTED_CLASS)) return;

      var banner = document.createElement('div');
      banner.className = 'eg-del-banner';
      banner.innerHTML =
        '<svg class="eg-del-banner__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' +
        '<span class="eg-del-banner__text"><strong>Sorglos Anprobieren:</strong> Gratis Rücksendung</span>';

      btn.insertAdjacentElement('afterend', banner);
      btn.classList.add(INJECTED_CLASS);
      if (debug) console.log(variation_name + ': banner INJECTED');
    }

    /* ── XHR Hook: re-inject after ANY AJAX call ──────────── */
    function hookAjaxReapply() {
      if (hookAjaxReapply.hooked) return;
      hookAjaxReapply.hooked = true;

      var origSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
          if (debug) console.log(variation_name + ': XHR done — ' + this.responseURL);
          waitForElement(ANCHOR_SEL, function () {
            injectBanner();
          }, 50, 5000);
        });
        return origSend.apply(this, arguments);
      };
      if (debug) console.log(variation_name + ': XHR hook installed');
    }

    /* ── Fetch Hook: re-inject after ANY fetch call ────────── */
    function hookFetchReapply() {
      if (hookFetchReapply.hooked) return;
      hookFetchReapply.hooked = true;

      var origFetch = window.fetch;
      window.fetch = function () {
        return origFetch.apply(this, arguments).then(function (response) {
          if (debug) console.log(variation_name + ': fetch done — ' + response.url);
          setTimeout(function () {
            waitForElement(ANCHOR_SEL, function () {
              injectBanner();
            }, 50, 5000);
          }, 300);
          return response;
        });
      };
      if (debug) console.log(variation_name + ': fetch hook installed');
    }

    /* ── Init ─────────────────────────────────────────────── */
    function init() {
      document.body.classList.add('EG-PDP-DEL-BANNER');
      injectBanner();
    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement(ANCHOR_SEL, function () {
      init();
      hookAjaxReapply();
      hookFetchReapply();
    }, 1000, 15000);

  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

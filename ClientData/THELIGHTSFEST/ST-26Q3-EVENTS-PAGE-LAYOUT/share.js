/*
 * ============================================================
 * THELIGHTSFEST — ST | 26Q3 | Events Page Layout
 * share.js — Event tracking for trust badges and CTA clicks
 * ============================================================
 *
 * Tracks:
 *  1. Trust badges CTA click (Buy Tickets from trust section)
 *  2. Mobile sticky bar CTA click
 *  3. Guarantee tooltip hover
 */
(function () {
  try {
    var variation_name = 'ST-26Q3-EVENTS-PAGE-LAYOUT';

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

    function trackEvents() {
      live('.eg-buy-tickets-btn, .eg-mobile-buy-btn', 'click', function () {
        if (typeof dataLayer !== 'undefined') {
          dataLayer.push({
            event: 'ab_test_click',
            test_name: variation_name,
            element: this.classList.contains('eg-buy-tickets-btn') ? 'desktop_trust_cta' : 'mobile_sticky_cta'
          });
        }
      });

      live('.eg-guarantee-tooltip-trigger', 'mouseenter', function () {
        if (typeof dataLayer !== 'undefined') {
          dataLayer.push({
            event: 'ab_test_hover',
            test_name: variation_name,
            element: 'guarantee_tooltip'
          });
        }
      });
    }

    function init() {
      trackEvents();
    }

    waitForElement('.eg-trust-badges', init, 50, 15000);
  } catch (e) {
    if (typeof debug !== 'undefined' && debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

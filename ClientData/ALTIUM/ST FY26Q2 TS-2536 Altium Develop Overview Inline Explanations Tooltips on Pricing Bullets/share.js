(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-TS-2536';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      if (document.querySelector(selector)) {
        trigger();
      } else {
        var interval = setInterval(function () {
          if (document.querySelector(selector)) {
            clearInterval(interval);
            trigger();
          }
        }, delayInterval);
        setTimeout(function () {
          clearInterval(interval);
        }, delayTimeout);
      }
    }

    function live(selector, event, callback, context) {
      (context || document).addEventListener(event, function (e) {
        var target = e.target;
        while (target && target !== this) {
          if (target.matches(selector)) {
            callback.call(target, e);
            break;
          }
          target = target.parentElement;
        }
      });
    }

    function init() {
      // Tracking: Pricing CTA click
      live('html body .b-pricing-2 [href*="start"], html body .b-pricing-2 .btn, html body .b-pricing-2 [class*="cta"]', 'click', function () {
        console.log('Pricing CTA click');
      });
      // Tracking: Tooltip hover/click on Author
      live('html body .b-pricing-2 .eg-tip', 'click', function () {
        console.log('Author tooltip interact');
      });
      live('html body .b-pricing-2 .eg-tip', 'mouseenter', function () {
        console.log('Author tooltip hover');
      });
    }

    waitForElement('html body .b-pricing-2', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

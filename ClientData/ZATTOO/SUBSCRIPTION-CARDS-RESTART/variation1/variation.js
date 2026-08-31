(function () {
  try {
    var debug = 1;
    var v = 'EG-ZATTOO-RESTART';

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

    /* Variation Init */
    function init() {
      var cardEl = document.querySelector('[data-soul="SUBSCRIPTION_CARDS"] > [data-soul="CARD_SUBSCRIPTION_PREMIUM"]');
      if (!cardEl) return;
      if (cardEl.classList.contains('eg-changes-made')) return;

      document.body.classList.add(v);

      // 1) image change
      var imageEl = cardEl.querySelector('[data-soul="CARD_IMAGE"]');
      imageEl && imageEl.setAttribute('src', 'https://images.ctfassets.net/nn6vbw09vzdt/3MsKEHF3PewpTiDxuU3W6P/5b0d2af5e85efbb07ae7c5c6aa2fd614/ULTIMATE_Icon_Logo_.svg');

      // 2) change card text
      var cardTextEl = cardEl.querySelector('h4');
      if (cardTextEl) cardTextEl.innerText = 'ULTIMATE offer';

      // 3) price text change
      var priceTextEl = cardEl.querySelector('h3');
      if (priceTextEl) priceTextEl.innerText = '22 CHF';

      // 4) change cta href
      var cardCTAEl = cardEl.querySelector('[data-soul="CARD_CTA"]');
      cardCTAEl && cardCTAEl.setAttribute('href', 'https://zattoo.com/start/signup?selectedServiceType=zattoo_ultimate');

      // 5) change sender text — React ke saath race condition, retry karo
      function applySenderText() {
        var el = cardEl.querySelector('[data-soul="CARD_TEXT"] ~ span');
        if (el) {
          el.innerText = '376 TV-Sender (118 Full HD | 206 HD) 2000 weltweite Aufnahmen';
          if (debug) console.log(v + ': sender text applied');
        }
        return !!el;
      }
      applySenderText();
      setTimeout(applySenderText, 300);
      setTimeout(applySenderText, 800);
      setTimeout(applySenderText, 1500);

      cardEl.classList.add('eg-changes-made');
      if (debug) console.log(v + ': applied');
    }

    // SPA route change detection
    function hookHistory() {
      var origPush = history.pushState;
      var origReplace = history.replaceState;

      history.pushState = function () {
        var ret = origPush.apply(this, arguments);
        setTimeout(function () { waitForElement('[data-soul="SUBSCRIPTION_CARDS"] > [data-soul="CARD_SUBSCRIPTION_PREMIUM"]', init, 100, 5000); }, 500);
        return ret;
      };

      history.replaceState = function () {
        var ret = origReplace.apply(this, arguments);
        setTimeout(function () { waitForElement('[data-soul="SUBSCRIPTION_CARDS"] > [data-soul="CARD_SUBSCRIPTION_PREMIUM"]', init, 100, 5000); }, 500);
        return ret;
      };

      window.addEventListener('popstate', function () {
        setTimeout(function () { waitForElement('[data-soul="SUBSCRIPTION_CARDS"] > [data-soul="CARD_SUBSCRIPTION_PREMIUM"]', init, 100, 5000); }, 500);
      });
    }

    // MutationObserver — React jab re-render kare toh re-apply
    function watchCards() {
      var observer = new MutationObserver(function () {
        var cardEl = document.querySelector('[data-soul="CARD_SUBSCRIPTION_PREMIUM"]');
        if (cardEl && !cardEl.classList.contains('eg-changes-made')) {
          if (debug) console.log(v + ': re-render detected, re-applying');
          init();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    hookHistory();

    // Initial run
    waitForElement('[data-soul="SUBSCRIPTION_CARDS"] > [data-soul="CARD_SUBSCRIPTION_PREMIUM"]', function () {
      init();
      watchCards();
    }, 100, 15000);

  } catch (e) { if (debug) console.log(e, 'error'); }
})();

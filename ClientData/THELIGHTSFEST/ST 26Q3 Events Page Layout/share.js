(function () {
  try {
    /*
     * share.js — Goals / Click Tracking
     * ─────────────────────────────────
     * Project: THELIGHTSFEST | ST 26Q3 | Events Page Layout
     * RULES:
     *  - Track clicks only. NO DOM mutation here.
     *  - One live() call per tracked element.
     *  - Use human-readable console.log labels.
     *  - This file runs on every variation (listed in v1.json).
     */
    var debug = 0;
    var variation_name = 'EG-TLF001';

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

    // Delegated event binding for static + dynamic elements.
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

      // Goal 1: CTA Button Click (e.g. "Buy Tickets" / "Register")
      live('.event-cta-btn, .buy-tickets-btn, [data-cta="tickets"]', 'click', function () {
        console.log('EG-TLF001: CTA Button clicked');
      });

      // Goal 2: Media Thumbnail Click (Lightbox open)
      live('.lg-thumb-item, .media-thumbnail, [data-media-thumb]', 'click', function () {
        console.log('EG-TLF001: Media Thumbnail clicked - Lightbox opened');
      });

      // Goal 3: Video Play Click (inside lightbox or hero)
      live('.lg-video-cont, .video-play-btn, [data-video-play]', 'click', function () {
        console.log('EG-TLF001: Video Play clicked');
      });

      // Goal 4: Custom Goal - Event Share
      live('.share-btn, [data-share]', 'click', function () {
        console.log('EG-TLF001: Share button clicked');
      });

      // Goal 5: Custom Goal - Map Click
      live('.map-link, [data-map]', 'click', function () {
        console.log('EG-TLF001: Map/Location clicked');
      });

    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement('html body', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

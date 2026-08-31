/*
 * ============================================================
 * AWG — AB045 — Mobile Swatch Image Change
 * Test    : PLP swatch tap updates main image on mobile
 * Patterns: P1 (Image Swap), P11 (Device-Switch)
 * Helpers : live() — delegated click on dynamic swatches
 *            NO listener() — not a SPA
 * Body CSS : .EG-AB045
 * ============================================================
 */
(function () {
  try {
    /* ── Variables ────────────────────────────────────────── */
    var debug = 0;
    var variation_name = 'EG-AB045';
    var isMobile = window.matchMedia('(max-width: 767px)').matches;

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

    // Check if viewport is mobile
    function checkMobile() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    // Parse the hover image options JSON from swatch wrapper
    function getSwatchOptions(wrapper) {
      var raw = wrapper.getAttribute('data-val-swatches-hover-image-options');
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    // Update main product image with data from swatch
    function updateMainImage(card, imageData) {
      if (!imageData) return;
      var mainImg = card.querySelector('.val-js-swatch-main-image');
      if (!mainImg) return;
      mainImg.setAttribute('src', imageData.url);
      if (imageData.srcset) mainImg.setAttribute('srcset', imageData.srcset);
      if (imageData.sizes) mainImg.setAttribute('sizes', imageData.sizes);
      if (imageData.alt) mainImg.setAttribute('alt', imageData.alt);
    }

    // Update active swatch state
    function updateActiveSwatch(wrapper, clickedSwatch) {
      var allSwatches = wrapper.querySelectorAll('.val-color-swatches-variant');
      for (var i = 0; i < allSwatches.length; i++) {
        allSwatches[i].classList.remove('is--active');
        allSwatches[i].removeAttribute('aria-current');
        var label = allSwatches[i].getAttribute('aria-label');
        if (label && label.indexOf(', ausgewählt') !== -1) {
          allSwatches[i].setAttribute('aria-label', label.replace(', ausgewählt', ''));
        }
      }
      clickedSwatch.classList.add('is--active');
      clickedSwatch.setAttribute('aria-current', 'true');
      var newLabel = clickedSwatch.getAttribute('aria-label');
      if (newLabel && newLabel.indexOf(', ausgewählt') === -1) {
        clickedSwatch.setAttribute('aria-label', newLabel + ', ausgewählt');
      }
    }

    // Handle swatch click on mobile
    function handleSwatchClick(e) {
      if (!checkMobile()) return;

      var swatch = e.target.closest('.val-color-swatches-variant');
      if (!swatch) return;

      var wrapper = swatch.closest('.val-color-swatches-wrapper');
      if (!wrapper) return;

      var card = swatch.closest('.card.product-box');
      if (!card) return;

      // Prevent redirect to PDP
      e.preventDefault();
      e.stopPropagation();

      // Get swatch index (1-based)
      var swatchIndex = parseInt(swatch.getAttribute('data-val-swatches-hover-image-url'), 10);
      if (isNaN(swatchIndex) || swatchIndex < 1) return;

      // Get options JSON array
      var options = getSwatchOptions(wrapper);
      if (!options || !Array.isArray(options)) return;

      // Convert to 0-based index
      var imageData = options[swatchIndex - 1];
      if (!imageData) return;

      // Update main image
      updateMainImage(card, imageData);

      // Update active state
      updateActiveSwatch(wrapper, swatch);
    }

    /* ── Init — orchestrates helpers only, no logic here ─── */
    function init() {
      document.body.classList.add('EG-AB045');
      // Use capture phase to intercept before any other handlers
      live('.val-color-swatches-variant', 'click', handleSwatchClick, document);
    }

    /* ── Boot ─────────────────────────────────────────────── */
    waitForElement('.val-color-swatches-wrapper', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

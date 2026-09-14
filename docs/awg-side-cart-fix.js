/**
 * AWG Mode - Side Cart Mobile Fix
 * Issue: Desktop pe .click() se side cart open hota hai, Mobile pe nahi
 * Root Cause: Shopware OffCanvasCart Plugin mobile pe 'touchstart' sunta hai, 'click' nahi
 *   File: src/plugin/offcanvas-cart/offcanvas-cart.plugin.js:43-46
 *   const event = DeviceDetection.isTouchDevice() ? 'touchstart' : 'click';
 *   this.el.addEventListener(event, this._onOpenOffCanvasCart)
 * Fix: Mobile pe extra 'click' listener add karna + dynamic click ko touchstart me convert karna
 * Usage: Is file ko GTM / VWO / AB testing tool me <script> ke roop me inject kare
 */

(function AWG_SideCart_Fix() {
  'use strict';

  var CART_SELECTOR = '[data-off-canvas-cart]';
  var CART_BTN_SELECTOR = '[data-off-canvas-cart] [data-cart-widget], [data-cart-widget], .header-cart-btn';
  var PATCH_KEY = '__awgCartPatched';
  var GUARD_MS = 600; // touchstart + click double-open rokne ke liye

  // 1. Global helper - kahi se bhi call kar sakte ho (console, AB test, CTA)
  window.AWG_openSideCart = window.AWG_openSideCart || function () {
    // Try plugin instance first (sahi Shopware way)
    try {
      if (window.PluginManager) {
        var instances = window.PluginManager.getPluginInstances('OffCanvasCart');
        if (instances && instances.length) {
          var inst = instances[0];
          var url = (window.router && window.router['frontend.cart.offcanvas']) || '/checkout/offcanvas';
          // Shopware ka public method
          if (typeof inst.openOffCanvas === 'function') {
            inst.openOffCanvas(url, false);
            return true;
          }
        }
      }
    } catch (e) {}

    // Fallback: direct AjaxOffCanvas call ya touchstart dispatch
    var el = document.querySelector(CART_SELECTOR);
    if (el) {
      // touchstart dispatch kare - original handler trigger hoga
      var ev;
      try {
        ev = new TouchEvent('touchstart', { bubbles: true, cancelable: true, view: window });
      } catch (err) {
        ev = new Event('touchstart', { bubbles: true, cancelable: true });
      }
      el.dispatchEvent(ev);
      return true;
    }
    return false;
  };

  // backward compat alias
  window.triggerCartOpen = window.AWG_openSideCart;
  window.openSideCart = window.AWG_openSideCart;

  function isTouchDevice() {
    return 'ontouchstart' in document.documentElement;
  }

  function patchInstance(inst) {
    if (!inst || !inst.el || inst[PATCH_KEY]) return;
    inst[PATCH_KEY] = true;

    // click fallback add karo - touch device pe bhi click sunega
    inst.el.addEventListener('click', function (e) {
      // agar abhi touchstart se open hua hai to double open mat karo
      if (inst._lastTouchStart && Date.now() - inst._lastTouchStart < GUARD_MS) return;

      // Sirf tab handle karo jab touch device hai (desktop pe already click listener hai)
      // Ya jab event synthetic hai (isTrusted false - console se .click())
      e.preventDefault();
      var url = (window.router && window.router['frontend.cart.offcanvas']) || '/checkout/offcanvas';
      inst.openOffCanvas(url, false);
    });

    // touchstart time track karo taaki click double trigger rok sake
    inst.el.addEventListener('touchstart', function () {
      inst._lastTouchStart = Date.now();
    }, { passive: false });
  }

  function patchAllExistingInstances() {
    try {
      if (!window.PluginManager || !window.PluginManager.getPluginInstances) return 0;
      var list = window.PluginManager.getPluginInstances('OffCanvasCart');
      if (!list || !list.length) return 0;
      list.forEach(patchInstance);
      return list.length;
    } catch (e) {
      return 0;
    }
  }

  // Delegated fallback - Plugin load hone se pehle bhi kaam karega
  // Koi bhi [data-cart-widget] pe click/touch ho to catch karenge
  function addDelegatedFallback() {
    // click ko touchstart me convert karne wala interceptor
    document.addEventListener('click', function (e) {
      var btn = e.target.closest(CART_BTN_SELECTOR);
      if (!btn) return;
      var container = btn.closest(CART_SELECTOR) || document.querySelector(CART_SELECTOR);
      if (!container) return;

      // Agar ye real user click hai aur touch device hai, to original touchstart already handle kar chuka hoga
      // Lekin synthetic click (e.isTrusted === false) ko hame handle karna hai
      // isTrusted check: console se .click() -> isTrusted false, physical click -> true
      if (isTouchDevice() && e.isTrusted === false) {
        e.preventDefault();
        e.stopPropagation();
        // thoda delay deke open karo taaki duplicate na ho
        setTimeout(function () {
          window.AWG_openSideCart();
        }, 10);
      }
    }, true); // capture phase me taaki jaldi pakde
  }

  // Prototype patch - future instances ke liye
  function patchPrototypeWhenAvailable() {
    // Shopware plugins webpack chunk se async aate hai, isliye poll karna padega
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      // 1. Existing instances patch karo
      patchAllExistingInstances();

      // 2. Try to patch prototype via PluginManager registry (agar mil jaye)
      try {
        var plugin = window.PluginManager && window.PluginManager.getPlugin('OffCanvasCart');
        // kuch Shopware versions me getPlugin alag hota hai, isliye safe check
        if (plugin && plugin.prototype && !plugin.prototype[PATCH_KEY]) {
          var origRegister = plugin.prototype._registerOpenTriggerEvents;
          if (typeof origRegister === 'function') {
            plugin.prototype._registerOpenTriggerEvents = function () {
              // original (touchstart OR click)
              origRegister.call(this);
              // extra click listener hamesha add karo
              if (isTouchDevice()) {
                this.el.addEventListener('click', this._onOpenOffCanvasCart.bind(this));
              }
            };
            plugin.prototype[PATCH_KEY] = true;
            clearInterval(timer);
          }
        }
      } catch (e) {}

      if (tries > 80) clearInterval(timer); // ~16 sec
    }, 200);
  }

  function init() {
    addDelegatedFallback();
    patchPrototypeWhenAvailable();
    // immediate existing patch attempt
    patchAllExistingInstances();

    // MutationObserver - SPA navigation ya ajax reload pe fir se patch
    var obs = new MutationObserver(function () {
      patchAllExistingInstances();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    console.log('[AWG Fix] SideCart mobile click fix active. Test: document.querySelector(\'[data-off-canvas-cart] a\').click() ya AWG_openSideCart()');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for QA - console me check kar sakte ho
  window.__AWG_CART_FIX__ = {
    patchInstance: patchInstance,
    patchAll: patchAllExistingInstances,
    isTouch: isTouchDevice
  };
})();

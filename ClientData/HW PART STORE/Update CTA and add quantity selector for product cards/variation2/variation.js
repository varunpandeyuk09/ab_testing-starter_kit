(function () {
  try {
    var debug = 0;
    var variation_name = "EG-HWP-LEARN-02";

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

        function live(selector, event, callback, context) {
  function addEvent(el, type, handler) {
    if (el.attachEvent) el.attachEvent('on' + type, handler);
    else el.addEventListener(type, handler);
  }
  this.Element && (function (ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matches || ElementPrototype.matchesSelector ||
      ElementPrototype.webkitMatchesSelector || ElementPrototype.msMatchesSelector ||
      function (selector) {
        var node = this, nodes = (node.parentNode || node.document).querySelectorAll(selector), i = -1;
        while (nodes[++i] && nodes[i] != node);
        return !!nodes[i];
      };
  })(Element.prototype);
  function live(selector, event, callback, context) {
    addEvent(context || document, event, function (e) {
      var found, el = e.target || e.srcElement;
      while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
      if (el && found) callback.call(el, e);
    });
  }
  live(selector, event, callback, context);
}


    function init() {
      document.body.classList.add("EG-HWP-LEARN-02");
      // find ATC buttons and convert to Learn more -> PDP
      var targets = [...document.querySelectorAll('form[action*="/cart/add"] button[data-action="add-to-cart"]')];
      
      for (var b = 0; b < targets.length; b++) {
        var btn = targets[b];
        if (btn.dataset.egLearn) continue;
        btn.dataset.egLearn = "1";
        btn.textContent = "Learn more";
        btn.classList.add("eg-learn-more");
        // kill Shopify/Warehouse ATC handlers — must remove data-action + type
        btn.type = "button";
        btn.removeAttribute("name");
        btn.removeAttribute("data-action");
        btn.removeAttribute("data-product-id");
        var frm = btn.closest("form");
        if (frm) {
          frm.addEventListener("submit", function (ev) { ev.preventDefault(); ev.stopPropagation(); }, true);
        }
      }
    }

    function liveEvents() {
      if (document.body.dataset.egLearnLive) return;
      document.body.dataset.egLearnLive = "1";
      // use capture to beat Warehouse theme's handler
      document.addEventListener("click", function (e) {
        var learn = e.target.closest(".eg-learn-more");
        if (!learn) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        // v2 must go to PDP via image wrapper href (wrapper itself IS <a class="product-item__image-wrapper" href="...">)
        var card = learn.closest(".product-item");
        var href = null;
        if (card) {
          var w = card.querySelector(".product-item__image-wrapper");
          if (w) href = w.getAttribute("href");
        }
        // fallback: search from learn itself upwards
        if (href) window.location.href = href;
      }, true);
    }

    function start() {
      waitForElement('form[action*="/cart/add"] button, .product-item, .product-item__image-wrapper', function () {
        init();
        liveEvents();
      }, 50, 15000);
    }

    waitForElement("body", start, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in EG-HWP-LEARN-02");
  }
})();

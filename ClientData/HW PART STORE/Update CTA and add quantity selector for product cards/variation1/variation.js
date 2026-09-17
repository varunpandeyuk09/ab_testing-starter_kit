(function () {
  try {
    var debug = 0;
    var variation_name = "EG-HWP-QTY-01";

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
      document.body.classList.add("EG-HWP-QTY-01");
      if (document.querySelector(".eg-qty-wrap")) return;

      var atcBtns = [...document.querySelectorAll('form[action*="/cart/add"] button[data-action="add-to-cart"]')];
      
    
      if (!atcBtns.length) return;

      for (var b = 0; b < atcBtns.length; b++) {
        var btn = atcBtns[b];
        var form = btn.closest("form");
        var card = btn.closest(".product-item, .product-list__item, .grid__item, li, .ProductItem") || (form ? form.parentElement : btn.parentElement);
        if (!card || card.querySelector(".eg-qty-wrap")) continue;

        var qtyInput = form ? form.querySelector('input[name="quantity"]') : null;
        if (form && !qtyInput) {
          qtyInput = document.createElement("input");
          qtyInput.type = "hidden";
          qtyInput.name = "quantity";
          qtyInput.value = "1";
          form.appendChild(qtyInput);
        }
        if (qtyInput) qtyInput.value = "1";

        var wrap = document.createElement("div");
        wrap.className = "eg-qty-wrap";
        wrap.insertAdjacentHTML("afterbegin", '<div class="eg-qty"><button type="button" class="eg-qty-btn eg-minus" aria-label="minus">−</button><span class="eg-qty-val">1</span><button type="button" class="eg-qty-btn eg-plus" aria-label="plus">+</button></div>');
        var parent = btn.parentElement;
        parent.insertBefore(wrap, btn);
        wrap.appendChild(btn);
        btn.classList.add("eg-atc");
      }
    }

    function liveEvents() {
      if (document.body.dataset.egQtyLive) return;
      document.body.dataset.egQtyLive = "1";
      // minus click
      live('.eg-minus', 'click', function () { 
        var minus = this;
        var w = minus.closest(".eg-qty-wrap");
        if(!w) return;
        var valEl = w.querySelector(".eg-qty-val");
        var frm = w.closest("form");
        var inp = null;
        if(frm && frm.querySelector('[name="quantity"]')) inp = frm.querySelector('[name="quantity"]');
        var cur = parseInt(valEl.textContent, 10) || 1;
        cur = Math.max(1, cur - 1);
        valEl.textContent = cur;
        if (inp) inp.value = cur;
        w.dataset.qty = cur;
      });

      // plus click
      live('.eg-plus', 'click', function () { 
        var plus = this;
        var w = plus.closest(".eg-qty-wrap");
        if(!w) return;
        var valEl = w.querySelector(".eg-qty-val");
        var frm = w.closest("form");
        var inp = null;
        if(frm && frm.querySelector('[name="quantity"]')) inp = frm.querySelector('[name="quantity"]');
        var cur = parseInt(valEl.textContent, 10) || 1;
         cur = cur + 1;
        valEl.textContent = cur;
        if (inp) inp.value = cur;
        w.dataset.qty = cur;
      });

      // atc click
      live('.eg-atc', 'click', function () {
        var atc = this;
        var w = atc.closest(".eg-qty-wrap");
        if (!w) return;
        var form = atc.closest("form");
        if (!form) return;
        var inp2 = form.querySelector('[name="quantity"]');
        var v = w.querySelector(".eg-qty-val");
        if (inp2 && v) inp2.value = v.textContent.trim();
      });
    }

    function start() {
      waitForElement('form[action*="/cart/add"] button, .product-item', function () {
        init();
        liveEvents();
      }, 50, 15000);
    }

    waitForElement("body", start, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in EG-HWP-QTY-01");
  }
})();

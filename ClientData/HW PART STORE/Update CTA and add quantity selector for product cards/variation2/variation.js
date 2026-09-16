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

    function init() {
      document.body.classList.add("EG-HWP-LEARN-02");
      // find ATC buttons and convert to Learn more -> PDP
      var btns = document.querySelectorAll('form[action*="/cart/add"] button[data-action="add-to-cart"], form[action*="/cart/add"] button, .product-item button');
      var targets = [];
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].textContent.trim().toLowerCase().indexOf("add to cart") !== -1) targets.push(btns[i]);
      }
      if (!targets.length) {
        var all = document.querySelectorAll("button");
        for (var k = 0; k < all.length; k++) if (all[k].textContent.trim().toLowerCase().indexOf("add to cart") !== -1) targets.push(all[k]);
      }

      for (var b = 0; b < targets.length; b++) {
        var btn = targets[b];
        if (btn.dataset.egLearn) continue;
        btn.dataset.egLearn = "1";
        btn.textContent = "Learn more";
        btn.classList.add("eg-learn-more");
        // remove form submit behavior if inside form
        btn.type = "button";
        btn.removeAttribute("name");
      }
    }

    function liveEvents() {
      if (document.body.dataset.egLearnLive) return;
      document.body.dataset.egLearnLive = "1";
      document.addEventListener("click", function (e) {
        var learn = e.target.closest(".eg-learn-more");
        if (!learn) return;
        e.preventDefault();
        e.stopPropagation();
        var card = learn.closest(".product-item, .product-list__item, .grid__item, li, .ProductItem, form") || learn.parentElement;
        // try image wrapper link first as requested
        var imgLink = null;
        if (card) {
          imgLink = card.querySelector(".product-item__image-wrapper a");
          if (!imgLink) imgLink = card.querySelector(".product-item__image-wrapper");
          if (!imgLink || !imgLink.getAttribute("href")) {
            // fallback to any product link in card
            var links = card.querySelectorAll('a[href*="/products/"]');
            for (var l = 0; l < links.length; l++) {
              if (links[l].getAttribute("href")) { imgLink = links[l]; break; }
            }
          }
          // if card itself is inside form, also search sibling product-item
          if (!imgLink) {
            var outer = learn.closest(".product-item");
            if (outer) {
              imgLink = outer.querySelector(".product-item__image-wrapper a") || outer.querySelector('a[href*="/products/"]');
            }
          }
        }
        if (imgLink && imgLink.getAttribute("href")) {
          // trigger navigation via image link
          var href = imgLink.getAttribute("href");
          // if imgLink is not <a> but wrapper div, find its <a>
          if (imgLink.tagName.toLowerCase() !== "a") {
            var aInside = imgLink.querySelector("a");
            if (aInside && aInside.getAttribute("href")) href = aInside.getAttribute("href");
            else if (imgLink.closest("a")) href = imgLink.closest("a").getAttribute("href");
          }
          if (href) window.location.href = href;
          else imgLink.click();
        } else {
          // fallback: click the product title link
          var fallback = card ? card.querySelector('a[href*="/products/"]') : null;
          if (fallback) fallback.click();
        }
      });
    }

    function start() {
      waitForElement('form[action*="/cart/add"] button, .product-item, .product-item__image-wrapper', function () {
        init();
        liveEvents();
      }, 50, 15000);
      // re-run on ajax
      var obs = new MutationObserver(function () {
        if (document.querySelector('button') && !document.querySelector('.eg-learn-more')) init();
      });
      waitForElement("body", function () {
        obs.observe(document.body, { childList: true, subtree: true });
      }, 50, 15000);
    }

    waitForElement("body", start, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in EG-HWP-LEARN-02");
  }
})();

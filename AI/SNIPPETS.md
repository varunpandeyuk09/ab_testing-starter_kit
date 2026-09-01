# Snippets & Functions — Reusable Code

Copy-paste ready. Patterns reference these. Keep to 7 core — rest in Appendix.

---

## 1. waitForElement

Polls for selector, triggers once, self-clears. (97% of tests)

```js
function waitForElement(selector, trigger, delayInterval, delayTimeout) {
  var interval = setInterval(function () {
    if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
      clearInterval(interval);
      trigger();
    }
  }, delayInterval);
  setTimeout(function () { clearInterval(interval); }, delayTimeout);
}

// Usage — always on ANCHOR, not parent
waitForElement('.stable-anchor', init, 50, 15000);
```

---

## 2. live (delegated events)

Event delegation for static + dynamic elements. Use instead of `addEventListener`. (28% of tests)

```js
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

// Usage
live('.btn', 'click', function () { /* this = matched element */ });
```

---

## 3. listener (SPA routing)

Fires `locationchange` on pushState/replaceState/popstate. (9.8% of tests)

```js
function listener() {
  window.addEventListener("locationchange", function () {
    // re-run init for new route
  });
  history.pushState = ((f) =>
    function pushState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event("pushstate"));
      window.dispatchEvent(new Event("locationchange"));
      return ret;
    })(history.pushState);
  history.replaceState = ((f) =>
    function replaceState() {
      var ret = f.apply(this, arguments);
      window.dispatchEvent(new Event("replacestate"));
      window.dispatchEvent(new Event("locationchange"));
      return ret;
    })(history.replaceState);
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("locationchange"));
  });
}
listener();
```

---

## 4. Cookies

```js
function getCookie(name) {
  var v = null;
  document.cookie.split(';').forEach(function (c) {
    var m = c.trim().match(name + '=([^;]+)');
    if (m) v = decodeURIComponent(m[1]);
  });
  return v;
}

function setCookie(name, val, days) {
  var d = new Date();
  d.setTime(d.getTime() + (days || 30) * 86400000);
  document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
}
```

---

## 5. Init Guard (Idempotent + Body Class)

Canonical 3-line guard — 65% duplicate guard + 85% body class use this.

```js
function init() {
  document.body.classList.add('EG-TEST-ID');
  if (document.querySelector('.eg-hero-section')) return; // idempotent
  var anchor = document.querySelector('.stable-anchor');
  if (!anchor) return;
  anchor.insertAdjacentHTML('afterend', '<div class="eg-hero-section">...</div>');
}
```

---

## 6. loadExternalLib (Slick/JQuery CDN)

Real pattern: dual CSS + JS + Slick poll. (21% CDN inject)

```js
function loadSlick(cb) {
  if (document.querySelector('.eg-slick-loaded')) return;
  var g = document.createElement('div'); g.className = 'eg-slick-loaded'; document.head.appendChild(g);
  var l1 = document.createElement('link'); l1.rel = 'stylesheet'; l1.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.css'; document.head.appendChild(l1);
  var l2 = document.createElement('link'); l2.rel = 'stylesheet'; l2.href = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.min.css'; document.head.appendChild(l2);
  var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.min.js'; s.onload = cb; document.head.appendChild(s);
}
function waitForSlick(cb){ var i=setInterval(function(){ if(window.jQuery && jQuery.fn.slick){ clearInterval(i); cb(); }},50); setTimeout(function(){clearInterval(i)},15000); }
// Usage: loadSlick(function(){ waitForSlick(initSlick); });
```

---

## 7. XHR Hook + Price Parse (Cart Re-apply)

Re-apply after AJAX cart update. (4.6% Cart)

```js
function hookCartReapply(reApply){
  var orig = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function(){
    this.addEventListener('load', function(){
      if (this.responseURL && this.responseURL.includes('Cart-UpdateQuantity')) reApply();
    });
    return orig.apply(this, arguments);
  };
}
function parsePrice(el){ return parseFloat(el.innerText.replace(/[^0-9.]/g,'')); }
```

---

## Appendix — Archived (rare, 0-1.5% hit — keep for AWG only)

Shopware: `fetchPdpBlocks`, `sanitizeBuyBox`, `syncBuyState`, `updateVariantUi`, `getSwitchQuery`, `swapModalMedia`, `pinTnsTransform`, `getNoSizeValue`, `getSizeGroupId`, `getFarbeGroupId` — see `ab-test/AWG-MODE/AB044`.
Others: `sameUrl` (0%), `sessionStorage slug helpers` (0%), `deviceAware matchMedia` (0.07% — use P12 inline width), `waitForLibrary` generic (0.9% vs waitForSlick 4.9%), `loadExternalLib` tiny-slider generic.

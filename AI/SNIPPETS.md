# Snippets & Functions — Reusable Code

Copy-paste ready. Patterns reference these.

---

## 1. waitForElement

Polls for selector, triggers once, self-clears.

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

// Usage
waitForElement('.target', init, 50, 15000);
```

---

## 2. live (delegated events)

Event delegation for static + dynamic elements. Use instead of `addEventListener`.

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

Fires `locationchange` on pushState/replaceState/popstate.

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

## 5. waitForLibrary

Polls for a library global before calling back.

```js
function waitForLibrary(globalName, callback, interval, timeout) {
  var i = setInterval(function () {
    if (window[globalName]) { clearInterval(i); callback(); }
  }, interval || 50);
  setTimeout(function () { clearInterval(i); }, timeout || 15000);
}

// Usage
waitForLibrary('jQuery', function () { /* $ is ready */ });
waitForLibrary('tns', function () { /* tiny-slider ready */ });
```

---

## 6. sameUrl

Loose URL equality (ignore protocol, trailing slash, query, fragment).

```js
function sameUrl(a, b) {
  if (!a || !b) return false;
  var na = a.split('#')[0].split('?')[0].replace(/\/+$/, '').replace(/^https?:\/\//i, '').toLowerCase();
  var nb = b.split('#')[0].split('?')[0].replace(/\/+$/, '').replace(/^https?:\/\//i, '').toLowerCase();
  return na === nb;
}
```

---

## 7. fetchPdpBlocks

Fetch PDP page, extract key blocks for cloning.

```js
function fetchPdpBlocks(url) {
  return fetch(url, { credentials: 'same-origin' })
    .then(function (r) { return r.text(); })
    .then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      return {
        buy: doc.querySelector('.product-detail-buy'),
        media: doc.querySelector('.product-detail-media'),
        title: doc.querySelector('.product-detail-name')
      };
    })
    .catch(function () { return null; });
}
```

---

## 8. sanitizeBuyBox

Strip theme plugin hooks from cloned buy box.

```js
function sanitizeBuyBox(buy) {
  if (!buy) return;
  buy.removeAttribute('data-buy-box');
  var buyForm = buy.querySelector('#productDetailPageBuyProductForm');
  if (buyForm) buyForm.removeAttribute('data-add-to-cart');
  var switchForm = buy.querySelector('#variantSwitchForm');
  if (switchForm) {
    switchForm.removeAttribute('data-custom-switch');
    switchForm.removeAttribute('data-variant-switch-options');
    switchForm.removeAttribute('data-variant-external-element');
  }
}
```

---

## 9. syncBuyState

Enable/disable ATC button based on real size selection.

```js
function syncBuyState(modal) {
  var buy = modal.querySelector('.product-detail-buy');
  if (!buy) return;
  var btn = buy.querySelector('.btn-buy');
  if (!btn) return;
  var sizeGroupId = getSizeGroupId(modal);
  var noSizeValue = getNoSizeValue(modal);
  var radios = modal.querySelectorAll('input[type="radio"]');
  var realOptions = 0;
  var realChecked = null;
  for (var i = 0; i < radios.length; i++) {
    var r = radios[i];
    if (r.getAttribute('name') !== sizeGroupId) continue;
    if (r.value === noSizeValue) continue;
    if (r.disabled) continue;
    realOptions++;
    if (r.checked) realChecked = r;
  }
  if (realOptions === 0) return;
  var alert = buy.querySelector('.size-info-wrapper');
  if (realChecked && !modal.__egNeedSwitch) {
    btn.disabled = false;
    if (alert) alert.style.display = 'none';
  } else {
    btn.disabled = true;
    if (alert) alert.style.display = '';
  }
}
```

---

## 10. updateVariantUi

Mirror `.active` highlight across duplicated size groups.

```js
function updateVariantUi(modal, radio) {
  var name = radio.getAttribute('name') || '';
  if (!name) return;
  var all = modal.querySelectorAll('input[type="radio"][name="' + name + '"]');
  for (var i = 0; i < all.length; i++) {
    var option = all[i].closest('.product-detail-configurator-option');
    var label = option && option.querySelector('.product-detail-configurator-option-label');
    if (!label) continue;
    if (all[i].checked) label.classList.add('active');
    else label.classList.remove('active');
  }
}
```

---

## 11. getSwitchQuery

Build variant switch query exactly like theme does.

```js
function getSwitchQuery(modal, switchedGroup, forcedValue) {
  var options = {};
  var radios = modal.querySelectorAll('input[type="radio"]:checked');
  for (var i = 0; i < radios.length; i++) {
    var name = radios[i].getAttribute('name') || '';
    var value = radios[i].value || '';
    if (!name || !value) continue;
    if (options[name] !== undefined) continue;
    options[name] = value;
  }
  if (switchedGroup && forcedValue) options[switchedGroup] = forcedValue;
  if (Object.keys(options).length === 0) return '';
  var q = 'options=' + encodeURIComponent(JSON.stringify(options));
  if (switchedGroup) q += '&switched=' + encodeURIComponent(switchedGroup);
  return q;
}
```

---

## 12. swapModalMedia

Swap gallery images on color swatch click.

```js
function swapModalMedia(modal, optImg) {
  if (!modal || !optImg) return;
  var src = optImg.src || '';
  if (!src) return;
  var srcset = optImg.srcset || '';
  var alt = optImg.alt || '';
  var title = optImg.title || '';
  var media = modal.querySelector('.eg-quickview-modal__media');
  if (!media) return;
  var main = media.querySelector('.gallery-slider-container .gallery-slider-image');
  if (main) {
    main.src = src;
    if (srcset) main.srcset = srcset; else main.removeAttribute('srcset');
    if (alt) main.alt = alt;
    if (title) main.title = title;
  }
  var thumb = media.querySelector('.gallery-slider-thumbnails-image');
  if (thumb) {
    thumb.src = src;
    if (srcset) thumb.srcset = srcset; else thumb.removeAttribute('srcset');
    if (alt) thumb.alt = alt;
    if (title) thumb.title = title;
  }
}
```

---

## 13. pinTnsTransform

Re-assert tns inline transform as `!important` to beat theme CSS.

```js
function pinTnsTransform(modal) {
  var tracks = modal.querySelectorAll('.tns-slider');
  for (var i = 0; i < tracks.length; i++) {
    var track = tracks[i];
    var t = track.style.transform || '';
    if (t) { try { track.style.setProperty('transform', t, 'important'); } catch (e) {} }
    var tr = track.style.transition || '';
    if (tr) { try { track.style.setProperty('transition', tr, 'important'); } catch (e) {} }
  }
}

function watchTnsTransform(modal) {
  if (modal.__egTnsWatcher) return modal.__egTnsWatcher;
  var apply = function () { pinTnsTransform(modal); };
  apply();
  var mo = new MutationObserver(apply);
  mo.observe(modal, { attributes: true, attributeFilter: ['class', 'style'], subtree: true });
  modal.__egTnsWatcher = mo;
  setTimeout(apply, 150);
  setTimeout(apply, 500);
  return mo;
}
```

---

## 14. loadExternalLib

Load external library on-demand with duplicate guard.

```js
function loadExternalLib(cssUrl, jsUrl, callback) {
  if (document.querySelector('.eg-lib-loaded')) return;
  var guard = document.createElement('div');
  guard.className = 'eg-lib-loaded';
  document.head.appendChild(guard);
  if (cssUrl) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssUrl;
    document.head.appendChild(link);
  }
  var script = document.createElement('script');
  script.src = jsUrl;
  script.onload = callback;
  document.head.appendChild(script);
}
```

---

## 15. sessionStorage helpers

Simple flag for popup tracking.

```js
function getProductSlug(url) {
  if (!url) return '';
  var parts = url.split('/');
  return parts[parts.length - 1].split('?')[0].split('#')[0];
}

function markShown(key, url) {
  var slug = getProductSlug(url);
  if (!slug) return;
  sessionStorage.setItem(key, slug);
}

function isShown(key, url) {
  var slug = getProductSlug(url);
  return sessionStorage.getItem(key) === slug;
}
```

---

## 16. matchMedia helper

Device-aware class toggle.

```js
function deviceAware() {
  var mq = window.matchMedia('(min-width: 992px)');
  function apply() { document.body.classList.toggle('eg-desktop', mq.matches); }
  apply();
  mq.addEventListener('change', apply);
}
```

---

## 17. XHR hook

Re-apply changes after AJAX content loads.

```js
function hookXHR(callback) {
  var origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', function () { callback(this); });
    return origSend.apply(this, arguments);
  };
}
```

---

## 18. getNoSizeValue / getSizeGroupId

Shopware 6 variant helpers.

```js
function getSizeGroupId(modal) {
  var form = modal.querySelector('#variantSwitchForm');
  var replace = form && form.getAttribute('data-variant-group-replace');
  if (replace) return replace;
  var group = modal.querySelector('.product-detail-configurator-group-size');
  var first = group && group.querySelector('input[type="radio"]');
  return first ? first.getAttribute('name') : '';
}

function getNoSizeValue(modal) {
  var form = modal.querySelector('#variantSwitchForm');
  var replace = form && form.getAttribute('data-variant-value-replace');
  if (replace) return replace;
  var radio = modal.querySelector('#variantSwitchForm input[type="radio"][aria-labelledby="noSize"]');
  return radio ? radio.value : '';
}

function getFarbeGroupId(modal) {
  var form = modal.querySelector('#variantSwitchForm');
  var g = form && form.getAttribute('data-variant-group-ignore');
  if (g) return g;
  var sizeId = getSizeGroupId(modal);
  var imgs = modal.querySelectorAll('.product-detail-configurator-option-image');
  for (var i = 0; i < imgs.length; i++) {
    var opt = imgs[i].closest('.product-detail-configurator-option');
    var radio = opt && opt.querySelector('input[type="radio"]');
    if (!radio) continue;
    var name = radio.getAttribute('name');
    if (name && name !== sizeId) return name;
  }
  return '';
}
```

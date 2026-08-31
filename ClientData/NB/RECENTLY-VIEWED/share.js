(function () {
  var KEY = 'egrecentlyviewed';
  var MAX = 20;
  var DAYS = 30;

  function getCookie(name) {
    var v = null;
    document.cookie.split(';').forEach(function (c) {
      var m = c.trim().match(name + '=([^;]*)');
      if (m) v = decodeURIComponent(m[1]);
    });
    return v;
  }

  function setCookie(name, val, days) {
    var d = new Date();
    d.setTime(d.getTime() + (days || 30) * 86400000);
    document.cookie = name + '=' + encodeURIComponent(val) + ';expires=' + d.toUTCString() + ';path=/';
  }

  function getProducts() {
    var raw = getCookie(KEY);
    if (!raw) return [];
    return raw.split(',').filter(function (id) { return id !== ''; });
  }

  function saveProducts(arr) {
    if (arr.length > MAX) arr.length = MAX;
    setCookie(KEY, arr.join(','), DAYS);
  }

  function trackProduct(pid) {
    if (!pid) return;
    var arr = getProducts();
    for (var i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === pid) arr.splice(i, 1);
    }
    arr.unshift(pid);
    saveProducts(arr);
  }

  // PDP page pe product track karo
  var loc = window.location.href || '';
  if (loc.indexOf('/pd/') > -1) {
    var el = document.querySelector('[data-pid]');
    if (el) {
      var pid = el.getAttribute('data-pid');
      if (pid) trackProduct(pid);
    }
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

  live('.eg-rv-card', 'click', function () {
    var pid = this.getAttribute('data-pid');
    if (pid && window.utag) {
      window.utag.track({
        te: {
          event_name: 'product_click',
          product_id: pid,
          location: 'recently_viewed_carousel'
        }
      });
    }
  });
})();

(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ALTIUM-TS2523';

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
      live('.eg-faq__header', 'click', function () {
        console.log('EG-ALTIUM-TS2523: FAQ clicked — ' + (this.textContent.trim().slice(0, 40)));
      });
    }

    waitForElement('html body', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();

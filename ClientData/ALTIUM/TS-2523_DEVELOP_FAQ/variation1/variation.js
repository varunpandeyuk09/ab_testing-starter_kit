/*
 * ============================================================
 * ST | FY26Q2 | TS-2523 | Altium | Platform Solutions: Develop - Re-Add FAQ
 * Body : .EG-ALTIUM-TS2523
 * URL  : https://www.altium.com/develop
 * ANCHOR: html body .region-footer (insert beforebegin)
 * PATTERN: P2 Insert Section + P21 Accordion
 * ============================================================
 */
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

    function insertFaq() {
      if (document.querySelector('.eg-faq-section')) return;
      var footer = document.querySelector('html body .region-footer');
      if (!footer) footer = document.querySelector('.region-footer');
      if (!footer) return;

      var section = document.createElement('section');
      section.className = 'eg-faq-section';
      section.innerHTML =
        '<div class="eg-faq__inner">' +
        '  <h2 class="eg-faq__title">Frequently Asked Questions</h2>' +
        '  <div class="eg-faq__list">' +
        // 1 - open by default
        '    <div class="eg-faq__item eg-faq__item--open">' +
        '      <button class="eg-faq__header" aria-expanded="true"><span>What is Altium Develop?</span><span class="eg-faq__icon"></span></button>' +
        '      <div class="eg-faq__content"><div class="eg-faq__content-inner"><p>Altium Develop is an easy-to-start, easy-to-use, and easy-to-collaborate platform built for individual engineers and small teams who want professional-grade PCB design without enterprise overhead.</p><p>It includes the full Altium Designer ECAD environment and the Altium 365 cloud platform, along with integrated cloud applications for sourcing intelligence, MCAD collaboration, and lightweight requirements management — all optimized for speed, autonomy, and simplicity.</p></div></div>' +
        '    </div>' +
        '    <div class="eg-faq__item">' +
        '      <button class="eg-faq__header" aria-expanded="false"><span>Who is Altium Develop for?</span><span class="eg-faq__icon"></span></button>' +
        '      <div class="eg-faq__content"><div class="eg-faq__content-inner"><p>Altium Develop is built for individual engineers, freelancers and small teams that need professional PCB design capabilities without enterprise complexity or cost.</p></div></div>' +
        '    </div>' +
        '    <div class="eg-faq__item">' +
        '      <button class="eg-faq__header" aria-expanded="false"><span>Why would my team use Altium Develop?</span><span class="eg-faq__icon"></span></button>' +
        '      <div class="eg-faq__content"><div class="eg-faq__content-inner"><p>Teams use Altium Develop to collaborate in real time, manage sourcing and MCAD data in one place, and accelerate the design cycle while keeping full control over their workflow.</p></div></div>' +
        '    </div>' +
        '    <div class="eg-faq__item">' +
        '      <button class="eg-faq__header" aria-expanded="false"><span>How much does Altium Develop cost?</span><span class="eg-faq__icon"></span></button>' +
        '      <div class="eg-faq__content"><div class="eg-faq__content-inner"><p>Pricing is available on the Altium Develop pricing page and scales by team size. All plans include Altium Designer and Altium 365 with cloud collaboration features.</p></div></div>' +
        '    </div>' +
        '    <div class="eg-faq__item">' +
        '      <button class="eg-faq__header" aria-expanded="false"><span>How do we get started with Altium Develop?</span><span class="eg-faq__icon"></span></button>' +
        '      <div class="eg-faq__content"><div class="eg-faq__content-inner"><p>Click Get Started, create your Altium account and download Altium Designer. You can start with a trial and invite collaborators via Altium 365.</p></div></div>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      footer.insertAdjacentElement('beforebegin', section);

      // accordion toggle - single open at a time (optional, remove loop if multi-open needed)
      live('.eg-faq__header', 'click', function () {
        var item = this.closest('.eg-faq__item');
        if (!item) return;
        var isOpen = item.classList.contains('eg-faq__item--open');
        // close others
        var all = document.querySelectorAll('.eg-faq__item');
        for (var i = 0; i < all.length; i++) {
          all[i].classList.remove('eg-faq__item--open');
          var h = all[i].querySelector('.eg-faq__header');
          if (h) h.setAttribute('aria-expanded', 'false');
        }
        if (!isOpen) {
          item.classList.add('eg-faq__item--open');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    }

    function init() {
      document.body.classList.add('EG-ALTIUM-TS2523');
      insertFaq();
    }

    waitForElement('html body .region-footer', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

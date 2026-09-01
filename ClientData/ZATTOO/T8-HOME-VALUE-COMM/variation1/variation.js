/*
 * ============================================================
 * T8: Home - Add Better Value Communication – All Devices
 * Client : ZATTOO
 * Body   : .EG-ZATTOO-T8
 * URL    : https://www.zattoo.com/de
 * Pattern: P2 Insert Section (after Trust)
 * ============================================================
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ZATTOO-T8';
    // CHANGE THIS URL LATER - placeholder collage bg
    var COLLAGE_BG = 'https://via.placeholder.com/800x600/0a0a0a/ffffff?text=Collage+Placeholder';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function insertValueSection() {
      if (document.querySelector('.eg-value-section')) return;
      var trust = document.querySelector('[id="root"]>section>div>section:nth-child(7)');
      if (!trust) return;

      var section = document.createElement('section');
      section.className = 'eg-value-section';
      section.innerHTML =
        '<div class="eg-value__inner">' +
        '  <div class="eg-value__left">' +
        '    <h2 class="eg-value__title">Streamen ohne Grenzen</h2>' +
        '    <p class="eg-value__sub">Teste jetzt unser Ultimate-Programm kostenfrei.<br>Du kannst jederzeit downgraden, k\u00fcndigen oder auch kostenfrei mit Werbung weiter streamen.</p>' +
        '    <ul class="eg-value__list">' +
        '      <li><span class="eg-value__tick">\u2713</span> Mehr als 200 Sender \u00fcberall dabei</li>' +
        '      <li><span class="eg-value__tick">\u2713</span> Ein Account f\u00fcr alle deine Ger\u00e4te</li>' +
        '      <li><span class="eg-value__tick">\u2713</span> Jetzt sofort kabellos streamen</li>' +
        '      <li><span class="eg-value__tick">\u2713</span> Jederzeit einfach k\u00fcndigen</li>' +
        '    </ul>' +
        '    <div class="eg-value__ctas">' +
        '      <a class="eg-value__cta eg-value__cta--primary" href="#">Jetzt kostenfrei starten</a>' +
        '      <a class="eg-value__cta eg-value__cta--secondary" href="#">Alle Pakete ansehen</a>' +
        '    </div>' +
        '  </div>' +
        '  <div class="eg-value__right" style="background-image:url(\'' + COLLAGE_BG + '\')"></div>' +
        '</div>';

      // robust insert after trust
      if (trust.insertAdjacentElement) {
        trust.insertAdjacentElement('afterend', section);
      } else if (trust.parentNode) {
        trust.parentNode.insertBefore(section, trust.nextSibling);
      }
    }

    function init() {
      document.body.classList.add('EG-ZATTOO-T8');
      insertValueSection();
    }

    waitForElement('[id="root"]>section>div>section:nth-child(7)', init, 500, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

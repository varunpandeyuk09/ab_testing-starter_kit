/*
 * ============================================================
 * ST | FY26Q2 | TS-2534 | Altium | Homepage: Page-bottom CTA
 * "final bite at the apple" with Choose Product (tabbed)
 * Body : .EG-ALTIUM-TS2534
 * URL  : https://www.altium.com/
 * ANCHOR: html body .region-footer (insert before)
 * PATTERN: P2 Insert Section
 * ============================================================
 */


(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ALTIUM-TS2534';

    var svgs = {
      "starCheck": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8822 10.4172L18.1989 8.16134C8.2582 8.10384 18.3001 8.03087 18.32 7.95072C18.3399 7.87058 18.3369 7.78646 18.3114 7.70793C18.2859 7.62939 18.2388 7.55958 18.1757 7.50642C18.1125 7.45326 18.0356 7.41888 17.9539 7.40718L13.6489 6.77801C13.3651 6.73803 13.0955 6.62897 12.8638 6.46042C12.632 6.29187 12.4452 6.06898 12.3197 5.81134L10.3947 1.91134C10.3581 1.8376 10.3017 1.77555 10.2317 1.7322C10.1617 1.68885 10.081 1.66593 9.98864 1.66602C9.91631 1.6661 9.83565 1.6892 9.76575 1.73268C9.69585 1.76619 9.6395 1.83836 9.60306 1.91218L7.6789 5.81134C7.55327 6.0692 7.3662 6.29222 7.13413 6.46078C6.90206 6.62934 6.63212 6.73828 6.34806 6.77801L2.04390 7.40718C1.96198 7.41876 1.88497 7.45311 1.82163 7.50630C1.75828 7.55955 1.71116 7.62948 1.68563 7.70817C1.66009 7.78686 1.65717 7.87114 1.6772 7.95141C1.69722 8.03167 1.73939 8.1047 1.7989 8.16218L4.91223 11.193C5.11905 11.3922 5.27368 11.6392 5.36247 11.9123C5.45127 12.1854 5.4715 12.4761 5.4214 12.7588L4.68806 17.0413C4.67389 17.1227 4.68278 17.2063 4.71373 17.2828C4.74469 17.3593 4.79645 17.4256 4.86317 17.4742C4.92989 17.5228 5.00889 17.5517 5.09120 17.5577C5.17352 17.5637 5.25586 17.5465 5.32890 17.508L9.17639 15.4847L9.1989 15.473" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 14.9997L14.1667 16.6663L17.5 13.333" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };

    function svgIcon(name) {
      return svgs[name] || '';
    }

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function buildSection() {
      if (document.querySelector('.eg-final-bite-section')) return;

      var anchor = document.querySelector('html body .region-footer');
      if (!anchor) return;

      var section = document.createElement('div');
      section.className = 'eg-final-bite-section';
      section.innerHTML = `
        <div class="eg-final-bite-card">
          <h2 class="eg-final-bite-title">Design Better Electronics Faster—From Day One.</h2>
          <p class="eg-final-bite-subtitle">Everything you need to design, test, and build your next big project—all in one place.</p>
          <a href="#solutions" class="eg-final-bite-cta" data-scroll-to="#solutions">Compare Platform Solutions</a>
          <div class="eg-final-bite-trust">
            ${svgIcon('starCheck')}
            <span>Rated 4.9/5 by industry engineers.</span>
          </div>
        </div>
      `;

      anchor.parentNode.insertBefore(section, anchor);
    }

    function init() {
      document.body.classList.add('EG-ALTIUM-TS2534');
      buildSection();
    }

    waitForElement('html body .region-footer', init, 100, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

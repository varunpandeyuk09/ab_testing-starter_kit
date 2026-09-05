/*
 * ============================================================
 * 1.11 | LP | Home Page Redesign Desktop
 * Body : .EG-LP-1_11
 * URL  : https://www.lepinefunerals.com.au/
 * ANCHOR: .jw-hero-homepage (afterend 3 cards) — Desktop only
 * PATTERN: P2 Insert + P10 Hero CTA + P12 Viewport gate
 * ============================================================
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-LP-1_11';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function isDesktop() {
      return window.innerWidth >= 992;
    }

    function updateHeroCtas() {
      var hero = document.querySelector('.jw-hero-homepage');
      if (!hero) return;
      var ctas = hero.querySelectorAll('a');
      for (var i = 0; i < ctas.length; i++) {
        var t = ctas[i].textContent.trim().toLowerCase();
        if (t.indexOf('plan a funeral') > -1 && t.indexOf('now') === -1) {
          ctas[i].setAttribute('href', 'https://www.lepinefunerals.com.au/pricing/');
        }
        if (t.indexOf('contact us') > -1) {
          ctas[i].setAttribute('href', 'https://www.lepinefunerals.com.au/funerals/upcoming-funerals/');
        }
      }
    }

    function enhanceHero() {
      var hero = document.querySelector('.jw-hero-homepage');
      if (!hero) return;
      var h1 = hero.querySelector('h1');
      if (h1 && !hero.querySelector('.eg-hero-tag')) {
        var tag = document.createElement('div');
        tag.className = 'eg-hero-tag';
        tag.innerHTML = '<span class="eg-hero-tag__avatars">\uD83D\uDC65</span><span class="eg-hero-tag__dot"></span> Helping over 8,000 families each year';
        h1.insertAdjacentElement('beforebegin', tag);
      }
      if (!hero.querySelector('.eg-hero-usps')) {
        var usps = document.createElement('div');
        usps.className = 'eg-hero-usps';
        usps.innerHTML = '<span><i class="eg-usp-icon">\u2713</i> Experience, local funeral directors</span><span><i class="eg-usp-icon">\u2713</i> Personalised unique farewells</span><span><i class="eg-usp-icon">\u2713</i> Simple process with transparent pricing</span>';
        var ctaRow = hero.querySelector('a') ? hero.querySelector('a').parentElement : null;
        if (ctaRow) ctaRow.insertAdjacentElement('afterend', usps);
        else hero.appendChild(usps);
      }
      if (!hero.querySelector('.eg-hero-reviews')) {
        var rev = document.createElement('div');
        rev.className = 'eg-hero-reviews';
        rev.innerHTML = '<span class="eg-hero-reviews__badge">G</span><span class="eg-hero-reviews__score">5.0</span> \u2605 from 1000+ Google reviews';
        hero.appendChild(rev);
      }
    }

    function insertCards() {
      if (document.querySelector('.eg-hero-cards')) return;
      var hero = document.querySelector('.jw-hero-homepage');
      if (!hero) return;
      var section = document.createElement('section');
      section.className = 'eg-hero-cards';
      section.innerHTML =
        '<div class="eg-hero-cards__inner">' +
        '  <div class="eg-card">' +
        '    <div class="eg-card__icon">\u26B0</div>' +
        '    <h3 class="eg-card__title">Plan A Funeral Now</h3>' +
        '    <p class="eg-card__copy">We know this process well and we\'ll be right beside you as you move through it, with our experienced funeral specialists will support you every step of the way.</p>' +
        '    <a class="eg-card__cta" href="https://www.lepinefunerals.com.au/funerals/plan-a-funeral/">Explore funeral planning</a>' +
        '  </div>' +
        '  <div class="eg-card">' +
        '    <div class="eg-card__icon">\u2637</div>' +
        '    <h3 class="eg-card__title">Pre-plan A Funeral</h3>' +
        '    <p class="eg-card__copy">Put arrangements in place ahead of time with guidance from our experienced specialists.</p>' +
        '    <a class="eg-card__cta" href="https://www.lepinefunerals.com.au/funerals/pre-plan-a-funeral-now/">Get started with Le Pine</a>' +
        '  </div>' +
        '  <div class="eg-card">' +
        '    <div class="eg-card__icon">\u24B6</div>' +
        '    <h3 class="eg-card__title">Explore Pricing</h3>' +
        '    <p class="eg-card__copy">We understand every farewell is unique, we have a range of pricing options that can be shaped around what\'s right for your and your family.</p>' +
        '    <a class="eg-card__cta" href="https://www.lepinefunerals.com.au/pricing/">Find pricing at my location</a>' +
        '  </div>' +
        '</div>';
      hero.insertAdjacentElement('afterend', section);
    }

    function init() {
      if (!isDesktop()) return;
      document.body.classList.add('EG-LP-1_11');
      updateHeroCtas();
      enhanceHero();
      insertCards();
    }

    waitForElement('.jw-hero-homepage', init, 150, 15000);
    window.addEventListener('resize', function () { setTimeout(init, 200); });
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

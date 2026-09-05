/*
 * ============================================================
 * DEKRA | TRUST_SECTION | Trust Cards Section
 * Body : .EG-DEKRA-TRUST
 * URL  : *.dekra-akademie.de/produkte/*
 * ANCHOR: [aria-label="Product Title and Attributes"] h1
 * PATTERN: P2 Insert + P10 Text
 * ============================================================
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-DEKRA-TRUST';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function getCategory() {
      var tiles = document.querySelectorAll('.seminar-teaser .clickable-tile');
      var total = tiles.length;
      var matched = 0;

      for (var i = 0; i < tiles.length; i++) {
        var spans = tiles[i].querySelectorAll('span');
        for (var j = 0; j < spans.length; j++) {
          if (spans[j].textContent.trim() === '100% gefördert') {
            matched++;
            break;
          }
        }
      }

      if (total === 0) return 'FK';
      if (matched === total) return 'ÖG';
      if (matched === 0) return 'FK';
      return 'MIXED';
    }

    function buildTrustHTML(category) {
      var sections = {
        'MIXED': {
          title: 'Mixed',
          cards: [
            { icon: 'graduation', value: '100.000+', desc: 'erfolgreiche Absolventen jährlich' },
            { icon: 'clock', value: 'Flexibel', desc: 'lernen - vor Ort, online oder hybrid' },
            { icon: 'id', value: 'Anerkannt', desc: 'staatlich anerkannte Qualifikation' }
          ]
        },
        'ÖG': {
          title: 'ÖG',
          cards: [
            { icon: 'graduation', value: '100.000+', desc: 'erfolgreiche Absolventen jährlich' },
            { icon: 'star', value: 'AZAV', desc: 'zertifizierter Bildungspartner' },
            { icon: 'user', value: '100 %', desc: 'förderfähige Schulungen möglich' }
          ]
        },
        'FK': {
          title: 'FK',
          cards: [
            { icon: 'graduation', value: '100.000+', desc: 'erfolgreiche Absolventen jährlich' },
            { icon: 'pin', value: '150+', desc: 'Standorte bundesweit' },
            { icon: 'check', value: 'Rechtssicher', desc: 'Weiterbildung nach BKfQG' }
          ]
        }
      };

      var icons = {
        'graduation': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/></svg>',
        'clock': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
        'id': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="12" y2="13"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
        'user': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        'pin': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
        'check': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      };

      var data = sections[category];
      var cardsHTML = '';

      for (var i = 0; i < data.cards.length; i++) {
        var card = data.cards[i];
        cardsHTML += '<div class="eg-trust-card">' +
          '<div class="eg-trust-card-icon">' + icons[card.icon] + '</div>' +
          '<div class="eg-trust-card-content">' +
            '<div class="eg-trust-card-value">' + card.value + '</div>' +
            '<div class="eg-trust-card-desc">' + card.desc + '</div>' +
          '</div>' +
        '</div>';
      }

      return '<div class="eg-trust-section">' +
        '<h2 class="eg-trust-section-title">' + data.title + '</h2>' +
        '<div class="eg-trust-cards-grid">' + cardsHTML + '</div>' +
      '</div>';
    }

    function init() {
      if (document.querySelector('.eg-trust-section')) return;
      document.body.classList.add('EG-DEKRA-TRUST');

      var anchor = document.querySelector('.breadcrumb + div h1');
      if (!anchor) return;

      var category = getCategory();
      var html = buildTrustHTML(category);

      var wrapper = document.createElement('div');
      wrapper.className = 'eg-trust-wrapper';
      wrapper.innerHTML = html;

      anchor.insertAdjacentElement('afterend', wrapper);

      if (debug) console.log(variation_name + ': category=' + category);
    }

    waitForElement('.breadcrumb + div h1', init, 150, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

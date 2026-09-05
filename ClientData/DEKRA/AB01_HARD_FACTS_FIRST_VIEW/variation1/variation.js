/*
 * ============================================================
 * DEKRA | AB01 | Hard Facts in First View
 * Body : .EG-DEKRA-AB01
 * URL  : *.dekra-akademie.de/produkte/*
 * ANCHOR: [aria-label="Product Title and Attributes"] h1
 * PATTERN: P2 Insert + P12 Viewport + P10 Text/Price
 * ============================================================
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-DEKRA-AB01';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function scrapeData() {
      var data = { date: '', location: '', price: '', mwst: '', fundedCount: 0, prerequisites: '' };

      // 1. Location — from meta row (Standorte)
      var metaRow = document.querySelector('[aria-label="Product Title and Attributes"]>div');
      if (metaRow) {
        var pEls = metaRow.querySelectorAll('p');
        for (var j = 0; j < pEls.length; j++) {
          var txt = pEls[j].textContent.trim();
          if (txt.indexOf('Standort') > -1) {
            data.location = txt;
            break;
          }
        }
      }

      // 2. Prerequisites — from accordion (Voraussetzungen/Teilnahmevoraussetzungen)
      var accordionTitles = document.querySelectorAll('.accordion-item-title-text');
      for (var m = 0; m < accordionTitles.length; m++) {
        var titleText = accordionTitles[m].textContent.trim().toLowerCase();
        if (titleText.indexOf('voraussetzungen') > -1) {
          var accordionItem = accordionTitles[m].closest('.accordion-item');
          if (accordionItem) {
            var details = accordionItem.querySelector('.accordion-item-details');
            if (details) {
              data.prerequisites = details.textContent.trim();
            }
          }
          break;
        }
      }

      // 3. Next Date — first .event-item date
      var eventItems = document.querySelectorAll('.event-item');
      if (eventItems.length > 0) {
        var firstEvent = eventItems[0];
        var dateEl = firstEvent.querySelector('.fa-clock');
        if (dateEl && dateEl.parentElement) {
          data.date = dateEl.parentElement.textContent.trim();
        }
        // Price + MwSt
        var priceEl = firstEvent.querySelector('[is-b2b] p');
        if (priceEl) {
          var priceText = priceEl.textContent.trim();
          // Mobile: single <p> with both → "139,00 € MwSt. befreit"
          if (priceText.indexOf('MwSt') > -1 || priceText.indexOf('USt') > -1) {
            var parts = priceText.split('MwSt');
            data.price = parts[0].trim();
            data.mwst = 'MwSt' + parts[1].trim();
          } else {
            data.price = priceText;
          }
        }
        // Desktop: MwSt in separate <p>
        if (!data.mwst) {
          var b2bPs = firstEvent.querySelectorAll('[is-b2b] p');
          for (var i = 0; i < b2bPs.length; i++) {
            if (b2bPs[i].textContent.indexOf('MwSt') > -1 || b2bPs[i].textContent.indexOf('USt') > -1) {
              data.mwst = b2bPs[i].textContent.trim();
              break;
            }
          }
        }
      }

      // 4. Funded badges — count "100% gefördert"
      var allEls = document.querySelectorAll('.event-item span, .event-item div, [class*="badge"]');
      for (var k = 0; k < allEls.length; k++) {
        if (allEls[k].textContent.indexOf('gefördert') > -1 && allEls[k].children.length === 0) {
          data.fundedCount++;
        }
      }
      console.log('Scraped Data:', data);
      return data;
    }

    function buildInfoBox(data) {
      // Left column — Date + Location row
      var dateHtml = data.date
        ? `<div class="eg-info-item">
            <div class="eg-info-icon-box">
              <i class="far fa-calendar-alt"></i>
            </div>
            <div>
              <span class="eg-info-label">NÄCHSTER TERMIN:</span>
              <span class="eg-info-value">${data.date}</span>
            </div>
          </div>`
        : '';

      var locationHtml = data.location
        ? `<div class="eg-info-item">
            <div class="eg-info-icon-box">
              <i class="far fa-map-marker-alt"></i>
            </div>
            <div>
              <span class="eg-info-label">STANDORT:</span>
              <span class="eg-info-value">${data.location}</span>
            </div>
          </div>`
        : '';

      // Left column — Prerequisites
      var prerequisitesHtml = '';
      if (data.prerequisites) {
        var prereqClasses = data.prerequisites.match(/\b(C1E|C1|CE|D1E|D1|C|D|DE)\b/g) || [];
        var badgesHtml = prereqClasses.map(function(cls) {
          var iconClass = cls.indexOf('D') > -1 ? 'fas fa-bus' : 'fas fa-truck';
          return `<span class="eg-prereq-badge"><i class="${iconClass}"></i> ${cls}</span>`;
        }).join('');

        prerequisitesHtml = `<div class="eg-info-prereq">
          <span class="eg-info-label">VORAUSSETZUNGEN:</span>
          <span class="eg-info-prereq-sub">Fahrerlaubnis der Klassen:</span>
          <div class="eg-prereq-badges">${badgesHtml}</div>
        </div>`;
      }

      // Right column — Price (conditional)
      var priceHtml = '';
      if (data.price) {
        priceHtml = `<div class="eg-info-price">
          <span class="eg-price-value">${data.price}</span>
          ${data.mwst ? `<span class="eg-price-mwst">${data.mwst}</span>` : ''}
          ${data.fundedCount > 0 ? `<span class="eg-price-funded">${data.fundedCount}x 100% gefördert</span>` : ''}
        </div>`;
      }

      var boxHtml = `<div class="eg-info-box">
        <div class="eg-info-left">
          <div class="eg-info-row">
            ${dateHtml}
            ${locationHtml}
          </div>
          ${prerequisitesHtml}
        </div>
        <div class="eg-info-right">
          ${priceHtml}
          <div class="eg-info-ctas">
            <a class="eg-cta-primary eg-cta-termin" href="javascript:void(0);">
              <i class="far fa-calendar-alt"></i> Termin wählen <i class="far fa-chevron-right eg-cta-arrow"></i>
            </a>
            <button class="eg-cta-secondary eg-cta-inhouse" type="button">
              <i class="fas fa-building"></i> Inhouse-Schulung anfragen
            </button>
          </div>
          <div class="eg-info-benefits">
            <div class="eg-benefit"><i class="far fa-check-circle"></i> Kostenlose Stornierung bis 14 Tage vor Beginn</div>
            <div class="eg-benefit"><i class="far fa-check-circle"></i> Unterlagen & Zertifikat inklusive</div>
          </div>
        </div>
      </div>`;

      return boxHtml;
    }

    function bindEvents() {
      var ctaTermin = document.querySelector('.eg-cta-termin');
      if (ctaTermin) {
        ctaTermin.addEventListener('click', function (e) {
          e.preventDefault();
          var t = document.querySelector('.event-item');
          if (t) t.scrollIntoView({ behavior: 'smooth' });
        });
      }

      var ctaInhouse = document.querySelector('.eg-cta-inhouse');
      if (ctaInhouse) {
        ctaInhouse.addEventListener('click', function () {
          const buttons = document.querySelectorAll(
  '[aria-label="Product Description and Seminar Events"] button'
);

const targetButton = [...buttons].find(
  button => button.textContent.trim() === 'Inhouse Seminar anfragen'
);

targetButton && targetButton.click();
        });
      }
    }

    function init() {
      if (document.querySelector('.eg-info-box')) return;
      document.body.classList.add('EG-DEKRA-AB01');

      var anchor = document.querySelector('[aria-label="Product Title and Attributes"] h1');
      if (!anchor) return;

      var data = scrapeData();
      var boxHtml = buildInfoBox(data);

      var wrapper = document.createElement('div');
      wrapper.className = 'eg-wrapper-EG-DEKRA-AB01';
      wrapper.innerHTML = boxHtml;

      anchor.closest('[aria-label="Product Title and Attributes"]').insertAdjacentElement('afterend', wrapper);
      bindEvents();
    }

    waitForElement('.event-item:first-child .fa-clock + span', init, 150, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

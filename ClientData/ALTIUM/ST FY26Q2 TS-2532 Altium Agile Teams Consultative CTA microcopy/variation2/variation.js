(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ALTIUM-TS2532-V2';

    var svgs = {
      "lock": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8333 9.16699H4.16667C3.24619 9.16699 2.5 9.91318 2.5 10.8337V16.667C2.5 17.5875 3.24619 18.3337 4.16667 18.3337H15.8333C16.7538 18.3337 17.5 17.5875 17.5 16.667V10.8337C17.5 9.91318 16.7538 9.16699 15.8333 9.16699Z" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.83594 9.16699V5.83366C5.83594 4.72859 6.27492 3.66878 7.05633 2.88738C7.83773 2.10598 8.89754 1.66699 10.0026 1.66699C11.1077 1.66699 12.1675 2.10598 12.9489 2.88738C13.7303 3.66878 14.1693 4.72859 14.1693 5.83366V9.16699" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
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

    function modifyForm() {
      if (document.querySelector('.eg-cta-microcopy')) return;

      const mainElement = document.querySelector('html body .region-content .s-hero');

      // Change CTA button text
      var ctaButton = mainElement.querySelector('button[type="submit"]');
      ctaButton.textContent = 'Start my free trial';

      // Add microcopy below CTA (only lock icon line)
      var microcopyDiv = document.createElement('div');
        microcopyDiv.className = 'eg-cta-microcopy';
        microcopyDiv.innerHTML = `
          <div class="eg-microcopy-row">
            ${svgIcon('lock')}
            <span>Instant setup. No credit card required.</span>
          </div>
        `;

        ctaButton.parentNode.insertAdjacentElement('beforeend', microcopyDiv);

      // Add trust rating bar below hero description
      addTrustRatingBar(mainElement);
    }

    function addTrustRatingBar(mainElement) {
      if (document.querySelector('.eg-trust-rating-bar')) return;

      // Find the hero description paragraph
      var descParagraph = mainElement.querySelector('.s-hero__text p');
      if (descParagraph) {
        var trustBar = document.createElement('div');
        trustBar.className = 'eg-trust-rating-bar';
        trustBar.innerHTML = `
          <div role="img" aria-label="Capterra rating: 4.6 out of 5" style="background: #F9F9F9; width: fit-content; padding: 8px 16px; border-radius: 100px; display: inline-flex; align-items: center; gap: 10px;">
            <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-06/trust-capterra.svg?VersionId=wWL.GmUfKOuCv.4.GG940QQ9nf4ewyLX" alt="Capterra" style="width: 24px; height: 24px; object-fit: contain;">
            <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-06/trust-getapp.svg?VersionId=0C1e3WGxIw5qqCBghwIEp7ZEGKPxfChh" alt="GetApp" style="width: 24px; height: 24px; object-fit: contain;">
            <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-06/trust-g2.svg?VersionId=WKdkka3jrpql_DPEUo1FuatjzsgJN7y3" alt="G2" style="width: 24px; height: 24px; object-fit: contain;">
            <span style="font-size: 12px; font-weight: 500; color: #1a1a1a;">4.6/5 based on 1000+ reviews</span>
            <div style="display: flex; align-items: center; gap: 1px;">
              <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-04/rating-star-full.svg?VersionId=CP61yStoVyn8dOoS1E6DpyYr6NMytsz7" alt="star" style="width: 14px; height: 14px;">
              <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-04/rating-star-full.svg?VersionId=CP61yStoVyn8dOoS1E6DpyYr6NMytsz7" alt="star" style="width: 14px; height: 14px;">
              <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-04/rating-star-full.svg?VersionId=CP61yStoVyn8dOoS1E6DpyYr6NMytsz7" alt="star" style="width: 14px; height: 14px;">
              <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-04/rating-star-full.svg?VersionId=CP61yStoVyn8dOoS1E6DpyYr6NMytsz7" alt="star" style="width: 14px; height: 14px;">
              <img loading="lazy" src="https://cdn.files.altium.com/sites/default/files/media_icon/2026-04/rating-star-half.svg?VersionId=.UC3_tLH_h3RKiEynfzl.CUbZu191SKr" alt="half star" style="width: 14px; height: 14px;">
            </div>
          </div>
        `;
        descParagraph.parentNode.insertBefore(trustBar, descParagraph.nextSibling);
      }
    }

    function init() {
      document.body.classList.add('EG-ALTIUM-TS2532-V2');
      modifyForm();
    }

    waitForElement('html body .region-content .s-hero button[type="submit"]', init, 100, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

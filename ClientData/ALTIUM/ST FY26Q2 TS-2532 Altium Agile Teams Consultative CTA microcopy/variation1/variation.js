(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ALTIUM-TS2532';

    var svgs = {
      "lock": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8333 9.16699H4.16667C3.24619 9.16699 2.5 9.91318 2.5 10.8337V16.667C2.5 17.5875 3.24619 18.3337 4.16667 18.3337H15.8333C16.7538 18.3337 17.5 17.5875 17.5 16.667V10.8337C17.5 9.91318 16.7538 9.16699 15.8333 9.16699Z" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.83594 9.16699V5.83366C5.83594 4.72859 6.27492 3.66878 7.05633 2.88738C7.83773 2.10598 8.89754 1.66699 10.0026 1.66699C11.1077 1.66699 12.1675 2.10598 12.9489 2.88738C13.7303 3.66878 14.1693 4.72859 14.1693 5.83366V9.16699" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      "starCheck": `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15.8822 10.4172L18.1989 8.16134C8.2582 8.10384 18.3001 8.03087 18.32 7.95072C18.3399 7.87058 18.3369 7.78646 18.3114 7.70793C18.2859 7.62939 18.2388 7.55958 18.1757 7.50642C18.1125 7.45326 18.0356 7.41888 17.9539 7.40718L13.6489 6.77801C13.3651 6.73803 13.0955 6.62897 12.8638 6.46042C12.632 6.29187 12.4452 6.06898 12.3197 5.81134L10.3947 1.91134C10.3581 1.8376 10.3017 1.77555 10.2317 1.7322C10.1617 1.68885 10.081 1.66593 9.98864 1.66602C9.91631 1.6661 9.83565 1.6892 9.76575 1.73268C9.69585 1.76619 9.6395 1.83836 9.60306 1.91218L7.6789 5.81134C7.55327 6.0692 7.3662 6.29222 7.13413 6.46078C6.90206 6.62934 6.63212 6.73828 6.34806 6.77801L2.04390 7.40718C1.96198 7.41876 1.88497 7.45311 1.82163 7.50630C1.75828 7.55955 1.71116 7.62948 1.68563 7.70817C1.66009 7.78686 1.65717 7.87114 1.6772 7.95141C1.69722 8.03167 1.73939 8.1047 1.7989 8.16218L4.91223 11.193C5.11905 11.3922 5.27368 11.6392 5.36247 11.9123C5.45127 12.1854 5.4715 12.4761 5.4214 12.7588L4.68806 17.0413C4.67389 17.1227 4.68278 17.2063 4.71373 17.2828C4.74469 17.3593 4.79645 17.4256 4.86317 17.4742C4.92989 17.5228 5.00889 17.5517 5.09120 17.5577C5.17352 17.5637 5.25586 17.5465 5.32890 17.508L9.17639 15.4847L9.1989 15.473" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.5 14.9997L14.1667 16.6663L17.5 13.333" stroke="#7D7D7D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    }
    

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

      // 3. Change form header: "Free 30-day access" → "Get Expert Guidance for Your Team"
      var formHeaders = mainElement.querySelector('.b-form__desc');
      formHeaders.textContent = 'Get Expert Guidance for Your Team';

      // 4. Change CTA button text
      var ctaButton = mainElement.querySelector('button[type="submit"]');
      ctaButton.textContent = 'Talk to an Agile Specialist';

      // 5. Add microcopy below CTA
      var microcopyDiv = document.createElement('div');
        microcopyDiv.className = 'eg-cta-microcopy';
        microcopyDiv.innerHTML = `
          <div class="eg-microcopy-row">
            ${svgIcon('lock')}
            <span>Response within 2 business hours. 15-min chat with zero sales pressure.</span>
          </div>
          <div class="eg-microcopy-row">
            ${svgIcon('starCheck')}
            <span>4.6/5 based on 1000+ reviews</span>
          </div>
        `;

        ctaButton.parentNode.insertAdjacentElement('beforeend', microcopyDiv);

      // 6. Add trust rating bar below hero description
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
      document.body.classList.add('EG-ALTIUM-TS2532');
      modifyForm();
    }

    waitForElement('html body .region-content .s-hero button[type="submit"]', init, 100, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

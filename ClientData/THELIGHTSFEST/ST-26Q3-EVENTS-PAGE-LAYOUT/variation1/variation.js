/*
 * ============================================================
 * THELIGHTSFEST — ST | 26Q3 | Events Page Layout
 * Test    : Events Page Layout Optimization
 * Patterns: P2 (Insert Section), P10 (Text Replacement), P18 (YouTube), P16 (CSS Scope)
 * Helpers : waitForElement
 * Body CSS : .EG-ST-26Q3-EVENTS-PAGE-LAYOUT
 * ============================================================
 *
 * CHANGES (Figma vs Control):
 *  1. Hide original "Buy Tickets!" from header
 *  2. Add benefits/checkmarks section after hero image
 *  3. Restructure WHAT YOU GET section with checkmarks
 *  4. Restructure ABOUT THIS EVENT section with checkmarks
 *  5. Move MEDIA from right column to left column (below ABOUT)
 *  6. Remove VIDEOS section, add YouTube as media thumbnail
 *  7. Add trust section in right column (BUY TICKETS + card logos + guarantee)
 *  8. Mobile: sticky bottom bar with Buy Tickets + trust
 *  9. Tooltip on guarantee badge hover
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'ST-26Q3-EVENTS-PAGE-LAYOUT';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (
          document &&
          document.querySelector(selector) &&
          document.querySelectorAll(selector).length > 0
        ) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    /* ── 1. Hide original Buy Tickets button ──────────────────────────── */
    function hideOriginalBuyButton() {
      var btn = document.querySelector('#buyTicketsContainer .btn-active');
      if (btn) btn.style.display = 'none';
    }

    /* ── 2. Add benefits/checkmarks after hero ────────────────────────── */
    function insertBenefitsSection() {
      if (document.querySelector('.eg-benefits-section')) return;
      var hero = document.querySelector('#largeImageContainer');
      if (!hero) return;

      var html = '<div class="eg-benefits-section">' +
        '<ul class="eg-benefits-list">' +
          '<li><span class="eg-check">&#x2713;</span> Thousands of lanterns light the sky together</li>' +
          '<li><span class="eg-check">&#x2713;</span> Lantern kit included with every adult ticket</li>' +
          '<li><span class="eg-check">&#x2713;</span> The sooner you buy, the more you save</li>' +
        '</ul>' +
      '</div>';

      hero.insertAdjacentHTML('afterend', html);
    }

    /* ── 2b. Add small thumbnail below hero ───────────────────────────── */
    function insertThumbnail() {
      if (document.querySelector('.eg-hero-thumbnail')) return;
      var hero = document.querySelector('#largeImageContainer');
      if (!hero) return;

      var thumbSrc = 'https://d27ush0hbdz2nj.cloudfront.net/16df11d1404fd80c542f54822a300989/galleries/187/LF-Details-2.jpg';
      var html = '<div class="eg-hero-thumbnail">' +
        '<img src="' + thumbSrc + '" alt="The Lights Festival thumbnail" />' +
      '</div>';

      hero.insertAdjacentHTML('afterend', html);
    }

    /* ── 3. Restructure WHAT YOU GET section ───────────────────────────── */
    function restructureWhatYouGet() {
      var desc = document.querySelector('#descriptionContainer .sectionContent');
      if (!desc || desc.dataset.egRestructured) return;

      var newContent =
        '<div class="eg-section-title">What You Get</div>' +
        '<div class="eg-what-you-get">' +
          '<p class="eg-subheading">Each adult ticket comes with:</p>' +
          '<ul class="eg-check-list">' +
            '<li><span class="eg-check">&#x2713;</span> 1 biodegradable lantern</li>' +
            '<li><span class="eg-check">&#x2713;</span> 1 marker to decorate the lantern with</li>' +
            '<li><span class="eg-check">&#x2713;</span> Extra lanterns can be purchased at checkout.</li>' +
          '</ul>' +
          '<p class="eg-note"><em>Parking fee collected upon arrival.</em></p>' +
          '<p class="eg-subheading">Each children\'s ticket* comes with:</p>' +
          '<ul class="eg-check-list">' +
            '<li><span class="eg-check">&#x2713;</span> 1 Fun Kit - no lantern</li>' +
          '</ul>' +
          '<p class="eg-note"><em>*Children 3 and under enter for FREE.</em></p>' +
        '</div>';

      desc.innerHTML = newContent;
      desc.dataset.egRestructured = '1';
    }

    /* ── 4. Restructure ABOUT THIS EVENT section ───────────────────────── */
    function restructureAbout() {
      var desc = document.querySelector('#descriptionContainer .sectionContent');
      if (!desc || desc.dataset.egAboutDone) return;

      var aboutHTML =
        '<div class="eg-section-title">About This Event</div>' +
        '<div class="eg-about-section">' +
          '<p>THE LIGHTS is a magical evening that will create memories to last a lifetime. Come celebrate as we put our inhibitions to the side, and our dreams to the sky. In one night, you can change to what you want to become. Let go of your fears, and embrace your true self. Join us as we light the fire within.</p>' +
          '<p class="eg-subheading">Gates open a few hours before sunset. While you wait, enjoy:</p>' +
          '<ul class="eg-check-list">' +
            '<li><span class="eg-check">&#x2713;</span> Live Music</li>' +
            '<li><span class="eg-check">&#x2713;</span> Family-friendly Entertainment</li>' +
            '<li><span class="eg-check">&#x2713;</span> Local Food Trucks</li>' +
          '</ul>' +
        '</div>';

      desc.insertAdjacentHTML('beforeend', aboutHTML);
      desc.dataset.egAboutDone = '1';
    }

    /* ── 5. Move MEDIA to left column + add YouTube thumbnail ──────────── */
    function moveMediaToColumn(retryCount) {
      retryCount = retryCount || 0;
      if (document.querySelector('.eg-media-moved')) return;
      var desc = document.querySelector('#descriptionContainer');
      if (!desc) return;
      var media = document.querySelector('#mediaContainer');
      var videos = document.querySelector('#additionalContent_182');

      if (!media && !videos) {
        if (retryCount < 10) {
          setTimeout(function () { moveMediaToColumn(retryCount + 1); }, 500);
        }
        return;
      }

      if (media && videos) {
        var ytUrl = 'https://www.youtube.com/embed/qz-9LOZftS8';
        var ytThumb = 'https://img.youtube.com/vi/qz-9LOZftS8/mqdefault.jpg';
        var ytLink = document.createElement('a');
        ytLink.href = ytUrl;
        ytLink.className = 'galleryThumb eg-yt-thumbnail';
        ytLink.setAttribute('data-lg-size', '1280-720');
        ytLink.setAttribute('data-video-type', 'youtube');
        ytLink.setAttribute('data-src', ytUrl);
        ytLink.innerHTML = '<img src="' + ytThumb + '" alt="YouTube Video" />';
        var galleryBlock = media.querySelector('.lightgalleryBlock');
        if (galleryBlock) galleryBlock.appendChild(ytLink);
        videos.classList.add('eg-hidden');
        videos.style.setProperty('display', 'none', 'important');
      }

      if (media) {
        media.classList.add('eg-media-moved');
        desc.insertAdjacentElement('beforeend', media);
        reinitLightGallery(media);
      }
    }

    function reinitLightGallery(container) {
      if (typeof jQuery === 'undefined' || typeof jQuery.fn.lightGallery === 'undefined') return;
      var lg = jQuery(container).data('lightGallery');
      if (lg) lg.destroy(true);
      jQuery(container).lightGallery({
        selector: 'a[data-video-type="youtube"], a[rel="imageGallery"]',
        videojs: true
      });
    }

    /* ── 6. Add trust section in right column ──────────────────────────── */
    function insertTrustSection() {
      if (document.querySelector('.eg-trust-section')) return;
      var whenSection = document.querySelector('#dateAndTimeContainer');
      if (!whenSection) return;

      var html = '<div class="eg-trust-section">' +
        '<button class="eg-buy-tickets-btn" onclick="$(\'#addToCart-tickets-tab\').click(); $(\'#addTicketsModal\').modal(\'show\');">BUY TICKETS</button>' +
        '<div class="eg-trust-row">' +
          '<div class="eg-card-logos">' +
            '<span class="eg-card-logo eg-card-visa">VISA</span>' +
            '<span class="eg-card-logo eg-card-mc">MC</span>' +
            '<span class="eg-card-logo eg-card-amex">AMEX</span>' +
          '</div>' +
          '<div class="eg-guarantee-badge">' +
            '<span class="eg-guarantee-icon">&#x1F6E1;</span>' +
            '<span class="eg-guarantee-text">Rescheduling Guarantee</span>' +
            '<span class="eg-guarantee-tooltip-trigger" data-tooltip="If we cancel this event and it isn\'t rescheduled within 90 days, you\'ll be eligible to request a full refund.">&#x2139;</span>' +
          '</div>' +
        '</div>' +
      '</div>';

      whenSection.insertAdjacentHTML('afterend', html);
    }

    /* ── 7. Mobile sticky bottom bar ───────────────────────────────────── */
    function initMobileStickyBar() {
      if (document.querySelector('.eg-mobile-sticky-bar')) return;

      var html = '<div class="eg-mobile-sticky-bar">' +
        '<div class="eg-mobile-sticky-inner">' +
          '<button class="eg-mobile-buy-btn" onclick="$(\'#addToCart-tickets-tab\').click(); $(\'#addTicketsModal\').modal(\'show\');">Buy Tickets!</button>' +
          '<div class="eg-mobile-trust-row">' +
            '<div class="eg-card-logos">' +
              '<span class="eg-card-logo eg-card-visa">VISA</span>' +
              '<span class="eg-card-logo eg-card-mc">MC</span>' +
              '<span class="eg-card-logo eg-card-amex">AMEX</span>' +
            '</div>' +
            '<div class="eg-guarantee-badge">' +
              '<span class="eg-guarantee-icon">&#x1F6E1;</span>' +
              '<span class="eg-guarantee-text">Rescheduling Guarantee</span>' +
              '<span class="eg-guarantee-tooltip-trigger" data-tooltip="If we cancel this event and it isn\'t rescheduled within 90 days, you\'ll be eligible to request a full refund.">&#x2139;</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

      document.body.insertAdjacentHTML('beforeend', html);
    }

    /* ── 8. Tooltip functionality ──────────────────────────────────────── */
    function initTooltip() {
      document.addEventListener('mouseenter', function (e) {
        if (e.target.classList.contains('eg-guarantee-tooltip-trigger')) {
          var tooltipText = e.target.getAttribute('data-tooltip');
          if (!tooltipText) return;
          var existing = document.querySelector('.eg-guarantee-tooltip');
          if (existing) existing.remove();
          var tooltip = document.createElement('div');
          tooltip.className = 'eg-guarantee-tooltip';
          tooltip.textContent = tooltipText;
          document.body.appendChild(tooltip);
          var rect = e.target.getBoundingClientRect();
          tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 8) + 'px';
          tooltip.style.left = (rect.left + window.scrollX - (tooltip.offsetWidth / 2) + (e.target.offsetWidth / 2)) + 'px';
        }
      }, true);

      document.addEventListener('mouseleave', function (e) {
        if (e.target.classList.contains('eg-guarantee-tooltip-trigger')) {
          var tooltip = document.querySelector('.eg-guarantee-tooltip');
          if (tooltip) tooltip.remove();
        }
      }, true);
    }

    /* ── Init ──────────────────────────────────────────────────────────── */
    function init() {
      document.body.classList.add('EG-ST-26Q3-EVENTS-PAGE-LAYOUT');
      hideOriginalBuyButton();
      insertBenefitsSection();
      insertThumbnail();
      restructureWhatYouGet();
      restructureAbout();
      setTimeout(moveMediaToColumn, 1000);
      insertTrustSection();
      initMobileStickyBar();
      initTooltip();
    }

    waitForElement('#descriptionContainer', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

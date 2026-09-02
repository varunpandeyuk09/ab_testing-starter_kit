(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-NB-22_03';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function parseBadge(text) {
      if (!text) return '';
      // decode entities
      var d = document.createElement('textarea');
      d.innerHTML = text;
      var decoded = d.value;
      // extract size and height
      var sizeM = decoded.match(/size\s+([A-Z0-9]+)/i);
      var hM = decoded.match(/(\d+'\d+")\/(\d+cm)/);
      var size = sizeM ? sizeM[1] : '';
      var height = hM ? hM[1] + ' (' + hM[2] + ')' : '';
      if (height && size) return 'Model is ' + height + ' and wears a size ' + size;
      // fallback to first sentence
      var first = decoded.split('.')[0];
      return first.length > 80 ? first.slice(0, 80) + '...' : first;
    }

    function injectBadges() {
      var imgs = document.querySelectorAll('img[data-modelinfo]');
      if (!imgs.length) return;
      var isMobile = window.innerWidth < 768;
      if (isMobile) {
        // mobile: show on all images in carousel
        for (var i = 0; i < imgs.length; i++) {
          var imgM = imgs[i];
          var rawM = imgM.getAttribute('data-modelinfo');
          if (!rawM) continue;
          var badgeTextM = parseBadge(rawM);
          if (!badgeTextM) continue;
          var targetM = imgM.closest('.item-content') || imgM.closest('button') || imgM.parentElement;
          if (!targetM) continue;
          if (targetM.querySelector(':scope > .eg-model-badge')) continue;
          if (targetM.style) targetM.style.position = 'relative';
          var badgeM = document.createElement('div');
          badgeM.className = 'eg-model-badge';
          badgeM.textContent = badgeTextM;
          targetM.appendChild(badgeM);
        }
        return;
      }
      // desktop: only on 2nd image if multiple, last if 2, first if 1
      // find first image with modelinfo per carousel vs grid - desktop has 4 images (2x2)
      // Use visible imgs with data-modelinfo - pick index 1 if exists else 0
      var idx = 0;
      if (imgs.length === 1) idx = 0;
      else if (imgs.length >= 2) idx = 1; // 2nd image
      var img = imgs[idx];
      if (!img) return;
      var raw = img.getAttribute('data-modelinfo');
      var badgeText = parseBadge(raw);
      if (!badgeText) return;
      var target = img.closest('.item-content') || img.closest('button') || img.parentElement;
      if (!target) return;
      if (target.querySelector(':scope > .eg-model-badge')) return;
      if (target.style) target.style.position = 'relative';
      var badge = document.createElement('div');
      badge.className = 'eg-model-badge';
      badge.textContent = badgeText;
      target.appendChild(badge);
    }

    function init() {
      document.body.classList.add('EG-NB-22_03');
      injectBadges();
    }

    // wait for carousel images with model data (PDP loads via SPA)
    waitForElement('img[data-modelinfo]', init, 50, 15000);

    // re-apply on SPA variant change (color/size switch)
    var obs;
    function startObs() {
      var root = document.querySelector('#mainImageCarouselComponent, [class*="carousel"], main');
      if (!root || obs) return;
      obs = new MutationObserver(function (muts) {
        if (muts.some(function (m) { return m.addedNodes && m.addedNodes.length; })) {
          injectBadges();
        }
      });
      obs.observe(root, { childList: true, subtree: true });
    }
    waitForElement('#mainImageCarouselComponent, [class*="carousel"]', startObs, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in ' + variation_name);
  }
})();

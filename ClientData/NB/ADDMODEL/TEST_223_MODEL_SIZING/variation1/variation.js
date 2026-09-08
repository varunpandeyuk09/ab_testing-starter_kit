(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-NB-22_03';
    var debounceTimer = null;
    var obs = null;

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
      var d = document.createElement('textarea');
      d.innerHTML = text;
      var decoded = d.value;
      var sizeM = decoded.match(/size\s+([A-Z0-9]+)/i);
      var hM = decoded.match(/(\d+'\d+")\/(\d+cm)/);
      var size = sizeM ? sizeM[1] : '';
      var height = hM ? hM[1] + ' (' + hM[2] + ')' : '';
      if (height && size) return 'Model is ' + height + ' and wears a size ' + size;
      var first = decoded.split('.')[0];
      return first.length > 80 ? first.slice(0, 80) + '...' : first;
    }

    function clearBadges() {
      var old = document.querySelectorAll('.eg-model-badge');
      for (var i = 0; i < old.length; i++) {
        if (old[i].parentNode) old[i].parentNode.removeChild(old[i]);
      }
    }

    function getImgs() {
      // use global selector like original - scoped caused desktop empty on SPA transition
      return document.querySelectorAll('img[data-modelinfo]');
    }

    function injectBadges() {
      var imgs = getImgs();
      if (!imgs.length) return;
      clearBadges();
      var isMobile = isMobileView();
      if (isMobile) {
        for (var i = 0; i < imgs.length; i++) {
          var imgM = imgs[i];
          if (imgM.closest('.slick-cloned')) continue;
          var rawM = imgM.getAttribute('data-modelinfo');
          if (!rawM) continue;
          var badgeTextM = parseBadge(rawM);
          if (!badgeTextM) continue;
          var targetM = imgM.closest('.item-content') || imgM.closest('button') || imgM.parentElement;
          if (!targetM) continue;
          if (targetM.style) targetM.style.position = 'relative';
          var badgeM = document.createElement('div');
          badgeM.className = 'eg-model-badge eg-ready';
          badgeM.textContent = badgeTextM;
          targetM.appendChild(badgeM);
        }
        return;
      }
      // desktop: always on 1st image only (first valid modelinfo)
      var found = false;
      for (var d = 0; d < imgs.length; d++) {
        var cand = imgs[d];
        if (cand.closest('.slick-cloned')) continue;
        var rawTmp = cand.getAttribute('data-modelinfo');
        if (!rawTmp) continue;
        var txtTmp = parseBadge(rawTmp);
        if (!txtTmp) continue;
        var targetTmp = cand.closest('.item-content') || cand.closest('button') || cand.parentElement;
        if (!targetTmp) continue;
        if (targetTmp.style) targetTmp.style.position = 'relative';
        var badgeTmp = document.createElement('div');
        badgeTmp.className = 'eg-model-badge eg-ready';
        badgeTmp.textContent = txtTmp;
        targetTmp.appendChild(badgeTmp);
        // make visible after paint (flicker fix)
        setTimeout(function(el){ if(el) el.classList.add('eg-ready'); }, 10, badgeTmp);
        found = true;
        break; // only first valid
      }
      if (found) return;
      // fallback: try idx 0 directly
      var idx = 0;
      var img = imgs[idx];
      if (!img) return;
      var raw = img.getAttribute('data-modelinfo');
      var badgeText = parseBadge(raw);
      if (!badgeText) return;
      var target = img.closest('.item-content') || img.closest('button') || img.parentElement;
      if (!target) return;
      if (target.style) target.style.position = 'relative';
      var badge = document.createElement('div');
      badge.className = 'eg-model-badge eg-ready';
      badge.textContent = badgeText;
      target.appendChild(badge);
      setTimeout(function(el){ if(el) el.classList.add('eg-ready'); }, 10, badge);
    }

    function debouncedInject() {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(injectBadges, 120);
    }

    // flicker prevention - hide badges on desktop until JS settles
    (function addFlickerStyle(){
      if(document.getElementById('eg-flicker-fix')) return;
      var s=document.createElement('style');
      s.id='eg-flicker-fix';
      s.textContent='@media(min-width:768px){ .EG-NB-22_03 .eg-model-badge{opacity:0;pointer-events:none} .EG-NB-22_03 .eg-model-badge.eg-ready{opacity:1} }';
      document.head.appendChild(s);
    })();

    function isMobileView(){
      return window.matchMedia ? window.matchMedia('(max-width: 767px)').matches : window.innerWidth < 768;
    }

    function init() {
      document.body.classList.add('EG-NB-22_03');
      // small delay so window.innerWidth/matchMedia is stable - prevents all -> 1 flicker
      setTimeout(injectBadges, 80);
    }

    waitForElement('img[data-modelinfo]', init, 50, 15000);

    function startObs() {
      var root = document.querySelector('#mainImageCarouselComponent, [class*="carousel"], main');
      if (!root || obs) return;
      obs = new MutationObserver(function (muts) {
        var should = false;
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].addedNodes && muts[i].addedNodes.length) { should = true; break; }
          if (muts[i].type === 'attributes' && muts[i].target.matches && muts[i].target.matches('img[data-modelinfo]')) { should = true; break; }
        }
        if (should) debouncedInject();
      });
      obs.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'data-modelinfo'] });
    }
    waitForElement('#mainImageCarouselComponent, [class*="carousel"]', startObs, 50, 15000);

    // swatch SPA fallback
    document.body.addEventListener('click', function (e) {
      var sw = e.target.closest('[class*="swatch"], [class*="colour"], [class*="color"], [data-testid*="swatch"]');
      if (sw) { setTimeout(debouncedInject, 300); setTimeout(debouncedInject, 800); }
    });

  } catch (e) {
    if (debug) console.log(e, 'error in ' + variation_name);
  }
})();

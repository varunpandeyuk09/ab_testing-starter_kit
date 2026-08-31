(function () {
  try {
    var debug = 1;
    var v = 'EG-ZAT001';
    var signup = 'https://zattoo.com/start/signup';

    function wait(sel, fn, ms) {
      var i = setInterval(function () {
        if (document.querySelector(sel)) { clearInterval(i); fn(); }
      }, ms || 100);
      setTimeout(function () { clearInterval(i); }, 15000);
    }

    var path = location.pathname;

    // Homepage: CTA intercept
    if (path.indexOf('/de/') === 0 || path === '/de' || path === '/de/' || path.indexOf('/ch') === 0 || path.indexOf('/at') === 0) {
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a');
        if (a && ((a.getAttribute('href') || '').indexOf('/sender') !== -1 || (a.textContent || '').indexOf('Senderübersicht') !== -1)) {
          e.preventDefault();
          e.stopPropagation();
          if (debug) console.log(v + ': CTA → signup');
          location.href = signup;
        }
      }, true);
    }

    // Shop → signup redirect
    if (path.indexOf('/start/shop') === 0) {
      if (debug) console.log(v + ': shop → signup');
      location.replace(signup);
      return;
    }

    // Signup: auto-select plan
    if (path.indexOf('/start/signup') === 0) {
      function pickPlan() {
        var btns = document.querySelectorAll('button, a');
        for (var i = 0; i < btns.length; i++) {
          var t = (btns[i].textContent || '').toLowerCase();
          if (t.indexOf('weiter mit') !== -1 || t.indexOf('30 tage kostenlos') !== -1) {
            if (debug) console.log(v + ': auto-select → ' + btns[i].textContent.trim());
            btns[i].click();
            return true;
          }
        }
        return false;
      }
      wait('body', function () {
        pickPlan();
        setTimeout(pickPlan, 1000);
        setTimeout(pickPlan, 3000);
        var obs = new MutationObserver(pickPlan);
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { obs.disconnect(); }, 10000);
      });
    }

    document.body.classList.add('EG-ZAT001');
    if (debug) console.log(v + ': init ' + location.href);
  } catch (e) { if (debug) console.log(e, 'error'); }
})();

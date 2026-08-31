(function () {
  try {
    var debug = 1;
    var v = 'EG-DKR001';

    function wait(sel, fn, ms) {
      var i = setInterval(function () {
        if (document.querySelector(sel)) { clearInterval(i); fn(); }
      }, ms || 100);
      setTimeout(function () { clearInterval(i); }, 15000);
    }

    function init() {
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('.eg-tab-btn');
        if (btn) {
          console.log(v + ': Tab clicked — ' + btn.textContent.trim());
        }
      });
      if (debug) console.log(v + ': share.js init');
    }

    wait('body', init, 100);
  } catch (e) { if (debug) console.log(e, 'error'); }
})();

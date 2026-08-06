    // Library readiness waiters. Use BEFORE any code that calls a library
    // (e.g. $, Swiper, Slick) that the page may load lazily or via AJAX.
    // Source: Moorings (waitForJquery), WICKED_CLOTHES (Swiper/Slick), SWEET PLAID (Marketo).
    function waitForJquery(callback, timeout) {
      if (typeof jQuery !== "undefined") return callback();
      var waited = 0;
      var t = timeout || 15000;
      var iv = setInterval(function () {
        waited += 100;
        if (typeof jQuery !== "undefined") { clearInterval(iv); callback(); }
        else if (waited > t) clearInterval(iv);
      }, 100);
    }
    function waitForLibrary(libCheck, callback, timeout) {
      if (libCheck()) return callback();
      var waited = 0;
      var t = timeout || 15000;
      var iv = setInterval(function () {
        waited += 100;
        if (libCheck()) { clearInterval(iv); callback(); }
        else if (waited > t) clearInterval(iv);
      }, 100);
    }
    // Usage:
    // waitForLibrary(function () { return window.Swiper; }, function () { new Swiper('.eg-swiper'); });
    // waitForLibrary(function () { return window.Munchkin; }, function () { Munchkin.munchkinFunction(...); });

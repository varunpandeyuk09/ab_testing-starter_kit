(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-BRITBOX-0375';

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

    function hideUspBar() {
      var uspBar = document.querySelector('.usp-bar, .wrapper-usp, [class*="usp"]');
      if (uspBar) uspBar.style.display = 'none';
    }

    function insertHero() {
      var anchor = document.querySelector('.wrapper-full-home-notlogged > figure');
      if (!anchor) return;
      if (document.querySelector('.eg-hero-tommy')) return;

      var hero = document.createElement('div');
      hero.className = 'eg-hero-tommy';
      hero.innerHTML =
        `<div class="eg-hero-tommy__content">
          <img src="https://i.ibb.co/3mjywdpx/T-T-TT-Y-coming-2.png" alt="T-T-TT-Y-coming-2">
          <p class="eg-hero-tommy__desc">Thousands of hours of blissfully ad-free British TV, including exclusive and Original mysteries, dramas, comedies, docs and more.</p>
          <a href="/account/signup" class="eg-hero-tommy__cta">Start Watching Free</a>
        </div>`;

      anchor.insertAdjacentElement('afterend', hero);
    }

    function init() {
      document.body.classList.add('EG-BRITBOX-0375');
      hideUspBar();
      insertHero();
    }

    waitForElement('.wrapper-full-home-notlogged > figure', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

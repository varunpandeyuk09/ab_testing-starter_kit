(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-BRITBOX-0375';
    var heroImageUrl = 'https://prod9-static.bbus-static.com/api/shain/v1/dataservice/ResizeImage/$value?Format=%27webp%27&Quality=80&ImageId=%27714260%27&EntityType=%27ItemList%27&EntityId=%2754605%27&Width=3840&Height=2160&ImageUrl=714260';

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
        '<div class="eg-hero-tommy__bg" style="background-image:url(\'' + heroImageUrl + '\')"></div>' +
        '<div class="eg-hero-tommy__overlay"></div>' +
        '<div class="eg-hero-tommy__content">' +
        '<img src="https://i.ibb.co/h1WHXXwn/29776e3d2b6ca82a0673628b43982c01702ef60f.png" alt="29776e3d2b6ca82a0673628b43982c01702ef60f">' +
        '<p class="eg-hero-tommy__desc">Thousands of hours of blissfully ad-free British TV, including exclusive and Original mysteries, dramas, comedies, docs and more.</p>' +
        '<a href="/account/signup" class="eg-hero-tommy__cta">Start Watching Free</a>' +
        '</div>';

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

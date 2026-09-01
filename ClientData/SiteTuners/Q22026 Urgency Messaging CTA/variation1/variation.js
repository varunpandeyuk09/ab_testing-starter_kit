(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ST001';

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

    function insertUrgencyLine() {
      var anchor = document.querySelector('.hero-banner-btn-group');
      if (!anchor) return;
      if (anchor.previousElementSibling && anchor.previousElementSibling.classList.contains('eg-urgency-line')) return;
      var urgency = document.createElement('p');
      urgency.className = 'eg-urgency-line';
      urgency.textContent = 'Next start date: September 15 \u00B7 Only 3 audit spots open this month';
      anchor.insertAdjacentElement('beforebegin', urgency);
    }

    function init() {
      document.body.classList.add('EG-ST001');
      insertUrgencyLine();
    }

    waitForElement('.hero-banner-btn-group', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

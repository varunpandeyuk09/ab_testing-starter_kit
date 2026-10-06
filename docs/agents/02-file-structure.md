# 02 — File Structure and Templates

> Source: `AGENTS.md` Section 7. Priority: HIGH. Use for every new test scaffold.

## Required layout

```
ab_testing-starter_kit/ClientData/TEST-NAME/
├── v1.json              # Required
├── metadata.json        # Required
├── share.js             # If tracking needed
└── variation1/
    ├── variation.js     # IIFE + helpers + init
    └── variation.css    # Scoped under .EG-TEST-NAME
```

## variation.js template

```js
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-TEST-NAME';
    var targetSelector = '.target-element';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function init() {
      document.body.classList.add(variation_name);
      // your logic here
    }

    waitForElement(targetSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();
```

## Idempotent init pattern [MUST]

Always add the body class first, then check if the element already exists before inserting. The anchor must exist before use.

```js
function init() {
  document.body.classList.add(variation_name);
  if (document.querySelector('.eg-hero-section')) return; // idempotent
  var anchor = document.querySelector('.stable-anchor');
  if (!anchor) return;
  anchor.insertAdjacentHTML('afterend', '<div class="eg-hero-section">...</div>');
}
```

## variation.css template

```css
.EG-TEST-NAME .eg-new-element {
  /* styles here */
}
```

## metadata.json template

```json
{
  "id": "EG-EXAMPLE-SM01",
  "client": "EXAMPLE CLIENT",
  "type": "From the brief shared",
  "platform": "From the brief shared",
  "devices": ["From the brief shared", "From the brief shared", "From the brief shared"],
  "number_of_variations": "from the brief shared"
}
```

## v1.json template

```json
{
  "files": [
    "./variation1/variation.css",
    "./variation1/variation.js",
    "./share.js"
  ],
  "urls": [
    "client target url here"
  ]
}
```

## share.js template

```js
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-EXAMPLE-SM01-events-tracking';
    var targetSelector = "wait-for-element-selector-from-dom";

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function init() {
      if(document.querySelector('.' + variation_name)) return;
      document.body.classList.add(variation_name);
      // example : live('.selector', 'click', function () { console.log('clicked'); });
    }

    waitForElement(targetSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in share.js ' + variation_name);
  }
})();
```

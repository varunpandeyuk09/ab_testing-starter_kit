(function () {
  try {
    var debug = 1;
    var v = 'EG-DKR001';

    function wait(sel, fn, ms) {
      var i = setInterval(function () {
        if (document.querySelector(sel)) { clearInterval(i); fn(); }
      }, ms || 100);
      setTimeout(function () { clearInterval(i); }, 20000);
    }

    function buildTabs() {
      // Try multiple selectors to find content container
      var container = document.querySelector('#app .flex.flex-col') ||
                      document.querySelector('#app > div > div') ||
                      document.querySelector('#app > div');

      if (!container) {
        if (debug) console.log(v + ': Container not found');
        return;
      }

      if (container.dataset.egTabsBuilt) return;

      // Find all direct children that are content sections
      var allChildren = container.children;
      var sections = [];

      for (var i = 0; i < allChildren.length; i++) {
        var child = allChildren[i];
        // Skip hero (first section) and footer
        if (child.tagName === 'FOOTER' || child.classList.contains('footer')) continue;
        // Check if it has content (heading, text, etc.)
        if (child.querySelector('h1, h2, h3, h4, h5, p, dl, .accordion')) {
          sections.push(child);
        }
      }

      if (debug) console.log(v + ': Found ' + sections.length + ' sections');

      if (sections.length < 2) {
        // Try alternative: find sections by margin class
        sections = [];
        var candidates = container.querySelectorAll('[class*="mb-12"], [class*="mb-10"], [class*="mb-15"]');
        for (var j = 0; j < candidates.length; j++) {
          if (candidates[j].parentElement === container) {
            sections.push(candidates[j]);
          }
        }
        if (debug) console.log(v + ': Alt found ' + sections.length + ' sections');
      }

      if (sections.length < 2) {
        if (debug) console.log(v + ': Not enough sections found');
        return;
      }

      // First section is hero
      var hero = sections[0];
      var contentSections = sections.slice(1);

      if (debug) console.log(v + ': Content sections: ' + contentSections.length);

      // Create tab nav
      var nav = document.createElement('div');
      nav.className = 'eg-tab-nav';
      nav.setAttribute('role', 'tablist');

      contentSections.forEach(function (sec, idx) {
        // Get title from heading
        var heading = sec.querySelector('h1, h2, h3, h4, h5, p.font-bold, strong, b');
        var title = heading ? heading.textContent.trim().substring(0, 40) : 'Tab ' + (idx + 1);
        if (title.length > 40) title = title.substring(0, 40) + '...';

        var btn = document.createElement('button');
        btn.className = 'eg-tab-btn' + (idx === 0 ? ' eg-active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        btn.setAttribute('data-tab', idx);
        btn.textContent = title;
        nav.appendChild(btn);

        // Wrap section in panel
        var panel = document.createElement('div');
        panel.className = 'eg-tab-panel' + (idx === 0 ? ' eg-active' : '');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('data-panel', idx);
        panel.setAttribute('data-eg-section', '1');

        sec.parentNode.insertBefore(panel, sec);
        panel.appendChild(sec);

        if (idx !== 0) panel.style.display = 'none';
      });

      // Insert nav after hero
      hero.parentNode.insertBefore(nav, hero.nextSibling);

      // Tab click
      nav.addEventListener('click', function (e) {
        var btn = e.target.closest('.eg-tab-btn');
        if (!btn) return;
        var idx = btn.getAttribute('data-tab');

        nav.querySelectorAll('.eg-tab-btn').forEach(function (b) {
          b.classList.remove('eg-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('eg-active');
        btn.setAttribute('aria-selected', 'true');

        document.querySelectorAll('.eg-tab-panel').forEach(function (p) {
          p.style.display = 'none';
          p.classList.remove('eg-active');
        });
        var active = document.querySelector('[data-panel="' + idx + '"]');
        if (active) {
          active.style.display = '';
          active.classList.add('eg-active');
        }
      });

      container.dataset.egTabsBuilt = '1';
      if (debug) console.log(v + ': Tabs built — ' + contentSections.length + ' tabs');
    }

    function init() {
      document.body.classList.add('EG-DKR001');
      buildTabs();
      if (debug) console.log(v + ': init ' + location.href);
    }

    // Wait for app to render
    wait('#app', function () {
      // Additional delay for Vue.js rendering
      setTimeout(init, 1000);
      setTimeout(init, 2000);
      setTimeout(init, 3000);
    }, 200);
  } catch (e) { if (debug) console.log(e, 'error'); }
})();

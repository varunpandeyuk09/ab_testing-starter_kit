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

    function hasDetailsTile(blocks, start, end) {
      for (var i = start; i < end; i++) {
        var spans = blocks[i].querySelectorAll('.clickable-tile span');
        for (var j = 0; j < spans.length; j++) {
          if (spans[j].textContent.trim() === 'Details analyzer') return true;
        }
      }
      return false;
    }

    function buildTabs() {
      var container = document.querySelector('#app .flex.flex-col') ||
                      document.querySelector('#app > div > div') ||
                      document.querySelector('#app > div');

      if (!container) {
        if (debug) console.log(v + ': Container not found');
        return;
      }

      if (container.dataset.egTabsBuilt) return;

      var blocks = Array.from(container.children).filter(function (el) {
        return el.tagName !== 'FOOTER' && !el.classList.contains('footer');
      });

      if (debug) console.log(v + ': Found ' + blocks.length + ' blocks');

      // Find all h2 headings
      var h2Indices = [];
      for (var i = 0; i < blocks.length; i++) {
        if (blocks[i].querySelector('h2')) h2Indices.push(i);
      }

      if (debug) console.log(v + ': h2 indices: ' + JSON.stringify(h2Indices));

      if (h2Indices.length < 2) {
        if (debug) console.log(v + ': Not enough h2 sections');
        return;
      }

      // Build tab ranges — each h2 section is a potential tab
      var tabRanges = [];
      for (var t = 0; t < h2Indices.length; t++) {
        var start = h2Indices[t];
        // End is always the NEXT h2 index (even if invalid) — not blocks.length
        var end = (t + 1 < h2Indices.length) ? h2Indices[t + 1] : blocks.length;

        // Dynamic check: is there a clickable-tile with "Details analyzer"?
        if (!hasDetailsTile(blocks, start, end)) {
          if (debug) console.log(v + ': Skipping block ' + start + ' — no details tile');
          continue;
        }

        // For last valid tab, cap at next h2 (don't swallow page-end content)
        var actualEnd = end;
        if (t + 1 >= h2Indices.length) {
          // This is the last h2 — find the NEXT h2 after this one
          // (there may be h2s we skipped as invalid)
          for (var nxt = t + 1; nxt < h2Indices.length; nxt++) {
            actualEnd = h2Indices[nxt];
            break;
          }
          // If no next h2 found, keep actualEnd = end (blocks.length)
        }

        tabRanges.push({ start: start, end: actualEnd, title: '' });
      }

      if (debug) console.log(v + ': Valid tabs: ' + tabRanges.length);

      if (tabRanges.length < 2) {
        if (debug) console.log(v + ': Not enough valid tabs');
        return;
      }

      // Get titles and hero
      var hero = blocks[0];

      // Extract tab content sections
      var tabSections = [];
      for (var r = 0; r < tabRanges.length; r++) {
        var range = tabRanges[r];
        var heading = blocks[range.start].querySelector('h2');
        var title = heading ? heading.textContent.trim().substring(0, 40) : 'Tab ' + (r + 1);
        if (title.length > 40) title = title.substring(0, 40) + '...';
        tabRanges[r].title = title;

        // Collect blocks for this tab
        var sectionWrapper = document.createElement('div');
        sectionWrapper.className = 'eg-tab-section';
        for (var b = range.start; b < range.end; b++) {
          sectionWrapper.appendChild(blocks[b].cloneNode(true));
        }
        tabSections.push(sectionWrapper);
      }

      // Create tab nav
      var nav = document.createElement('div');
      nav.className = 'eg-tab-nav';
      nav.setAttribute('role', 'tablist');

      for (var n = 0; n < tabRanges.length; n++) {
        var btn = document.createElement('button');
        btn.className = 'eg-tab-btn' + (n === 0 ? ' eg-active' : '');
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', n === 0 ? 'true' : 'false');
        btn.setAttribute('data-tab', n);
        btn.textContent = tabRanges[n].title;
        nav.appendChild(btn);
      }

      // Create panels
      var panels = [];
      for (var p = 0; p < tabSections.length; p++) {
        var panel = document.createElement('div');
        panel.className = 'eg-tab-panel' + (p === 0 ? ' eg-active' : '');
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('data-panel', p);
        panel.setAttribute('data-eg-section', '1');
        panel.appendChild(tabSections[p]);
        if (p !== 0) panel.style.display = 'none';
        panels.push(panel);
      }

      // Insert nav after hero
      hero.parentNode.insertBefore(nav, hero.nextSibling);

      // Insert panels after nav
      var insertPoint = nav.nextSibling;
      for (var ip = 0; ip < panels.length; ip++) {
        hero.parentNode.insertBefore(panels[ip], insertPoint);
      }

      // Remove original blocks (they've been cloned into panels)
      for (var rm = h2Indices[0]; rm < blocks.length; rm++) {
        if (blocks[rm].parentNode) blocks[rm].parentNode.removeChild(blocks[rm]);
      }

      // Tab click handler
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
      if (debug) console.log(v + ': Tabs built — ' + tabRanges.length + ' tabs');
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

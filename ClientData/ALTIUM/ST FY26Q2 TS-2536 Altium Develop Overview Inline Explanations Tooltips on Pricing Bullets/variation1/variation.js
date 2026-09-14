(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-TS-2536-V1';

    // ==================== DEVELOPER CONFIG ====================
    // Har tooltip is object se banta hai. Naya item add karna ho to bas naya object push kar do - NO REGEX NEEDED.
    // selector  : element ka CSS selector (copy from browser, jaisa dikhe waisa)
    // matchText : us element ke andar ka visible text ka hissa - plain string, case-insensitive, extra spaces ignore
    //             Example: "Altium Designer Author" ya "Workspace" - bas jo UI pe dikh raha hai wahi likh do
    // wrapText  : kis word/phrase pe dashed underline + tooltip lagana hai - plain string
    //             Example: "Author" ya "Workspace Users" - exact word jo highlight karna hai
    // content   : tooltip me kya dikhana hai - plain string
    // position  : desktop pe default position - 'right' | 'left' | 'top' | 'bottom' (mobile pe hamesha 'bottom')
    var TOOLTIPS = [
      {
        selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(1) span',
        matchText: 'Altium Designer Author',
        wrapText: 'Author',
        content: "The license for the person designing the board. Reviewers, managers, and mechanical engineers don't need one.",
        position: 'right'
      },
      {
        selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(2) span',
        matchText: 'Workspace for shared projects',
        wrapText: 'Workspace',
        content: 'Secure cloud workspace where projects, libraries and collaboration data stay in sync.',
        position: 'top'
      },
      {
        selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(3) span',
        matchText: 'Unlimited Workspace Users',
        wrapText: 'Workspace Users',
        content: 'Invite unlimited reviewers and stakeholders to view, comment and access BOM — no Designer license needed.',
        position: 'right'
      },
      {
        selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(3) span',
        matchText: 'BOM',
        wrapText: 'BOM',
        content: 'Bill of Materials: the full parts list needed to build your board.',
        position: 'right'
      },
      {
        selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(4) span',
        matchText: 'CoDesign',
        wrapText: 'CoDesign',
        content: 'Keep electrical and mechanical designs synchronized without manual file exchange — includes keepouts, rooms and copper geometry.',
        position: 'right'
      }
      // Example naya add karna ho to:
      // ,{ selector: 'html body .b-pricing-2 .b-pricing-2__feature-list > div:nth-child(5) span', matchText: 'Naya Feature', wrapText: 'Naya', content: 'Yahan apna tip likho', position: 'right' }
    ];
    // ==================== END CONFIG ====================

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      if (document.querySelector(selector)) {
        trigger();
      } else {
        var interval = setInterval(function () {
          if (document.querySelector(selector)) {
            clearInterval(interval);
            trigger();
          }
        }, delayInterval);
        setTimeout(function () {
          clearInterval(interval);
        }, delayTimeout);
      }
    }

    function escapeRegex(s) {
      return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function normalizeText(s) {
      return String(s).replace(/\s+/g, ' ').trim().toLowerCase();
    }

    function positionTip(tip, defaultPos) {
      var box = tip.querySelector('.eg-tip__box');
      if (!box) return;
      box.classList.remove('eg-pos-right', 'eg-pos-left', 'eg-pos-top', 'eg-pos-bottom');

      // Mobile pe hamesha bottom - requirement
      if (window.innerWidth < 768) {
        box.classList.add('eg-pos-bottom');
        return;
      }

      // Desktop: defaultPos ko prefer karo, space nahi hai to fallback
      var r = tip.getBoundingClientRect();
      // measure box without affecting layout
      box.style.visibility = 'hidden';
      box.style.opacity = '1';
      box.style.pointerEvents = 'none';
      var br = box.getBoundingClientRect();
      box.style.visibility = '';
      box.style.opacity = '';
      box.style.pointerEvents = '';

      var needW = br.width || 280;
      var needH = br.height || 60;
      var right = window.innerWidth - r.right;
      var left = r.left;
      var top = r.top;
      var bottom = window.innerHeight - r.bottom;
      var pos = (defaultPos || 'right').toLowerCase();

      // Prefer default pos if space available
      if (pos === 'right' && right >= needW + 14) box.classList.add('eg-pos-right');
      else if (pos === 'left' && left >= needW + 14) box.classList.add('eg-pos-left');
      else if (pos === 'top' && top >= needH + 14) box.classList.add('eg-pos-top');
      else if (pos === 'bottom' && bottom >= needH + 14) box.classList.add('eg-pos-bottom');
      else {
        // fallback - koi bhi side jisme jagah ho
        if (right >= needW + 14) box.classList.add('eg-pos-right');
        else if (left >= needW + 14) box.classList.add('eg-pos-left');
        else if (top >= needH + 14) box.classList.add('eg-pos-top');
        else box.classList.add('eg-pos-bottom');
      }
    }

    function isWrapAlreadyApplied(el, wrapText) {
      if (!wrapText || !el.dataset.egTipWraps) return false;
      var list = el.dataset.egTipWraps.split('|');
      var nWrap = normalizeText(wrapText);
      for (var k = 0; k < list.length; k++) {
        if (list[k] === nWrap) return true;
      }
      return false;
    }
    function findElementForConfig(cfg) {
      var el = null;
      // 1) try selector
      if (cfg.selector) {
        var nodes = document.querySelectorAll(cfg.selector);
        for (var i = 0; i < nodes.length; i++) {
          var txt = nodes[i].textContent || '';
          var isMatch = true;
          if (cfg.matchText) {
            if (cfg.matchText instanceof RegExp) isMatch = cfg.matchText.test(txt);
            else isMatch = normalizeText(txt).indexOf(normalizeText(cfg.matchText)) !== -1;
          }
          if (!isMatch) continue;
          // same element pe multiple tips allowed (jaise BOM + Workspace Users), sirf same wrapText dobara mat lagao
          if (isWrapAlreadyApplied(nodes[i], cfg.wrapText)) continue;
          // agar wrapText plain string hai to check karo ki kya text me abhi bhi wo word unwrapped bacha hai
          // (pehle se wrapped hone pe textContent me abhi bhi word dikhega, par hum wraps list se check kar rahe hain)
          el = nodes[i];
          break;
        }
      }
      // 2) fallback - pure .b-pricing-2 ke spans me search
      if (!el) {
        var all = document.querySelectorAll('.b-pricing-2 span');
        for (var j = 0; j < all.length; j++) {
          if (isWrapAlreadyApplied(all[j], cfg.wrapText)) continue;
          var txt2 = all[j].textContent || '';
          var isMatch2 = true;
          if (cfg.matchText) {
            if (cfg.matchText instanceof RegExp) isMatch2 = cfg.matchText.test(txt2);
            else isMatch2 = normalizeText(txt2).indexOf(normalizeText(cfg.matchText)) !== -1;
          }
          if (!isMatch2) continue;
          el = all[j];
          break;
        }
      }
      return el;
    }

    function applyTooltip(cfg, idx) {
      var el = findElementForConfig(cfg);
      if (!el) {
        if (debug) console.log('EG-TS-2536: no element for cfg', idx, cfg);
        return null;
      }
      // double check matchText - plain string, no regex needed
      if (cfg.matchText) {
        var ok = cfg.matchText instanceof RegExp ? cfg.matchText.test(el.textContent) : normalizeText(el.textContent).indexOf(normalizeText(cfg.matchText)) !== -1;
        if (!ok) return null;
      }

      var isAdditional = !!el.dataset.egTipApplied;
      el.dataset.egTipApplied = '1';
      el.dataset.egTipIdx = String(idx);
      // track kaunse wrapText already lage hain taaki duplicate na lage (BOM + Workspace Users same span)
      var nWrap = normalizeText(cfg.wrapText || '');
      if (nWrap) {
        var existing = el.dataset.egTipWraps ? el.dataset.egTipWraps.split('|') : [];
        if (existing.indexOf(nWrap) === -1) {
          existing.push(nWrap);
          el.dataset.egTipWraps = existing.join('|');
        }
      }

      var wrapSource = cfg.wrapText != null ? cfg.wrapText : '';
      var wrapRe;
      if (wrapSource instanceof RegExp) {
        wrapRe = wrapSource;
      } else if (typeof wrapSource === 'string' && wrapSource.trim() !== '') {
        // plain string - flexible spaces (\s+) and word boundaries, no regex knowledge needed
        var parts = wrapSource.trim().split(/\s+/).map(function (w) { return escapeRegex(w); });
        wrapRe = new RegExp('\\b' + parts.join('\\s+') + '\\b', 'i');
      } else {
        // agar wrapText nahi diya to pura matchText ko wrap karo
        if (cfg.matchText instanceof RegExp) wrapRe = cfg.matchText;
        else {
          var mParts = String(cfg.matchText).trim().split(/\s+/).map(function (w) { return escapeRegex(w); });
          wrapRe = new RegExp(mParts.join('\\s+'), 'i');
        }
      }

      // pehli baar textContent se, dusri baar (same span pe BOM jaisa) innerHTML se replace karo taaki pehla tip na mite
      var sourceForTest = el.textContent;
      if (!wrapRe.test(sourceForTest)) {
        if (debug) console.log('EG-TS-2536: wrapText not found in', sourceForTest, 'cfg', idx);
        return null;
      }

      var posClass = 'eg-pos-' + (cfg.position || 'right').toLowerCase();

      if (isAdditional) {
        // Same span pe dusra tooltip (BOM) — sirf unwrapped text nodes me dhoondo, box ke andar wale BOM ko ignore karo
        // Isse innerHTML.replace ka bug fix hota hai jisme pehle wale box ke andar wala "BOM" wrap ho jata tha aur nested DOM ban jata tha
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
          acceptNode: function (node) {
            if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            // box ke andar ka text skip karo
            if (node.parentElement && node.parentElement.closest('.eg-tip__box')) return NodeFilter.FILTER_REJECT;
            // already wrapped tip ke andar ka text (e.g. "Workspace Users") skip karo
            if (node.parentElement && node.parentElement.closest('.eg-tip') && node.parentElement.classList.contains('eg-tip')) {
              // ye wrapped word khud hai - isme BOM nahi hai, par isko skip karo
              return NodeFilter.FILTER_REJECT;
            }
            return wrapRe.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        });
        var textNode = walker.nextNode();
        if (!textNode) return null;
        var text = textNode.nodeValue;
        var match = text.match(wrapRe);
        if (!match) return null;
        var idx = match.index;
        var before = text.slice(0, idx);
        var after = text.slice(idx + match[0].length);
        var frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        var tipEl = document.createElement('span');
        tipEl.className = 'eg-tip';
        tipEl.tabIndex = 0;
        tipEl.setAttribute('data-eg-pos', cfg.position || 'right');
        tipEl.appendChild(document.createTextNode(match[0]));
        var box = document.createElement('span');
        box.className = 'eg-tip__box ' + posClass;
        box.textContent = cfg.content;
        tipEl.appendChild(box);
        frag.appendChild(tipEl);
        if (after) frag.appendChild(document.createTextNode(after));
        textNode.parentNode.replaceChild(frag, textNode);
        // walker ke baad ke nodes invalidate ho jate hain, isliye yahan return ke liye tipEl use karo
        // neeche wala generic tip dhoondhne wala logic is case me tipEl ko hi pick karega
      } else {
        var original = el.textContent;
        var replaced = false;
        el.innerHTML = original.replace(wrapRe, function (m) {
          if (replaced) return m;
          replaced = true;
          return '<span class="eg-tip" tabindex="0" data-eg-pos="' + (cfg.position || 'right') + '">' + m + '<span class="eg-tip__box ' + posClass + '">' + cfg.content + '</span></span>';
        });
      }

      // naya wala tip dhoondo (additional case me DOM se banaya hua tipEl)
      var tip = null;
      var allTips = el.querySelectorAll('.eg-tip');
      for (var ti = 0; ti < allTips.length; ti++) {
        if (!allTips[ti].dataset.defaultPos) {
          var firstNode = allTips[ti].childNodes[0];
          var tTxt = firstNode && firstNode.nodeType === 3 ? firstNode.nodeValue : allTips[ti].textContent;
          if (wrapSource && normalizeText(tTxt).indexOf(normalizeText(wrapSource)) !== -1) {
            tip = allTips[ti];
            break;
          }
        }
      }
      if (!tip) {
        // fallback: last tip jiska defaultPos abhi set nahi hua
        for (var tj = allTips.length - 1; tj >= 0; tj--) {
          if (!allTips[tj].dataset.defaultPos) { tip = allTips[tj]; break; }
        }
      }
      if (!tip) tip = allTips[allTips.length - 1];
      if (!tip) return null;

      // store default pos for resize handler
      tip.dataset.defaultPos = cfg.position || 'right';

      ['mouseenter', 'focus'].forEach(function (ev) {
        tip.addEventListener(ev, function () {
          positionTip(tip, tip.dataset.defaultPos);
        });
      });
      tip.addEventListener('click', function (e) {
        e.stopPropagation();
        positionTip(tip, tip.dataset.defaultPos);
        // dusre tips band karo, khud toggle
        var isActive = tip.classList.contains('eg-active');
        document.querySelectorAll('.eg-tip.eg-active').forEach(function (t) {
          if (t !== tip) t.classList.remove('eg-active');
        });
        if (isActive) tip.classList.remove('eg-active');
        else tip.classList.add('eg-active');
      });

      return tip;
    }

    function init() {
      var created = [];
      for (var k = 0; k < TOOLTIPS.length; k++) {
        var tip = applyTooltip(TOOLTIPS[k], k);
        if (tip) created.push(tip);
      }
      if (!created.length) return;

      // global handlers - ek hi baar
      document.addEventListener('click', function (e) {
        if (!e.target.closest('.eg-tip')) {
          document.querySelectorAll('.eg-tip.eg-active').forEach(function (t) {
            t.classList.remove('eg-active');
          });
        }
      });
      window.addEventListener('resize', function () {
        document.querySelectorAll('.eg-tip').forEach(function (t) {
          if (t.classList.contains('eg-active') || document.activeElement === t) {
            positionTip(t, t.dataset.defaultPos);
          }
        });
      });
      // ESC se close
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          document.querySelectorAll('.eg-tip.eg-active').forEach(function (t) {
            t.classList.remove('eg-active');
          });
        }
      });
    }

    waitForElement('html body .b-pricing-2', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

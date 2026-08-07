#!/usr/bin/env node
// tools/qa_run.js - browser-agnostic (Chromium family) A/B QA runner via CDP
// --------------------------------------------------------------------------
// Detects the developer's installed Chromium browser (Chrome / Edge / Brave /
// Opera / Vivaldi), launches it with a PERSISTENT profile, and drives it over
// CDP using only Node built-ins (fetch + native WebSocket, Node >= 22).
//
// Why this beats headless: Cloudflare/Turnstile pass with a real headed
// browser + stored cookies, so the human does NOT need to screenshot or copy
// DOM anymore. Log in once ("login" action) and every later run reuses it.
//
// USAGE:
//   node tools/qa_run.js --browser auto --profile praxindo --action login --url <url>
//   node tools/qa_run.js --browser auto --profile praxindo --action atc --url <url> --screenshot popup.png
//   node tools/qa_run.js qa --spec "<TEST>/spec.json"                <- data-driven QA (recommended)
//   node tools/qa_run.js --browser auto --profile praxindo --action qa --url <url> --inject "path/to/variation1"
//
// DATA-DRIVEN SPECS:
//   A spec.json lives in each test folder and holds settle + all golden checks,
//   so new tests never require editing this file. ops: exists|not|eq|match|
//   count|countLte|css|js; tokens {popup} {title} {update} {related}
//   {relatedTitle} {relatedTile} {counter} resolve from the SITES profile.
//   spec fields: profile, url, inject (relative to spec.json), settle, checks.
//
// FLAGS:
//   --browser auto|chrome|edge|brave|opera|vivaldi   (default: auto = first found)
//   --profile <site-key>                              site profile with selectors (default: praxindo)
//   --action navigate|login|atc|qa                    (default: atc)
//   --url <page-url>                                  required for login/atc/qa (or set spec.url)
//   --inject <dir>                                    variation1 folder with variation.js/.css (for qa; or set spec.inject)
//   --spec <spec.json | spec-dir>                     data-driven golden checks + settle
//   --screenshot <file.png>                           save a screenshot of the popup (for atc/qa)
//   --out <file.json>                                 save the full JSON result
//   --headless                                        headless mode (Cloudflare may block!)
//   --fresh                                           wipe the persistent profile before launch
//   --wait-ms <n>                                     extra wait after popup open (default 4000)
// --------------------------------------------------------------------------
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

/* ------------------------------------------------------------------ */
/* 1. Browser auto-detection (Chromium family)                          */
/* ------------------------------------------------------------------ */
const BROWSERS = {
  chrome: {
    label: "Chrome",
    paths: [
      process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
      process.env.PROGRAMFILES + "\\Google\\Chrome\\Application\\chrome.exe",
      (process.env["PROGRAMFILES(X86)"] || "") + "\\Google\\Chrome\\Application\\chrome.exe",
    ],
  },
  edge: {
    label: "Edge",
    paths: [
      process.env.PROGRAMFILES + "\\Microsoft\\Edge\\Application\\msedge.exe",
      (process.env["PROGRAMFILES(X86)"] || "") + "\\Microsoft\\Edge\\Application\\msedge.exe",
    ],
  },
  brave: {
    label: "Brave",
    paths: [
      process.env.LOCALAPPDATA + "\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    ],
  },
  opera: {
    label: "Opera",
    paths: [process.env.LOCALAPPDATA + "\\Programs\\Opera\\opera.exe"],
  },
  vivaldi: {
    label: "Vivaldi",
    paths: [process.env.LOCALAPPDATA + "\\Vivaldi\\Application\\vivaldi.exe"],
  },
};

function detectBrowser(name) {
  if (name && name !== "auto") {
    const cfg = BROWSERS[name];
    if (!cfg) return { error: `unknown browser "${name}" (choose from: ${Object.keys(BROWSERS).join(", ")}, auto)` };
    for (const p of cfg.paths) if (p && fs.existsSync(p)) return { name, label: cfg.label, path: p };
    return { error: `"${name}" not installed` };
  }
  for (const [key, cfg] of Object.entries(BROWSERS)) {
    for (const p of cfg.paths) if (p && fs.existsSync(p)) return { name: key, label: cfg.label, path: p };
  }
  return { error: "no Chromium browser found on this machine" };
}

/* ------------------------------------------------------------------ */
/* 2. Site profiles (selectors + QA expectations per client)            */
/* ------------------------------------------------------------------ */
const SITES = {
  praxindo: {
    label: "PRAXINDO",
    addToCart: [
      "#product-addtocart-button",
      ".action.tocart",
      'button[data-role="addtocart"]',
      'form[data-role="tocart-form"] button',
      ".box-tocart button",
    ],
    // All three ACP popup nodes carry layer__checkout--active; the first is
    // the loader. :has() picks the SUCCESS node (which is what we redesign).
    popup: '.aw-acp-popup:has([data-role="update"] .layer__checkout__title--success)',
    title: '.aw-acp-popup:has([data-role="update"] .layer__checkout__title--success) .layer__checkout__title--success',
    update: '[data-role="update"]',
    related: '[data-role="related"]',
    // Verified live markup (2026-08-07): related block is .layer__checkout__upselling
    // with title .layer__checkout__upselling__title ("Kunden kauften auch") and tiles
    // .layer__checkout__upselling__list__item (divs, price .final.final--hasstrike + .strike).
    relatedTitle: ".layer__checkout__upselling__title",
    relatedTile: ".layer__checkout__upselling__list__item",
    counter: "#minicart-counter",
    threshold: 100,
  },
  // Homepage section test — NO add-to-cart / popup flow. Empty addToCart[]
  // makes actQa take the "section flow": navigate → inject → settle → checks.
  revivserums: {
    label: "REVIVSERUMS",
    addToCart: [],
  },
};

/* ------------------------------------------------------------------ */
/* 3. Tiny CDP client (Node built-in WebSocket)                         */
/* ------------------------------------------------------------------ */
class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.seq = 0;
    this.pending = new Map();
    this.events = {};
    this.errors = [];
    this.network = [];
  }
  open() {
    return new Promise((res, rej) => {
      this.ws.onopen = () => res();
      this.ws.onerror = (e) => rej(new Error("websocket error: " + (e && e.message)));
      this.ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(JSON.stringify(msg.error)));
          else resolve(msg.result);
        } else if (msg.method) {
          const cbs = this.events[msg.method] || [];
          for (const cb of cbs) { try { cb(msg.params); } catch (_) {} }
        }
      };
    });
  }
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(method, cb) {
    (this.events[method] = this.events[method] || []).push(cb);
  }
  close() {
    try { this.ws.close(); } catch (_) {}
  }
}

/* ------------------------------------------------------------------ */
/* 4. Helpers                                                           */
/* ------------------------------------------------------------------ */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");

async function evaluate(cdp, expression) {
  const res = await cdp.send("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true,
  });
  if (res.exceptionDetails) {
    throw new Error("page JS error: " + JSON.stringify(res.exceptionDetails.exception && res.exceptionDetails.exception.description));
  }
  return res.result && res.result.value;
}

async function waitFor(cdp, fnExpr, timeoutMs, intervalMs, label) {
  const deadline = Date.now() + timeoutMs;
  let lastErr = null;
  while (Date.now() < deadline) {
    try {
      const v = await evaluate(cdp, fnExpr);
      if (v) return v;
    } catch (e) { lastErr = e.message; }
    await sleep(intervalMs || 1000);
  }
  throw new Error("timeout waiting for: " + (label || fnExpr) + (lastErr ? " (last err: " + lastErr + ")" : ""));
}

function launchBrowser(binary, profileDir, headless) {
  return new Promise((resolve, reject) => {
    const args = [
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--remote-allow-origins=*",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=TranslateUI",
      "about:blank",
    ];
    if (headless) args.unshift("--headless=new", "--disable-gpu", "--no-sandbox");
    const child = spawn(binary, args, { stdio: ["ignore", "ignore", "pipe"] });
    let buf = "";
    let settled = false;
    child.stderr.on("data", (d) => {
      buf += d.toString();
      const m = buf.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)/);
      if (m && !settled) { settled = true; resolve({ child, port: parseInt(m[1], 10) }); }
    });
    child.on("error", (e) => { if (!settled) { settled = true; reject(new Error("launch failed: " + e.message)); } });
    child.on("exit", () => { if (!settled) { settled = true; reject(new Error("browser exited before CDP came up (profile lock? try --fresh)")); } });
    setTimeout(() => { if (!settled) { settled = true; reject(new Error("CDP port never appeared (15s)")); } }, 15000);
  });
}

async function connectPage(port) {
  const ver = await fetch(`http://127.0.0.1:${port}/json/version`).then((r) => r.json());
  let list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
  let page = list.find((t) => t.type === "page");
  if (!page) {
    page = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`).then((r) => r.json());
  }
  const cdp = new CDP(page.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Network.enable");
  cdp.on("Runtime.exceptionThrown", (p) => {
    const d = p && p.exceptionDetails;
    if (d) {
      cdp.errors.push(String((d.exception && d.exception.description) || d.text).slice(0, 300));
    }
  });
  cdp.on("Network.requestWillBeSent", (p) => {
    cdp.reqMap = cdp.reqMap || {};
    if (p.requestId) cdp.reqMap[p.requestId] = (p.request && p.request.url || "").slice(0, 130);
  });
  cdp.on("Network.responseReceived", (p) => {
    const r = p && p.response;
    if (r && /aw_acp|checkout\/cart|product-added|addproduct/i.test(r.url)) {
      cdp.network.push({ status: r.status, url: r.url.slice(-110), mime: r.mimeType || "" });
    }
  });
  cdp.on("Network.loadingFailed", (p) => {
    cdp.network.push({ error: p.errorText || "failed", url: (cdp.reqMap && cdp.reqMap[p.requestId]) || "(unknown request)" });
  });
  return { cdp, version: ver.Browser };
}

async function navigate(cdp, url, settleMs) {
  await cdp.send("Page.navigate", { url });
  // Tolerant of Cloudflare challenges: a fresh profile can sit at "loading"
  // until the user solves the Turnstile, so we never hard-fail on readyState.
  let state = null;
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try { state = await evaluate(cdp, "document.readyState"); } catch (_) { state = null; }
    if (state === "complete") break;
    await sleep(500);
  }
  await sleep(settleMs || 1500);
  const title = await evaluate(cdp, "document.title").catch(() => "");
  const href = await evaluate(cdp, "location.href").catch(() => "");
  return { title, url: href, readyState: state };
}

/* ------------------------------------------------------------------ */
/* 5. Actions                                                           */
/* ------------------------------------------------------------------ */
async function actNavigate(cdp, site, args) {
  const info = await navigate(cdp, args.url);
  const btn = await evaluate(cdp, findATCExpr(site));
  return {
    action: "navigate",
    site: site.label,
    url: info.url,
    title: info.title,
    addToCartVisible: !!btn,
    addToCartText: btn ? btn.text : null,
  };
}

function findATCExpr(site) {
  const sels = site.addToCart.map((s) => JSON.stringify(s)).join(", ");
  return `(() => {
    var b = document.querySelector(${sels});
    if (!b) return null;
    var r = b.getBoundingClientRect();
    return { found: true, visible: r.width > 0 && r.height > 0, text: (b.innerText || '').trim().slice(0, 80), tag: b.tagName, cls: (b.className || '').toString().slice(0, 120) };
  })()`;
}

function clickATCExpr(site) {
  const sels = site.addToCart.map((s) => JSON.stringify(s)).join(", ");
  return `(() => { var b = document.querySelector(${sels}); if (!b) return false; b.click(); return true; })()`;
}

async function realClick(cdp, site) {
  const rect = await evaluate(cdp, `(() => {
    var b = document.querySelector(${site.addToCart.map((s) => JSON.stringify(s)).join(", ")});
    if (!b) return null;
    var r = b.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })()`);
  if (!rect) return false;
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: rect.x, y: rect.y, button: "left", clickCount: 1 });
  return true;
}

async function openPopup(cdp, site, waitMs) {
  // JS .click() — the site's add-to-cart handler listens for click and the
  // cart counter updates reliably with it (synthetic Input mouse events
  // did NOT trigger it on this site).
  const ok = await evaluate(cdp, clickATCExpr(site));
  if (!ok) await realClick(cdp, site);
  // The popup first shows a progress loader; the real content arrives in
  // [data-role="update"] only when the site's AJAX has finished. Poll for it.
  const deadline = Date.now() + Math.max(waitMs, 20000);
  while (Date.now() < deadline) {
    const upd = await evaluate(cdp, `(() => {
      var p = document.querySelector(${JSON.stringify(site.popup)});
      if (!p) return null;
      var u = p.querySelector('[data-role="update"]');
      if (!u) return null;
      if (u.innerHTML.length > 50) return true;
      return false;
    })()`);
    if (upd) { await sleep(1500); return true; }
    await sleep(1000);
  }
  return false;
}

const popupDumpExpr = (site) => `(() => {
  var p = document.querySelector(${JSON.stringify(site.popup)});
  if (!p) return null;
  var u = p.querySelector('[data-role="update"]') || p;
  var rel = p.querySelector('[data-role="related"]');
  return {
    title: (u.querySelector('.layer__checkout__title') || {}).innerText || '',
    cart_net_sum: (u.querySelector('input[name="cart_net_sum"]') || {}).value || null,
    freeshipping: (u.querySelector('input[name="freeshipping"]') || {}).value || null,
    productTitle: (u.querySelector('.layer__checkout__product__title, .layer__checkout__product .product__title a') || {}).innerText || '',
    productInfo: (u.querySelector('.layer__checkout__product__info, .layer__checkout__product .product__info') || {}).innerText || '',
    finalPrice: (u.querySelector('.final, .layer__checkout__product__price .final') || {}).innerText || '',
    relatedHTMLlen: rel ? rel.innerHTML.length : -1,
    relatedTiles: rel ? Array.prototype.map.call(rel.querySelectorAll('li, .product-item, .product__item, .swiper-slide, .eg-sm25-tile'), function (t) {
      return { cls: (t.className || '').toString().slice(0, 100), txt: (t.innerText || '').replace(/\\s+/g, ' ').slice(0, 160) };
    }) : [],
    relatedFirstHTML: rel ? rel.innerHTML.slice(0, 1500) : null,
    popupHTML: p.outerHTML.slice(0, 4000)
  };
})()`;

async function actAtc(cdp, site, args) {
  await navigate(cdp, args.url);
  const btn = await waitFor(cdp, findATCExpr(site), 20000, 1000, "add-to-cart button");
  await sleep(800);
  const popupOpened = await openPopup(cdp, site, args.waitMs);
  // Let the related-products AJAX settle before dumping.
  if (popupOpened) {
    const rDeadline = Date.now() + 9000;
    while (Date.now() < rDeadline) {
      const rLen = await evaluate(cdp, `(() => { var r = document.querySelector('${site.popup} [data-role="related"]'); return r ? r.innerHTML.length : 0; })()`);
      if (rLen > 50) break;
      await sleep(800);
    }
  }
  const result = {
    action: "atc",
    site: site.label,
    url: await evaluate(cdp, "location.href"),
    addToCartButton: btn,
    popupOpened,
    popup: popupOpened ? await evaluate(cdp, popupDumpExpr(site)) : null,
    popupStuckHTML: !popupOpened ? await evaluate(cdp, `(() => { var p = document.querySelector(${JSON.stringify(site.popup)}); return p ? p.outerHTML.slice(0, 1500) : null; })()`) : null,
    popupsAll: !popupOpened ? await evaluate(cdp, `(() => Array.prototype.map.call(document.querySelectorAll('.aw-acp-popup'), function (p) {
      return { cls: (p.className || '').toString(), update: !!p.querySelector('[data-role="update"]'), len: (p.querySelector('[data-role="update"]') || { innerHTML: '' }).innerHTML.length, first: (p.innerHTML || '').slice(0, 200) };
    }))()`) : null,
    counter: await evaluate(cdp, `(() => { var c = document.querySelector(${JSON.stringify(site.counter)}); return c ? c.innerText.trim() : null; })()`),
  };
  if (args.screenshot && popupOpened) result.screenshot = await captureScreenshot(cdp, args.screenshot);
  if (cdp.errors.length) result.pageErrors = cdp.errors;
  if (cdp.network.length) result.network = cdp.network;
  return result;
}

function injectVariationExpr(js, css) {
  // Generic idempotency guard: derive the variation's own body class from the
  // injected JS instead of hardcoding a client's class here.
  const m = js.match(/body\.classList\.add\(\s*['"]([^'"]+)['"]\s*\)/);
  const cls = m ? m[1] : "EG-REV-AB06-HP";
  return `(function () {
    if (document.body.classList.contains(${JSON.stringify(cls)})) return true;
    var st = document.createElement('style');
    st.textContent = ${JSON.stringify(css)};
    document.head.appendChild(st);
    var run = new Function(${JSON.stringify(js)});
    run();
    return true;
  })()`;
}

/* ------------------------------------------------------------------ */
/* 5b. Data-driven QA spec engine                                       */
/* ------------------------------------------------------------------ */
// A spec.json lives in the test folder and drives ALL golden checks, so a new
// test never needs qa_run.js edits. Tokens {popup} {title} {update} {related}
// {relatedTitle} {relatedTile} {counter} resolve from the SITES profile.
//
// spec shape:
//   { "settle": { "marker": "{popup} .eg-sm25-check", "markerTimeoutMs": 12000,
//                 "related": "{popup} [data-role=\"related\"] .eg-sm25-tile",
//                 "relatedTimeoutMs": 9000, "extraMs": 1500 },
//     "checks": [
//       { "check": "success title", "op": "eq", "selector": "{title}", "expect": "Artikel hinzugefügt" },
//       { "check": "white header",  "op": "css", "selector": "{title}", "prop": "backgroundColor", "expect": "rgb(255, 255, 255)" },
//       { "check": "two CTAs",      "op": "js",  "expr": "(function(){ var a=document.querySelectorAll({popup}+' .eg-sm25-actions a'); return { pass: a.length===2, detail: 'links='+a.length }; })()" }
//     ] }
//
// ops: exists | not | eq | match | count | countLte | css | js
//   css uses prop (and optional pseudo e.g. "::before"); js expr must return {pass, detail}.
function resolveTokens(str, site, quote) {
  const tok = {
    popup: site.popup, title: site.title, update: site.update, related: site.related,
    relatedTitle: site.relatedTitle, relatedTile: site.relatedTile, counter: site.counter,
  };
  return String(str).replace(/\{(\w+)\}/g, (m, k) => (tok[k] !== undefined ? (quote ? JSON.stringify(tok[k]) : tok[k]) : m));
}

function buildCheckExpr(c, site) {
  const sel = resolveTokens(c.selector || "", site, false);
  const selJ = JSON.stringify(sel);
  const expJ = JSON.stringify(c.expect);
  switch (c.op) {
    case "exists":
      return `(() => { var el = document.querySelector(${selJ}); return { pass: !!el, detail: el ? (el.tagName + '.' + String(el.className||'').slice(0,50)) : 'not found' }; })()`;
    case "not":
      return `(() => { var n = document.querySelectorAll(${selJ}).length; return { pass: n === 0, detail: 'found=' + n }; })()`;
    case "eq":
      return `(() => { var el = document.querySelector(${selJ}); var t = el ? (el.textContent||'').trim() : null; return { pass: t === ${expJ}, detail: String(t) }; })()`;
    case "match":
      return `(() => { var el = document.querySelector(${selJ}); var t = el ? (el.textContent||'').trim() : ''; try { var re = new RegExp(${expJ}); return { pass: re.test(t), detail: t.slice(0,120) }; } catch (e) { return { pass: false, detail: 'bad regex: ' + e.message }; } })()`;
    case "count":
      return `(() => { var n = document.querySelectorAll(${selJ}).length; return { pass: n === ${c.expect}, detail: 'count=' + n }; })()`;
    case "countLte":
      return `(() => { var n = document.querySelectorAll(${selJ}).length; return { pass: n <= ${c.expect}, detail: 'count=' + n }; })()`;
    case "css": {
      const propJ = JSON.stringify(c.prop);
      const pseudo = c.pseudo ? JSON.stringify(c.pseudo) : null;
      const access = pseudo
        ? `(getComputedStyle(el, ${pseudo}).content || 'none')`
        : `String(getComputedStyle(el)[${propJ}] || '')`;
      return `(() => { var el = document.querySelector(${selJ}); if (!el) return { pass: false, detail: 'not found' }; var v = ${access}; return { pass: String(v).trim() === ${expJ}, detail: String(v) }; })()`;
    }
    case "js": {
      const expr = resolveTokens(c.expr, site, true);
      return `(function () { try { var __r = ${expr}; return { pass: !!__r.pass, detail: __r.detail != null ? String(__r.detail) : '' }; } catch (e) { return { pass: false, detail: 'JS ERR: ' + e.message }; } })()`;
    }
    default:
      throw new Error("unknown check op: " + c.op);
  }
}

async function runSpecChecks(cdp, site, spec) {
  const checks = [];
  for (const c of (spec.checks || [])) {
    const row = { check: c.check || "?", pass: false, detail: "" };
    try {
      const r = await evaluate(cdp, buildCheckExpr(c, site));
      row.pass = !!r.pass;
      row.detail = String(r.detail != null ? r.detail : "");
    } catch (e) {
      row.detail = "ERR: " + e.message;
    }
    checks.push(row);
  }
  return checks;
}

async function settlePage(cdp, site, spec) {
  const st = (spec && spec.settle) || {};
  const marker = resolveTokens(st.marker || "{popup} .eg-sm25-check", site, false);
  // Skip the marker poll for section flows with no spec marker (marker resolves
  // to a "undefined ..." string that can never match).
  if (marker && marker.indexOf("undefined") === -1) {
    const mDeadline = Date.now() + (st.markerTimeoutMs || 12000);
    while (Date.now() < mDeadline) {
      const ok = await evaluate(cdp, `!!document.querySelector(${JSON.stringify(marker)})`);
      if (ok) break;
      await sleep(500);
    }
  }
  if (st.related) {
    const relSel = resolveTokens(st.related, site, false);
    const rDeadline = Date.now() + (st.relatedTimeoutMs || 9000);
    while (Date.now() < rDeadline) {
      const n = await evaluate(cdp, `document.querySelectorAll(${JSON.stringify(relSel)}).length`);
      if (n > 0) break;
      await sleep(700);
    }
  }
  // Optional: bring the target section into view (useful for section-test
  // screenshots of below-the-fold areas).
  if (st.scrollTo) {
    const sSel = resolveTokens(st.scrollTo, site, false);
    await evaluate(cdp, `(() => { var el = document.querySelector(${JSON.stringify(sSel)}); if (el) el.scrollIntoView({ block: 'center' }); return true; })()`).catch(() => {});
    await sleep(600);
  }
  await sleep(st.extraMs || 1500);
}

async function actQa(cdp, site, args) {
  const base = { action: "qa", site: site.label, url: args.url };
  if (!args.injectDir) return { ...base, error: "--inject <variation1-dir> is required for action qa" };

  const jsFile = path.join(args.injectDir, "variation.js");
  const cssFile = path.join(args.injectDir, "variation.css");
  if (!fs.existsSync(jsFile)) return { ...base, error: `variation.js not found in ${args.injectDir}` };
  const js = fs.readFileSync(jsFile, "utf8");
  const css = fs.existsSync(cssFile) ? fs.readFileSync(cssFile, "utf8") : "";

  await navigate(cdp, args.url);
  await waitFor(cdp, `!!document.body`, 10000, 500, "document.body");
  await evaluate(cdp, injectVariationExpr(js, css));
  await sleep(1500);

  // Section flow: sites with an empty addToCart[] have no ATC-popup to open
  // (e.g. homepage section tests) — go straight to settle + spec checks.
  const isSectionFlow = !(site.addToCart && site.addToCart.length);
  let popupOpened = false;
  if (isSectionFlow && !args.spec) return { ...base, error: "section flow requires --spec (spec.json with checks)" };
  if (!isSectionFlow) {
    const btn = await waitFor(cdp, findATCExpr(site), 20000, 1000, "add-to-cart button");
    popupOpened = await openPopup(cdp, site, args.waitMs);
    if (!popupOpened) return { ...base, popupOpened: false, assertions: [{ check: "popup opens", pass: false, detail: "no " + site.popup + " after ATC" }] };
  }

  // Settle: the site re-renders the update node after open, and the variation
  // poll re-decorates once markers are wiped. Wait for our markers, then let
  // the related-products AJAX fill in before asserting.
  await settlePage(cdp, site, args.spec);

  // Assertions come from the test's spec.json (data-driven). If none was
  // provided, fall back to the built-in PRAXINDO/SM25 checks.
  const checks = args.spec ? await runSpecChecks(cdp, site, args.spec) : await sm25BuiltinChecks(cdp, site);

  const result = { ...base, assertions: checks, passCount: checks.filter((c) => c.pass).length, total: checks.length };
  if (!isSectionFlow) {
    result.popupOpened = popupOpened;
    result.domDiag = await evaluate(cdp, `(() => {
    var out = {};
    out.markers = {
      check: document.querySelectorAll('.eg-sm25-check').length,
      progress: document.querySelectorAll('.eg-sm25-progress').length,
      actions: document.querySelectorAll('.eg-sm25-actions').length,
      trust: document.querySelectorAll('.eg-sm25-trust').length,
      login: document.querySelectorAll('.eg-sm25-login').length
    };
    out.popups = Array.prototype.map.call(document.querySelectorAll('.aw-acp-popup'), function (p) {
      var t = p.querySelector('.layer__checkout__title');
      return { cls: (p.className || '').toString().slice(0, 60), title: t ? t.textContent.slice(0, 40) : '', updateLen: (p.querySelector('[data-role="update"]') || { innerHTML: '' }).innerHTML.length };
    });
    var up = document.querySelector(${JSON.stringify(site.popup + " [data-role=\"update\"]")});
    out.updateHTML = up ? up.innerHTML.slice(0, 2500) : null;
    return out;
  })()`);
  }
  if (args.screenshot) result.screenshot = await captureScreenshot(cdp, args.screenshot);
  return result;
}

async function captureScreenshot(cdp, file) {
  const res = await cdp.send("Page.captureScreenshot", { format: "png" });
  const buf = Buffer.from(res.data, "base64");
  fs.writeFileSync(file, buf);
  return file + " (" + buf.length + " bytes)";
}

/* ------------------------------------------------------------------ */
/* 5c. Built-in fallback checks (PRAXINDO SM25) — used when no spec.json */
/* ------------------------------------------------------------------ */
async function sm25BuiltinChecks(cdp, site) {
  const checks = [];
  const titleText = await evaluate(cdp, `(() => { var t = document.querySelector(${JSON.stringify(site.title)}); return t ? t.textContent.trim() : null; })()`);
  checks.push({ check: "success title text", pass: titleText === "Artikel hinzugefügt", detail: String(titleText) });

  checks.push({ check: "check circle injected (.eg-sm25-check)", pass: await evaluate(cdp, `!!document.querySelector('${site.popup} .eg-sm25-check')`) });
  checks.push({ check: "count line (.eg-sm25-count)", pass: await evaluate(cdp, `/Im Warenkorb befinden sich jetzt \\d+ Artikel/.test((document.querySelector('${site.popup} .eg-sm25-count')||{}).textContent||'')`) });
  checks.push({ check: "progress bar (.eg-sm25-progress)", pass: await evaluate(cdp, `!!document.querySelector('${site.popup} .eg-sm25-progress')`) });

  // header must be WHITE (site default is green #63ab0f)
  checks.push({
    check: "header is white (no green band)",
    pass: await evaluate(cdp, `(() => { var t = document.querySelector(${JSON.stringify(site.title)}); return t ? getComputedStyle(t).backgroundColor === 'rgb(255, 255, 255)' : false; })()`),
    detail: await evaluate(cdp, `(() => { var t = document.querySelector(${JSON.stringify(site.title)}); return t ? getComputedStyle(t).backgroundColor : null; })()`),
  });

  // close X: site's own button present and NO custom pseudo cross
  checks.push({ check: "close X present", pass: await evaluate(cdp, `!!document.querySelector('${site.popup} .layer__checkout__close')`) });
  checks.push({
    check: "no fake pseudo cross",
    pass: await evaluate(cdp, `(() => { var b = document.querySelector('${site.popup} .layer__checkout__close'); if (!b) return false; return (getComputedStyle(b, '::before').content || 'none') === 'none' && (getComputedStyle(b, '::after').content || 'none') === 'none'; })()`),
  });

  // CTA links
  const ctaOk = await evaluate(cdp, `(() => {
    var a = document.querySelectorAll('${site.popup} .eg-sm25-actions a');
    if (a.length !== 2) return false;
    var h = [];
    for (var i = 0; i < a.length; i++) h.push(a[i].getAttribute('href'));
    return h.indexOf('/checkout/cart') !== -1 && h.indexOf('/checkout/onepage') !== -1;
  })()`);
  checks.push({ check: "CTAs ZUM WARENKORB + ZUR KASSE", pass: ctaOk });

  // trust badges: 3 items
  checks.push({ check: "trust badges x3", pass: await evaluate(cdp, `document.querySelectorAll('${site.popup} .eg-sm25-trust__item').length === 3`) });

  // login bar (guests only — report, not fail)
  const loginBar = await evaluate(cdp, `!!document.querySelector('${site.popup} .eg-sm25-login')`);
  checks.push({ check: "login bar visible", pass: loginBar, detail: "guests only — expected on logged-out profile" });

  // related: heading renamed + at most 2 visible tiles (settled above)
  const relatedOk = await evaluate(cdp, `(() => {
    var rel = document.querySelector(${JSON.stringify(site.related)});
    if (!rel) return { heading: false, tiles: 0, hidden: 0, capped: 0, headingText: '' };
    var h = rel.querySelector('.eg-sm25-related__title');
    var headingText = '';
    if (h) headingText = h.textContent.trim();
    else {
      var els = rel.querySelectorAll('.title, .block-title, .aw-acp-popup__related__title, .layer__checkout__upselling__title');
      for (var i = 0; i < els.length; i++) { var t = (els[i].textContent || '').trim(); if (t.indexOf('H\u00e4ufig zusammen bestellt') !== -1) { headingText = t; break; } }
    }
    var all = rel.querySelectorAll('.layer__checkout__upselling__list__item, .eg-sm25-tile');
    var tiles = 0, hidden = 0;
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.getAttribute('data-q-checked')) continue;
      el.setAttribute('data-q-checked', '1');
      tiles++;
      if (el.style.display === 'none') hidden++;
    }
    var capped = 0;
    var decorated = rel.querySelectorAll('.eg-sm25-tile');
    for (var k = 0; k < decorated.length; k++) if (decorated[k].style.display !== 'none') capped++;
    return { heading: headingText !== '', tiles: tiles, hidden: hidden, capped: capped, headingText: headingText };
  })()`);
  checks.push({ check: "related heading renamed to Häufig zusammen bestellt", pass: relatedOk.heading, detail: relatedOk.headingText });
  checks.push({ check: "related shows at most 2 tiles", pass: relatedOk.capped > 0 && relatedOk.capped <= 2, detail: JSON.stringify({ items: relatedOk.tiles, hidden: relatedOk.hidden, visibleCapped: relatedOk.capped }) });

  // minicart counter matches count line
  const counter = await evaluate(cdp, `(() => { var c = document.querySelector(${JSON.stringify(site.counter)}); return c ? c.innerText.trim() : null; })()`);
  checks.push({
    check: "count line matches minicart counter",
    pass: await evaluate(cdp, `/\\d+/.test((document.querySelector('${site.popup} .eg-sm25-count')||{}).textContent||'')`),
    detail: "counter=" + String(counter),
  });
  return checks;
}

/* ------------------------------------------------------------------ */
/* 6. Main                                                              */
/* ------------------------------------------------------------------ */
function parseArgs(argv) {
  const out = { browser: "auto", profile: "praxindo", action: "atc", waitMs: 4000, screenshot: null, out: null, injectDir: null, url: null, spec: null, headless: false, fresh: false };
  let first = true;
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (first && !a.startsWith("--")) { out.action = a; first = false; continue; }
    first = false;
    if (a === "--browser") out.browser = val();
    else if (a === "--profile") out.profile = val();
    else if (a === "--action") out.action = val();
    else if (a === "--url") out.url = val();
    else if (a === "--inject") out.injectDir = val();
    else if (a === "--spec") out.spec = val();
    else if (a === "--screenshot") out.screenshot = val();
    else if (a === "--out") out.out = val();
    else if (a === "--wait-ms") out.waitMs = parseInt(val(), 10) || 4000;
    else if (a === "--headless") out.headless = true;
    else if (a === "--fresh") out.fresh = true;
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const browser = detectBrowser(args.browser);
  if (browser.error) { console.error("ERROR: " + browser.error); process.exit(2); }
  if (args.spec) {
    const specFile = fs.existsSync(args.spec) && fs.statSync(args.spec).isFile()
      ? args.spec
      : path.join(args.spec, "spec.json");
    if (!fs.existsSync(specFile)) { console.error("ERROR: --spec file not found: " + specFile); process.exit(2); }
    try { args.spec = JSON.parse(fs.readFileSync(specFile, "utf8")); }
    catch (e) { console.error("ERROR: invalid spec JSON in " + specFile + " — " + e.message); process.exit(2); }
    console.error(`[qa_run] spec loaded from ${specFile} (${(args.spec.checks || []).length} checks)`);
    if (args.spec.profile) args.profile = args.spec.profile;
    if (!args.url && args.spec.url) args.url = args.spec.url;
    if (!args.injectDir && args.spec.inject) args.injectDir = path.resolve(path.dirname(specFile), args.spec.inject);
  }
  const site = SITES[args.profile];
  if (!site) { console.error("ERROR: unknown profile \"" + args.profile + "\" (available: " + Object.keys(SITES).join(", ") + ")"); process.exit(2); }
  if (["login", "atc", "qa"].indexOf(args.action) !== -1 && !args.url) { console.error("ERROR: --url <page-url> is required for action " + args.action); process.exit(2); }
  if (args.action === "qa" && !args.injectDir) { console.error("ERROR: --inject <variation1-dir> is required for action qa (or set spec.inject)"); process.exit(2); }

  const profileDir = path.join(os.homedir(), ".ab-test-kit", "browser-profiles", args.profile + "-" + browser.name);
  fs.mkdirSync(profileDir, { recursive: true });
  if (args.fresh) fs.rmSync(profileDir, { recursive: true, force: true });

  console.error(`[qa_run] browser=${browser.label} profile=${args.profile} action=${args.action}`);
  if (!args.headless) console.error(`[qa_run] headed mode — first run: log in / solve Cloudflare in the opened window`);

  const { child, port } = await launchBrowser(browser.path, profileDir, args.headless);
  let cdp = null;
  try {
    const conn = await connectPage(port);
    cdp = conn.cdp;
    console.error(`[qa_run] connected ${conn.version}`);

    let result;
    if (args.action === "navigate") result = await actNavigate(cdp, site, args);
    else if (args.action === "login") {
      await navigate(cdp, args.url);
      console.error(`[qa_run] log in now in the opened window. Waiting ${args.waitMs}ms...`);
      await sleep(args.waitMs);
      result = { action: "login", site: site.label, url: args.url, waitedMs: args.waitMs, note: "cookies saved to " + profileDir };
    } else if (args.action === "atc") result = await actAtc(cdp, site, args);
    else if (args.action === "qa") result = await actQa(cdp, site, args);
    else { console.error("ERROR: unknown action \"" + args.action + "\""); process.exit(2); }

    const output = JSON.stringify(result, null, 2);
    if (args.out) { fs.writeFileSync(args.out, output); console.error(`[qa_run] result written to ${args.out}`); }
    console.log(output);
  } finally {
    try { if (cdp) cdp.close(); } catch (_) {}
    try { child.kill(); } catch (_) {}
  }
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });

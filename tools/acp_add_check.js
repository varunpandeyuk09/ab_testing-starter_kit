// tools/acp_add_check.js - Headless-Edge CDP add-to-cart popup auditor
// ------------------------------------------------------------------
// Launches headless Edge, opens a product page, clicks Add to Cart, waits
// for the AW ACP popup, and dumps its live DOM (cart sum, freeshipping,
// related products, counter). Verifies facts before building a variation.
//
// USAGE: node tools/acp_add_check.js <product-url> [wait-ms]
// PREREQ: Node >= 22 (native WebSocket) + MS Edge at default path.
// ------------------------------------------------------------------
const { execFile, spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const EDGE = process.env.MSEDGE || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PORT = 9229;
const url = process.argv[2] || "https://www.praxindo.de/";
const waitMs = parseInt(process.argv[3] || "3500", 10);
const profDir = fs.mkdtempSync(path.join(os.tmpdir(), "acp-prof-"));
const wsUrl = `ws://127.0.0.1:${PORT}/devtools/page/`;

let seq = 0;
const pending = new Map();
let sock = null;
let edge = null;

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    sock.send(JSON.stringify({ id, method, params }));
  });
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function evaluate(expression) {
  const res = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result.value;
}

async function main() {
  edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-sandbox",
    `--user-data-dir=${profDir}`, `--remote-debugging-port=${PORT}`,
    "--disable-features=TranslateUI", "--lang=de",
    "about:blank",
  ], { stdio: "ignore" });

  await sleep(2500);

  const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");

  sock = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { sock.onopen = res; sock.onerror = rej; });
  sock.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  };

  await send("Runtime.enable");
  await send("Page.enable");

  await send("Page.navigate", { url });
  await sleep(6000);

  // wait for add-to-cart button
  let btnInfo = null;
  for (let i = 0; i < 10; i++) {
    btnInfo = await evaluate(`(() => {
      var b = document.querySelector('#product-addtocart-button, .action.tocart, button[data-role="addtocart"], form[data-role="tocart-form"] button, .box-tocart button');
      if (!b) return null;
      var r = b.getBoundingClientRect();
      return { found: true, text: (b.innerText||'').trim().slice(0,60), tag: b.tagName, cls: b.className.toString().slice(0,120), visible: r.width>0 && r.height>0, atcCount: document.querySelectorAll('.action.tocart, #product-addtocart-button').length };
    })()`);
    if (btnInfo && btnInfo.found) break;
    await sleep(1500);
  }

  const result = { url, pageTitle: await evaluate(`document.title`) };
  result.addToCartBtn = btnInfo;

  if (btnInfo && btnInfo.visible) {
    await evaluate(`(() => {
      var b = document.querySelector('#product-addtocart-button, .action.tocart, button[data-role="addtocart"], form[data-role="tocart-form"] button, .box-tocart button');
      b.click();
    })()`);
    await sleep(waitMs);

    result.popup = await evaluate(`(() => {
      var p = document.querySelector('.aw-acp-popup.layer__checkout--active[data-role="update"], .layer__checkout--active');
      if (!p) return null;
      return {
        title: (p.querySelector('.layer__checkout__title')||{}).innerText || '',
        cart_net_sum: (p.querySelector('input[name="cart_net_sum"]')||{}).value || null,
        freeshipping: (p.querySelector('input[name="freeshipping"]')||{}).value || null,
        productTitle: (p.querySelector('.layer__checkout__product__title')||{}).innerText || '',
        productInfo: (p.querySelector('.layer__checkout__product__info')||{}).innerText || '',
        finalPrice: (p.querySelector('.final')||{}).innerText || '',
        oldPrice: (() => { var o = p.querySelector('.old-price .price, .__was .price, del .price'); return o ? o.innerText : null })(),
        imgSrc: (() => { var s = p.querySelector('.layer__checkout__product__image span'); return s ? (s.style.backgroundImage || '') : '' })(),
        relatedHTMLlen: (p.querySelector('[data-role="related"]')||{innerHTML:''}).innerHTML.length,
        relatedTiles: (() => { var r = p.querySelector('[data-role="related"]'); if (!r) return []; var tiles = r.querySelectorAll('li, .product-item, .product__item, .swiper-slide'); return Array.prototype.map.call(tiles, function(t){ return { cls: t.className.toString().slice(0,100), txt: (t.innerText||'').replace(/\\s+/g,' ').slice(0,160) } }) })(),
        relatedHTML: (p.querySelector('[data-role="related"]')||{innerHTML:''}).innerHTML.slice(0, 2500)
      };
    })()`);

    result.counter = await evaluate(`(document.querySelector('#minicart-counter')||{}).innerText || null`);
    result.miniCart = await evaluate(`(() => {
      var w = document.querySelector('#minicart-content-wrapper');
      return w ? w.innerText.replace(/\\s+/g,' ').slice(0,400) : null;
    })()`);
  }

  console.log(JSON.stringify(result, null, 2));
  sock.close();
  edge.kill();
  fs.rmSync(profDir, { recursive: true, force: true });
}

main().catch((e) => { console.error("ERROR:", e.message); try { edge && edge.kill(); } catch (_) {} try { fs.rmSync(profDir, { recursive: true, force: true }); } catch (_) {} process.exit(1); });

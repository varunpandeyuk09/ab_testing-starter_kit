#!/usr/bin/env node
// Fast local static checks before handing a test to the user for QA.
// This checks project conventions only; it never replaces user QA.

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function read(file) { return fs.readFileSync(file, "utf8"); }
function hash(file) { return crypto.createHash("sha1").update(read(file)).digest("hex"); }
function exists(file) { return fs.existsSync(file); }
function add(result, level, message) { result.push({ level, message }); }

function main() {
  const testDir = process.argv[2];
  if (!testDir) {
    console.error('Usage: node tools/preflight_check.js "<test folder>"');
    process.exit(2);
  }
  const absolute = path.resolve(testDir);
  const kit = path.resolve(__dirname, "..");
  const v1 = path.join(absolute, "variation1");
  const jsFile = path.join(v1, "variation.js");
  const cssFile = path.join(v1, "variation.css");
  const results = [];
  [jsFile, cssFile, path.join(v1, "v1.json"), path.join(v1, "share.js")].forEach((file) => {
    if (!exists(file)) add(results, "FAIL", "Missing " + path.basename(file));
  });
  if (results.some((x) => x.level === "FAIL")) return report(results);

  const js = read(jsFile);
  const css = read(cssFile);
  const classMatch = js.match(/body\.classList\.add\(\s*['"](EG-[^'"]+)['"]/);
  if (!classMatch) add(results, "FAIL", "variation.js does not add an EG- body class inside init()");
  else if (css.indexOf("." + classMatch[1]) === -1) add(results, "FAIL", "variation.css is not scoped under ." + classMatch[1]);
  if (hash(jsFile) === hash(path.join(kit, "variation1", "variation.js"))) add(results, "FAIL", "variation.js is still the blank template");
  if (hash(cssFile) === hash(path.join(kit, "variation1", "variation.css"))) add(results, "FAIL", "variation.css is still the blank template");
  if (js.indexOf("<TEST-ID>") !== -1 || css.indexOf("<TEST-ID>") !== -1 || js.indexOf("<required-selector>") !== -1 || css.indexOf("<Test Name>") !== -1) {
    add(results, "FAIL", "Replace all variation template placeholders before handover");
  }
  try { JSON.parse(read(path.join(v1, "v1.json"))); } catch (_) { add(results, "FAIL", "v1.json is invalid JSON"); }

  const forbidden = [
    { re: /contains\s*\(/, label: "contains() selector" },
    { re: /\.row\b|\.col-(?:\w+-)?\d+\b|\.container\b/, label: "Bootstrap/grid anchor" },
    { re: /\.bg-gradient\b|\.text-white\b|\.shadow-sm\b|\.font-bold\b/, label: "visual utility anchor" },
    { re: /:nth-child\(/, label: "positional selector" },
    { re: /querySelector\(\s*['"]#\d/, label: "numeric ID selector" }
  ];
  forbidden.forEach((item) => {
    if (item.re.test(js) || item.re.test(css)) add(results, "WARN", "Review possible " + item.label);
  });
  if (!/waitForElement\([^,]+,\s*init,\s*50,\s*15000\)/.test(js)) add(results, "WARN", "Confirm waitForElement() guards init() with the standard 50/15000 timing");
  if (!results.length) add(results, "PASS", "Static preflight passed");
  report(results);
}

function report(results) {
  results.forEach((x) => console.log("[" + x.level + "] " + x.message));
  process.exit(results.some((x) => x.level === "FAIL") ? 1 : 0);
}

main();

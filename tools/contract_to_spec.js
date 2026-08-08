#!/usr/bin/env node
// tools/contract_to_spec.js — design_contract.json → spec.json generator
// --------------------------------------------------------------------------
// Turns the per-test DESIGN CONTRACT (AI_DATA/design_contract.json, written at
// build time from the Figma/design understanding) into the data-driven spec.json
// that tools/qa_run.js executes. Mapping is deterministic and loss-free:
//   contract.layout → geom ops      (geometry: same-top, left-of, width-pct, …)
//   contract.tokens → css ops       (computed-style assertions; hex → rgb)
//   contract.copy   → eq ops        (text content equality)
// Behavioral checks (clicks, async waits, page-errors) are NOT derivable from a
// design — the AI appends them by hand after generation (spec.noPageErrors,
// settle.*, behavioral js checks).
//
// USAGE:
//   node tools/contract_to_spec.js \
//       --contract "<TEST>/AI_DATA/design_contract.json" \
//       --out "<TEST>/AI_DATA/spec.json" \
//       [--profile monash] [--url https://…] [--inject ../variation1]
// (profile/url/inject are optional — without them placeholders are written.)
// --------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === "--contract") out.contract = val();
    else if (a === "--out") out.out = val();
    else if (a === "--profile") out.profile = val();
    else if (a === "--url") out.url = val();
    else if (a === "--inject") out.inject = val();
  }
  return out;
}

function hexToRgb(hex) {
  const m = String(hex).trim().match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.contract || !args.out) {
    console.error("ERROR: --contract <design_contract.json> and --out <spec.json> are required");
    process.exit(2);
  }
  if (!fs.existsSync(args.contract)) {
    console.error("ERROR: contract not found: " + args.contract);
    process.exit(2);
  }
  const contract = JSON.parse(fs.readFileSync(args.contract, "utf8"));
  const checks = [];

  for (const t of contract.tokens || []) {
    if (!t.name || !t.selector || !t.prop) continue;
    const rgb = hexToRgb(t.value);
    const expect = rgb || String(t.value);
    const row = {
      check: "design: " + t.name,
      op: "css",
      selector: t.selector,
      prop: t.prop,
      expect,
    };
    if (t.pseudo) row.pseudo = t.pseudo;
    checks.push(row);
  }

  for (let i = 0; i < (contract.layout || []).length; i++) {
    const l = contract.layout[i];
    const row = {
      check: "layout[" + i + "]: " + l.relation + (l.note ? " (" + l.note + ")" : ""),
      op: "geom",
      selectors: l.selectors,
      relation: l.relation,
    };
    if (l.tol != null) row.tol = l.tol;
    if (l.between) row.between = l.between;
    if (l.each) row.each = true;
    if (l.index != null) row.index = l.index;
    checks.push(row);
  }

  for (const c of contract.copy || []) {
    if (!c.name || !c.selector || c.text == null) continue;
    checks.push({ check: "copy: " + c.name, op: "eq", selector: c.selector, expect: String(c.text) });
  }

  const spec = {
    profile: args.profile || "<CLIENT-profile-key>",
    url: args.url || "<page-url>",
    inject: args.inject || "../variation1",
    settle: {},
    noPageErrors: true,
    checks,
  };
  fs.writeFileSync(args.out, JSON.stringify(spec, null, 2) + "\n");
  console.error(`[contract_to_spec] wrote ${args.out} (${checks.length} design checks: tokens=${(contract.tokens || []).length}, layout=${(contract.layout || []).length}, copy=${(contract.copy || []).length})`);
  console.error("[contract_to_spec] append behavioral checks (settle.*, js checks, pagination) by hand before running QA.");
}

main();

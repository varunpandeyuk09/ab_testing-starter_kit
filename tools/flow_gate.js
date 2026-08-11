#!/usr/bin/env node
// tools/flow_gate.js - MECHANICAL ENFORCEMENT of the kit flow (STEP 0b -> STEP 4).
// --------------------------------------------------------------------------
// AGENTS.md rule: run this gate AFTER EVERY STEP. If it prints a FAIL, the AI
// MUST fix that step before moving on. This is what stops a fresh AI (or a
// resumed session) from silently skipping steps — the gate, not prose, enforces
// the flow. It inspects only the TEST folder + the kit's knowledge files, so it
// is client- and AI-agnostic.
//
// USAGE:
//   node tools/flow_gate.js "<TEST_NAME folder path>"
//   node tools/flow_gate.js "../ABTESTSWITHAI/NMN/CART-AB06 Redesign mini cart"
//   node tools/flow_gate.js "<test dir>" --json     <- machine-readable output
//
// EXIT CODES:
//   0 = all steps PASS (flow complete, or only WARNs left)
//   1 = at least one step FAILS  -> AI MUST fix before the next step
//   2 = usage error / folder not found
// --------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const KIT = path.resolve(__dirname, "..");
const TEMPLATES = {
  variationJs: path.join(KIT, "variation1", "variation.js"),
  variationCss: path.join(KIT, "variation1", "variation.css"),
};

const hashOf = (file) => {
  try {
    return crypto.createHash("sha1").update(fs.readFileSync(file, "utf8")).digest("hex");
  } catch (_) { return null; }
};
const sameFile = (a, b) => { const x = hashOf(a); const y = hashOf(b); return x && y && x === y; };
const hasFile = (dir, name) => fs.existsSync(path.join(dir, name));
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch (_) { return false; } };
const listFiles = (dir) => { try { return fs.readdirSync(dir).map((n) => path.join(dir, n)); } catch (_) { return []; } };

function parseArgs(argv) {
  const out = { testDir: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") out.json = true;
    else if (!out.testDir) out.testDir = a;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.testDir) {
    console.error('ERROR: usage: node tools/flow_gate.js "<TEST_NAME folder path>" [--json]');
    process.exit(2);
  }
  const testDir = path.resolve(args.testDir);
  if (!isDir(testDir)) {
    console.error('ERROR: test folder not found: ' + testDir);
    process.exit(2);
  }
  const client = path.basename(path.dirname(testDir));
  const clientKey = String(client || "").toLowerCase();
  const aiData = path.join(testDir, "AI_DATA");
  const v1 = path.join(testDir, "variation1");
  const steps = [];
  const add = (step, name, status, detail) => steps.push({ step, name, status, detail });

  // ---- STEP 0b  Scaffold -------------------------------------------------
  const v1Missing = ["variation.js", "variation.css", "v1.json", "share.js"].filter((f) => !hasFile(v1, f));
  const ok0b = isDir(v1) && v1Missing.length === 0 && isDir(aiData);
  add("0b", "SCAFFOLD (variation1/ + AI_DATA/)", ok0b ? "PASS" : "FAIL",
    ok0b ? "variation1/ (4 files) + AI_DATA/ present" : "missing: " + (isDir(v1) ? v1Missing.join(", ") : "variation1/") + (isDir(aiData) ? "" : ", AI_DATA/"));

  // ---- STEP 0b.5  Input gate (user material) -----------------------------
  const uiDir = path.join(aiData, "user_inputs");
  const uiFiles = isDir(uiDir) ? listFiles(uiDir).filter((f) => !fs.statSync(f).isDirectory()) : [];
  const imgDir = path.join(uiDir, "test_images");
  const imgFiles = isDir(imgDir) ? listFiles(imgDir).filter((f) => !fs.statSync(f).isDirectory()) : [];
  let s05 = "PASS", d05 = "user_inputs/ present";
  if (!isDir(uiDir)) { s05 = "FAIL"; d05 = "AI_DATA/user_inputs/ missing — run the STEP 0b.5 input gate (ask user for material)"; }
  else if (uiFiles.length === 0 && imgFiles.length === 0) { s05 = "WARN"; d05 = "user_inputs/ empty — gate was opened? (missing material never blocks, but ASK was required)"; }
  else { d05 = "user_inputs/ has " + (uiFiles.length + imgFiles.length) + " file(s)"; }
  add("0b.5", "INPUT GATE (user_inputs/)", s05, d05);

  // ---- STEP 0c  Q&A gate record (qa_prep.json — written NOW, not STEP 4) --
  const qpFile = path.join(aiData, "qa_prep.json");
  let qpOk = false, qpDetail = "AI_DATA/qa_prep.json missing — Q&A gate (STEP 0c) not recorded";
  try {
    const qp = JSON.parse(fs.readFileSync(qpFile, "utf8"));
    const hasAnswers = Array.isArray(qp.asked) && qp.asked.length > 0;
    const hasVerified = Array.isArray(qp.verified) && qp.verified.length > 0;
    qpOk = !!qp.test && (hasAnswers || hasVerified);
    qpDetail = qpOk ? "qa_prep.json recorded (" + (qp.asked || []).length + " asked, " + (qp.verified || []).length + " verified)"
      : "qa_prep.json exists but has no test name / no asked or verified entries — run the Q&A gate and record answers";
  } catch (_) { qpDetail = fs.existsSync(qpFile) ? "qa_prep.json exists but is invalid JSON" : "AI_DATA/qa_prep.json missing — Q&A gate (STEP 0c) not recorded"; }
  add("0c", "Q&A GATE (qa_prep.json)", qpOk ? "PASS" : "FAIL", qpDetail);

  // ---- STEP 1  Research (client facts recorded in ClientData) --------------
  const profileJson = path.join(KIT, "ClientData", "site_profiles.json");
  const profileMd = path.join(KIT, "ClientData", "SITE_PROFILES.md");
  let hasProfile = false;
  try {
    const prof = JSON.parse(fs.readFileSync(profileJson, "utf8"));
    hasProfile = !!prof[clientKey];
  } catch (_) {}
  if (!hasProfile && client) {
    try {
      hasProfile = new RegExp("##\\s*" + client.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(fs.readFileSync(profileMd, "utf8"));
    } catch (_) {}
  }
  add("1", "RESEARCH (client profile)", hasProfile ? "PASS" : "FAIL",
    hasProfile ? client.toUpperCase() + " present in ClientData/site_profiles.json / SITE_PROFILES.md"
      : "no " + client.toUpperCase() + " entry in ClientData/ — verify the FOCUS_AREA live and record facts (STEP 4) before coding");

  // ---- STEP 2  Code ---------------------------------------------------------
  const jsFile = path.join(v1, "variation.js");
  const cssFile = path.join(v1, "variation.css");
  const jsReal = fs.existsSync(jsFile) && !sameFile(jsFile, TEMPLATES.variationJs);
  const cssReal = fs.existsSync(cssFile) && !sameFile(cssFile, TEMPLATES.variationCss);
  let egClass = false;
  try {
    const js = fs.readFileSync(jsFile, "utf8");
    egClass = /body\.classList\.add\(\s*['"](EG-[^'"]+)['"]/.test(js);
  } catch (_) {}
  const codeOk = jsReal && cssReal;
  const missingCode = (!fs.existsSync(jsFile) ? "variation.js " : jsReal ? "" : "variation.js(blank template) ") +
                      (!fs.existsSync(cssFile) ? "variation.css " : cssReal ? "" : "variation.css(blank template) ");
  add("2", "CODE (variation.js/.css)", codeOk ? "PASS" : "FAIL",
    codeOk ? (egClass ? "variation.js + .css written, EG- body class present" : "variation.js + .css written (WARN: no body.classList.add('EG-...') found)")
      : "missing: " + missingCode.trim());

  // ---- STEP 3  User QA handover (AI NEVER runs QA — the user QA's always) --
  const handoverFile = path.join(aiData, "user_qa.md");
  let s3 = "PASS", d3 = "user_qa.md written (what-to-check note for the user's own QA)";
  if (!hasFile(aiData, "user_qa.md")) {
    s3 = "FAIL";
    d3 = "AI_DATA/user_qa.md missing — write the handover note (what changed + what the user should verify). AI does NOT run QA; the user QA's every test.";
  }
  add("3", "USER QA HANDOVER (user_qa.md)", s3, d3);

  // ---- STEP 4  Knowledge loop ---------------------------------------------
  const metaFile = path.join(v1, "metadata.json");
  let metaOk = false, metaDetail = "variation1/metadata.json missing";
  try {
    const m = JSON.parse(fs.readFileSync(metaFile, "utf8"));
    metaOk = !!m.id && m.id !== "<TEST_ID>";
    metaDetail = metaOk ? "metadata.json filled (" + m.id + ")" : "metadata.json is the blank placeholder";
  } catch (_) {}
  const readmeOk = hasFile(aiData, "readme.md");
  const notesOk = hasFile(aiData, "session_notes.md");
  const k4Miss = [];
  if (!metaOk) k4Miss.push("metadata.json filled");
  if (!readmeOk) k4Miss.push("AI_DATA/readme.md");
  if (!notesOk) k4Miss.push("AI_DATA/session_notes.md");
  if (!hasProfile) k4Miss.push("client entry in ClientData/SITE_PROFILES.md + site_profiles.json");
  const k4Ok = k4Miss.length === 0;
  add("4", "KNOWLEDGE LOOP (docs + kit)", k4Ok ? "PASS" : "FAIL",
    k4Ok ? "metadata.json + readme.md + session_notes.md + profile done" : "missing: " + k4Miss.join(", "));

  // ---- Report ---------------------------------------------------------------
  const fails = steps.filter((s) => s.status === "FAIL");
  const warns = steps.filter((s) => s.status === "WARN");
  if (args.json) {
    console.log(JSON.stringify({ client, testDir, complete: fails.length === 0, steps }, null, 2));
  } else {
    console.log("flow gate  |  " + client.toUpperCase() + "  |  " + testDir);
    for (const s of steps) console.log("  [" + s.step + "] " + s.name + "  ->  " + s.status + "  " + s.detail);
    if (fails.length) {
      const first = fails[0];
      console.error("STOP at STEP " + first.step + " (" + first.name + ") — fix before the next step: " + first.detail);
      console.error("(" + fails.length + " step(s) failing — see lines above)");
    } else if (warns.length) {
      console.log("OK with " + warns.length + " warning(s) — check the WARN lines");
    } else {
      console.log("FLOW COMPLETE — ready to hand over.");
    }
  }
  process.exit(fails.length ? 1 : 0);
}

main();

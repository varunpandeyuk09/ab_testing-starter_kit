#!/usr/bin/env node
// Creates a safe, complete STEP 0b scaffold. It never guesses client/test facts.
// Example:
// node tools/start_test.js --client TROOPER --name "SM23 Header Copy" --id TROOPER-SM23 --url "https://www.trooper.ch/" --focus navigation --effort LITE

const fs = require("fs");
const path = require("path");

const KIT = path.resolve(__dirname, "..");
const REQUIRED = ["client", "name", "id", "url", "focus", "effort"];

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    out[name] = argv[++i];
  }
  return out;
}

function fail(message) {
  console.error("ERROR: " + message);
  process.exit(2);
}

function copy(source, destination) {
  fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log("Usage: node tools/start_test.js --client CLIENT --name \"TEST NAME\" --id TEST-ID --url URL --focus AREA --effort LITE|STANDARD|HEAVY [--output-root PATH]");
    return;
  }
  REQUIRED.forEach((key) => { if (!args[key]) fail("--" + key + " is required"); });
  if (["LITE", "STANDARD", "HEAVY"].indexOf(args.effort) === -1) fail("--effort must be LITE, STANDARD, or HEAVY");
  if (!/^https?:\/\//i.test(args.url)) fail("--url must start with http:// or https://");
  if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(args.client)) fail("--client must be uppercase letters/numbers, _ or -");
  if (/[<>:"/\\|?*]/.test(args.name)) fail("--name contains a Windows-reserved character");

  const outputRoot = path.resolve(args["output-root"] || path.join(KIT, "..", "ABTESTSWITHAI"));
  const testDir = path.resolve(outputRoot, args.client, args.name);
  const clientDir = path.resolve(outputRoot, args.client);
  if (!testDir.startsWith(clientDir + path.sep)) fail("test path must stay inside the requested client folder");
  if (fs.existsSync(testDir)) fail("test folder already exists: " + testDir);

  const variationDir = path.join(testDir, "variation1");
  const aiDir = path.join(testDir, "AI_DATA");
  fs.mkdirSync(path.join(aiDir, "user_inputs", "test_images"), { recursive: true });
  fs.mkdirSync(variationDir, { recursive: true });
  copy(path.join(KIT, "variation1", "variation.js"), path.join(variationDir, "variation.js"));
  copy(path.join(KIT, "variation1", "variation.css"), path.join(variationDir, "variation.css"));
  copy(path.join(KIT, "share.js"), path.join(variationDir, "share.js"));
  copy(path.join(KIT, "v1.json"), path.join(variationDir, "v1.json"));

  const qa = {
    test: args.name,
    client: args.client,
    test_id: args.id,
    website_url: args.url,
    focus_area: args.focus,
    effort: args.effort,
    gate_complete: false,
    brief_gaps: [],
    asked: [],
    skipped_known: [],
    verified: []
  };
  fs.writeFileSync(path.join(aiDir, "qa_prep.json"), JSON.stringify(qa, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(aiDir, "session_notes.md"), "# Session notes\n\n- Effort: " + args.effort + "\n- Scope: " + args.focus + "\n- URL: " + args.url + "\n", "utf8");

  console.log("Created: " + testDir);
  console.log("Next: collect the Q&A in AI_DATA/qa_prep.json, then run:");
  console.log('node tools/flow_gate.js "' + testDir + '" --through 0b');
}

main();

#!/usr/bin/env node
// tools/cache_vision.js — per-test vision output cache (model-agnostic)
// --------------------------------------------------------------------------
// Memoizes the raw output of a vision model for ONE static reference image
// (Figma mockups + approved variation-design targets ONLY — never control
// captures or live variation renders, which change as code evolves and must be
// freshly checked each run). The actual vision processing is done by the AI /
// model; this tool only owns the deterministic plumbing, so ANY model produces
// the SAME cache layout and any future AI reuses the cache:
//   cache key   = SHA-256(image bytes) + model id + prompt version
//   cache file  = <hash>@<model>@v<promptVer>.json   (self-describing)
// A Figma file is static, so processing it twice yields the same output — cache
// the output once, reuse forever. Change the file OR the model OR the prompt →
// new key → automatic re-process (nothing stale silently reused).
//
// USAGE (run from the test's AI_DATA/ folder):
//   node <kit>/tools/cache_vision.js --image user_inputs/test_images/figma_desktop.png --cache vision_cache --model vision-x --prompt-v 1
//     → HIT: prints the cached output path (reuse it, do NOT re-process)
//     → MISS: prints the exact path to process + save
//   on MISS the AI processes the image, writes its output JSON to a temp file, then:
//   node <kit>/tools/cache_vision.js --image user_inputs/test_images/figma_desktop.png --cache vision_cache --model vision-x --prompt-v 1 --save out.json
//     → stores the output under the computed key
//
// FLAGS:
//   --image <file>   static reference image to hash (required)
//   --cache <dir>    cache dir, e.g. AI_DATA/vision_cache (required)
//   --model <id>     model id that produced/will produce the output (default "vision")
//   --prompt-v <n>   prompt version (default 1) — bump whenever the prompt changes
//   --save <json>    action=save: copy this AI-output file into the cache
//   --json           print machine-readable JSON result
// --------------------------------------------------------------------------
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function parseArgs(argv) {
  const out = { model: "vision", promptV: 1, save: null, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    const val = () => argv[++i];
    if (a === "--image") out.image = val();
    else if (a === "--cache") out.cache = val();
    else if (a === "--model") out.model = val();
    else if (a === "--prompt-v") out.promptV = parseInt(val(), 10) || 1;
    else if (a === "--save") out.save = val();
    else if (a === "--json") out.json = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.image || !args.cache) {
    console.error("ERROR: --image <file> and --cache <dir> are required");
    process.exit(2);
  }
  if (!fs.existsSync(args.image)) {
    console.error("ERROR: image not found: " + args.image);
    process.exit(2);
  }
  const bytes = fs.readFileSync(args.image);
  const hash = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 12);
  const file = hash + "@" + args.model + "@v" + args.promptV + ".json";
  fs.mkdirSync(args.cache, { recursive: true });
  const cachePath = path.join(args.cache, file);

  if (args.save) {
    if (!fs.existsSync(args.save)) {
      console.error("ERROR: --save file not found: " + args.save);
      process.exit(2);
    }
    // Preserve provenance inside the cached output.
    const out = JSON.parse(fs.readFileSync(args.save, "utf8"));
    out._cache = { image: path.basename(args.image), sha256: hash, model: args.model, promptVersion: args.promptV, savedAt: new Date().toISOString() };
    fs.writeFileSync(cachePath, JSON.stringify(out, null, 2));
    const res = { status: "saved", key: hash, file, path: cachePath };
    if (args.json) console.log(JSON.stringify(res, null, 2));
    else console.log("[cache_vision] SAVED " + cachePath + "  (image " + path.basename(args.image) + " → " + hash + "@" + args.model + ")");
    process.exit(0);
  }

  if (fs.existsSync(cachePath)) {
    const res = { status: "hit", key: hash, file, path: cachePath, output: JSON.parse(fs.readFileSync(cachePath, "utf8")) };
    if (args.json) console.log(JSON.stringify(res, null, 2));
    else console.log("[cache_vision] HIT  " + cachePath + "  → reuse this output, do NOT re-process the image");
    process.exit(0);
  }
  const res = { status: "miss", key: hash, file, path: cachePath };
  if (args.json) console.log(JSON.stringify(res, null, 2));
  else {
    console.log("[cache_vision] MISS " + path.basename(args.image) + " → " + hash);
    console.log("[cache_vision] process the image now, save output, then re-run with --save <out.json> to store it at:");
    console.log("[cache_vision]   " + cachePath);
  }
  process.exit(0);
}

main();

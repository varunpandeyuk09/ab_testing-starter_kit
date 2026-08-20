# Fast Lane — 20-minute build target

Use this only to accelerate the build. It never replaces user QA or the evidence required
for live-page behavior.

## Eligibility

- **LITE (10–15 min):** presentational/structural change to existing content, a single
  page/area, no new interaction or data request, and a precise target.
- **Known STANDARD (up to 20 min):** the target area is already documented in the client
  profile and the brief includes the exact source HTML or mockup needed to build.
- **HEAVY:** no 20-minute promise. Clone/AJAX/state/re-render tasks need the evidence and
  user QA rounds described in the normal flow.

## One-message intake

Ask for everything missing in one batch: client, test ID/name, URL(s), focus area, exact
target outerHTML, design/mockup, goal, constraints, tracking, and the response to the input
gate. For clone/AJAX work, include the real Network request, complete source container HTML,
and the parity decision in that same message.

## Commands

Create the safe STEP 0b scaffold without manually copying files:

```powershell
node tools/start_test.js --client CLIENT --name "AB01 Example" --id CLIENT-AB01 --url "https://example.com/page" --focus section --effort LITE
```

After each completed phase, run only that phase's gate:

```powershell
node tools/flow_gate.js "<test folder>" --through 0b
node tools/flow_gate.js "<test folder>" --through 0c
```

Before the user QA handover, run the local static check. It catches structural mistakes but
does not inspect or QA the live site:

```powershell
node tools/preflight_check.js "<test folder>"
```

## LITE zero-question record

When the brief and existing kit facts answer every question, do not invent one. Complete
`qa_prep.json` with `"effort": "LITE"` and `"gate_complete": true`, while keeping the
empty `asked` and `verified` arrays as an explicit audit record.

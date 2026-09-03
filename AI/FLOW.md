# Flow

> **⚠️ Remember:** Kit bas reference hai. Pehle khud soch, phir match kar patterns se. Client intent > Kit patterns.

```
BRIEF
  │
  ▼
PARSE ──────── goal, page/site, user behavior, expected outcome, constraints, success criteria
  │
  ▼
ANALYZE ────── page type, platform/framework, DOM architecture, SPA/dynamic, responsive, dependencies, unknowns
  │
  ▼
ASK ────────── only blocking questions (do not ask inferable from brief/patterns/site)
  │
  ▼
MATCH ──────── PATTERNS.md + SNIPPETS.md + historical/client precedent — Adapt, do not blindly copy
  │
  ▼
SCAFFOLD ──── variation1/ + AI_DATA/ + guards/observers/responsive/cleanup strategy
  │
  ▼
CODE ───────── smallest solution — kit conventions + platform constraints + idempotency
  │
  ▼
QA ─────────── verify brief/selectors/duplicates/SPA/observers/listeners/responsive/scope/edge cases
  │           If QA fails → CODE → QA
  │           If QA passes → HANDOFF
  ▼
HANDOFF ───── final impl + files/changes + assumptions + QA status + browser verification needed
  │
  ▼
CAPTURE ────── genuinely new technique?
              ├── No → finish
              └── Yes → reusable? validated? non-obvious?
                       ├── No → do not add
                       └── Yes → PATTERNS.md exists? → update : add new P#
```

| Step | Action | File |
|---|---|---|
| PARSE | Extract goal, page, behavior, outcome, constraints, success | — |
| ANALYZE | Determine page type, platform, DOM, SPA, responsive, deps, unknowns | — |
| ASK | Only blocking questions | — |
| MATCH | Find closest pattern/snippet/precedent | PATTERNS.md |
| SCAFFOLD | Create folders + init strategy | — |
| CODE | Smallest solution per conventions | SNIPPETS.md |
| QA | Verify 9 checks; loop if fail | user_qa.md |
| HANDOFF | Provide impl + QA status + verification | — |
| CAPTURE | If new + reusable + validated + non-obvious → PATTERNS.md | PATTERNS.md |

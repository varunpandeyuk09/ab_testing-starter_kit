# Flow

> **⚠️ Remember:** The kit is only a reference. Think first, then match with patterns. Client intent > Kit patterns.

```
═══════════════════════════════════════════════════════════════════
  You are an expert CRO developer building A/B test variations.
  
  RULES:
   - Client intent > Kit patterns — understand the real problem first
   - Think before coding — analyze the design, map the DOM, plan the approach
   - Smallest solution — no over-engineering, no unnecessary complexity
   - Idempotent code — guard against duplicates, always check before insert
   - Mobile-first mindset — always consider responsive behavior
   - If anything is unclear → ASK first, never guess
    - Do NOT read communications/ — private, gitignored folder
    - Do NOT read ClientData/<CLIENT>/ — only Theultimatebrain.md for initial read
  
  GOAL:
  - Build variations that are clean, maintainable, and production-ready
  - Follow kit conventions (IIFE, waitForElement, scoped CSS)
  - Cover edge cases proactively
  - Deliver working code, not partial solutions
═══════════════════════════════════════════════════════════════════

BRIEF
  │
  ▼
PARSE ──────── goal, page/site, user behavior, expected outcome, constraints, success criteria
  │
  ▼
ANALYZE ────── page type, platform/framework, DOM architecture, SPA/dynamic, responsive, dependencies, unknowns
  │
  ▼
DESIGN ─────── if screenshot/Figma provided → follow IMAGE_ANALYSIS.md (zoom, layout, colors, spacing, borders, mobile)
  │
  ▼
ASK ────────── only blocking questions (do not ask inferable from brief/patterns/site)
  │
  ▼
  MATCH ──────── Theultimatebrain.md (Patterns P1-P20 + Snippets + Rules) + historical/client precedent — Adapt, do not blindly copy
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
                         └── Yes → Theultimatebrain.md exists? → update : add new P#
```

| Step | Action | File |
|---|---|---|
| PARSE | Extract goal, page, behavior, outcome, constraints, success | — |
| ANALYZE | Determine page type, platform, DOM, SPA, responsive, deps, unknowns | — |
| DESIGN | If screenshot/Figma → Analyze layout, colors, spacing, borders, mobile | IMAGE_ANALYSIS.md |
| ASK | Only blocking questions | — |
| MATCH | Find closest pattern/snippet/precedent from kit | Theultimatebrain.md |
| SCAFFOLD | Create folders + init strategy | — |
| CODE | Smallest solution per conventions | Theultimatebrain.md (Section 7.1) |
| QA | Verify 13 checks; loop if fail | Theultimatebrain.md (Section 9) + user_qa.md |
| HANDOFF | Provide impl + QA status + verification | — |
| CAPTURE | If new + reusable + validated + non-obvious → Add to Theultimatebrain.md | Theultimatebrain.md |

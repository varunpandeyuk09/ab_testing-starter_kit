# Flow

> **⚠️ Remember:** Kit bas reference hai. Pehle khud soch, phir match kar patterns se. Client intent > Kit patterns.

```
BRIEF
  │
  ▼
PARSE ──────── extract client code, test ID, name from brief
  │
  ▼
ANALYZE ────── read brief → list what you need from user
  │            (selectors, endpoints, behavior, DOM structure)
  ▼
ASK ────────── get ALL facts before coding
  │
  ▼
MATCH ──────── PATTERNS.md (find technique)
  │
  ▼
SCAFFOLD ──── variation1/ + AI_DATA/
  │
  ▼
CODE ───────── SNIPPETS.md
  │
  ▼
QA ─────────── user_qa.md → USER TESTS
  │
  ▼
CAPTURE ────── PATTERNS.md (new technique)
```

| Step | Action | File |
|---|---|---|
| PARSE | Extract client + test | — |
| ANALYZE | What do I need from user? | — |
| ASK | Get all facts upfront | — |
| MATCH | Find technique | PATTERNS.md |
| SCAFFOLD | Create folders | — |
| CODE | Write variation.js/css | SNIPPETS.md |
| QA | Handover to user | user_qa.md |
| CAPTURE | Save new technique | PATTERNS.md |

# 00 — User Context (Load First)

> Priority: HIGHEST — read before `01-core-rules.md`. This file is the user's standing memory across sessions.
> Anything written here overrides inference. Never re-ask what is already answered here.

## How to use

- Session start: read this file first and apply it silently (do not narrate it back).
- When the user states a standing preference or correction: append it below and confirm in one line.
- Never delete entries. Mark superseded ones as struck through with a date.

## Standing decisions

1. Kit content language: English only (rules, comments, new code).
2. Kit stays generic: no client names, no test-specific content in kit files.
3. Ask policy (hybrid): blocking unknown → stop and ask with 2-3 options + recommendation; trivial unknown → sensible default and flag the assumption openly.
4. Attempt cap: same approach fails twice → stop, report to the user with options. Never loop.
5. Learnings: always confirm deliberate-vs-accidental with the user before locking; deliver learnings as one-line rules.
6. Communication records: zero guessing — TBD over invented facts.
7. Injected HTML: minimal — only own nodes, never host wrappers.

## Corrections log

- 2026-10-07: Page-builder wrapper classes in injected HTML were accidental copy-paste, not a technique. Origin of decision 7.
- 2026-10-07: Image hosting on free image hosts observed in shipped tests — banned per `10-pitfalls.md`; use CDN or local assets.

## Active constraints

- None right now.

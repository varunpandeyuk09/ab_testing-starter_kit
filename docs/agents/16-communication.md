# 16 — Communication Records

> Source: New (rules distilled from real client/dev threads). Priority: LOW (load only when writing or reviewing communications).
> This kit is generic — no client names, no test-specific content. Placeholders only.
> Actual records live in `communications/` (private, gitignored). Never commit them.

## Folder layout

```
communications/
├── [CLIENT]-[TEST]-[TYPE].txt    # human-readable message
└── [CLIENT]-[TEST]-[TYPE].json   # machine record (this schema, same basename)
```

One `.json` sidecar per `.txt`. Same basename, always paired. Save a pair only when the user explicitly asks.

## Record schema

```json
{
  "id": "CLIENT-AB01-20261007-bug-01",
  "date": "2026-10-07",
  "direction": "inbound",
  "client": "CLIENT",
  "test": "AB01",
  "related_tests": [],
  "variation": null,
  "type": "bug",
  "channel": "email",
  "language": "english",
  "tone": "semi-formal",
  "subject": "",
  "summary": "Quick add-to-cart dead after filter/sort; success overlay covers listing.",
  "items": [
    { "n": 1, "test": "AB01", "text": "Quick add-to-cart unresponsive after filter or sort is applied." },
    { "n": 2, "test": "AB01", "text": "Success message appears on top of the product listing." }
  ],
  "attachments": [
    { "name": "screenshot-1.png", "kind": "image", "status": "missing" }
  ],
  "transcript": null,
  "body_ref": "CLIENT-AB01-bug.txt",
  "status": "waiting-reply",
  "follows_id": null,
  "needs_follow_up": true,
  "follow_up_date": "2026-10-09"
}
```

| Field | Type | Required | Values / Notes |
|---|---|---|---|
| `id` | string | MUST | `[CLIENT]-[TEST]-[YYYYMMDD]-[type]-[NN]` (NN = 01, 02… per day) |
| `date` | string | MUST | `YYYY-MM-DD`, message date (not log date) |
| `direction` | enum | MUST | `inbound` (client→us) \| `outbound` (us→client) \| `internal` (team-only) |
| `client` | string | MUST | UPPERCASE client code, e.g. `CLIENT` |
| `test` | string | MUST | Primary test code, e.g. `AB01`. `GENERAL` only if truly test-free |
| `related_tests` | array | MUST | Other test codes mentioned in the same message (empty array if none) |
| `variation` | string/null | SHOULD | `v1`, `v2`… when the message targets a variation; else `null` |
| `type` | enum | MUST | One of the 10 values in the catalog below, never invented |
| `channel` | enum | MUST | `email` \| `whatsapp` \| `call` \| `meeting` \| `file` |
| `language` | enum | MUST | `english` \| `hinglish` \| `hindi` (language of the message itself) |
| `tone` | enum | MUST | `formal` \| `semi-formal` \| `casual` |
| `subject` | string | SHOULD | Email subject; empty string for WhatsApp/calls |
| `summary` | string | MUST | One line, max 140 chars |
| `items` | array | MUST | One `{n, test, text}` per action point (single-item messages still use a 1-entry array) |
| `attachments` | array | MUST | One `{name, kind, status}` per referenced file/link (empty array if none) |
| `transcript` | string/null | SHOULD | Text transcribed from image/video content; else `null` |
| `body_ref` | string | MUST | Paired `.txt` filename in the same folder |
| `status` | enum | MUST | `draft` \| `sent` \| `waiting-reply` \| `replied` \| `closed` |
| `follows_id` | string/null | SHOULD | Record `id` this message continues (persistent-issue chains); else `null` |
| `needs_follow_up` | boolean | MUST | `true` when a reply or action is pending |
| `follow_up_date` | string/null | MUST | `YYYY-MM-DD` or `null` |

Attachment `kind`: `image` \| `video` \| `link` \| `file`. Attachment `status`: `attached` \| `missing` \| `inaccessible`.

## Type catalog (10 styles)

| `type` | When | Default channel | Default tone |
|---|---|---|---|
| `update` | Work completed, ready for review | email | formal |
| `clarification` | Info missing, blocked, must ask | email | formal |
| `bug` | Found an issue, reporting with problem/expected/page | email | semi-formal |
| `quick-update` | Short status ping to team | whatsapp | casual |
| `handoff` | Delivering final code: files changed, behavior, pages to verify | email | formal |
| `query-response` | Answering a quick client question | whatsapp | semi-formal |
| `internal-note` | Explaining logic to the dev team | file | casual |
| `follow-up` | No response, nudging a pending thread | email | formal |
| `appreciation` | Acknowledging thanks or help | whatsapp | casual |
| `scope` | New work: scope recap + effort/cost + confirmation ask | email | formal |

## Message generation rules

When the user asks for a communication:

1. **Identify the scenario** — which of the 10 types fits.
2. **Identify the language** — generate in the language the user is speaking (English/Hinglish/Hindi).
3. **Identify the tone** — formal for client email, casual for team/WhatsApp.
4. **Pull context** — only from the conversation and records; never invent URLs, behaviors, or decisions.
5. **Keep it short** — numbered points or bullets, `---` separators for sections, no long paragraphs.
6. **Be specific** — test codes, page URLs, element names, what changed, next step.

## Thread rules (distilled from real threads) [MUST]

1. **One record per message; `items` per action point.** Real client messages bundle 2-3 issues, sometimes across two tests. Never merge two messages into one record; never split one message into two records.
2. **Always set `direction`.** Reviews addressed to the team ("I reviewed this test…") are `internal`. Implementation summaries sent to the client are `outbound`. Everything else defaults to `inbound`.
3. **Link persistent issues.** "Still persists" / "still running into" MUST set `follows_id` to the earlier record. Read the chain before replying.
4. **Attachment honesty.** "Image attached" with no file = `missing`. Third-party preview links that need login = `inaccessible`. Never claim to have seen an inaccessible attachment; note what is needed instead.
5. **Vague messages get clarification, not guesses.** Content-free messages ("make necessary changes as needed" with no target) → quote verbatim in `summary`, `status: waiting-reply`, `needs_follow_up: true`, plus a `clarification` reply. Never infer the missing context.
6. **Client copy is verbatim.** Supplied strings in any language are recorded character-exact — never translated or paraphrased in records or code.
7. **Redesign pivots are new state, not edits.** "Create v2" / layout replaced (e.g., panel → sidebar) → set `variation` and describe the pivot in `items`. Old records stay untouched.
8. **Mixed-test messages:** `test` = primary test, the rest go in `related_tests`.

## AI rules [MUST]

1. **Keys are English-only**, exactly as in the schema. Never rename or add ad-hoc keys.
2. **Never a message without a record** — `.txt` and `.json` are always created together.
3. **`type` MUST be one of the 10 catalog values.**
4. **Never invent facts** — `summary`, `items`, and `subject` come from the actual message only.
5. **Status moves only forward:** `draft` → `sent` → `waiting-reply` → `replied` → `closed`. Update the same record, never duplicate it.
6. **Follow-up discipline:** `waiting-reply` REQUIRES `needs_follow_up: true` with a `follow_up_date`.
7. **No secrets in records** — no passwords, tokens, or personal phone numbers. Names are fine.
8. **Finding records:** filter by `client` + `test` first, then `status`. `waiting-reply` + past `follow_up_date` = send a `follow-up` message.

## Do's and Don'ts

Do: numbered points, specific test codes and URLs, match the user's language, shortest complete form.
Do NOT: over-explain, use jargon the client won't understand, write long paragraphs, invent information, stay overly formal on WhatsApp.

## Capture

New `type` value only when a genuinely new style is proven across >=2 clients. Otherwise the catalog is frozen at 10.

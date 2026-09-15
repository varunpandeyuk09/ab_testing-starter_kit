# Smart Communication Guide

> Reference for AI to generate communications based on user's voice and style.
> When user asks for a communication, use this guide + user's language to generate.

---

## Communication Styles

### 1. Client Update / Progress Email (Formal)

**When:** Work completed, ready for review
**Tone:** Professional, clear, structured

```
Subject: [Test Name] — Implementation Complete / Ready for Review

Hi [Name],

[One line summary of what was done]

Here is a breakdown:

---

1. [Point 1 — what was implemented/changed]

[Details]

---

2. [Point 2 — behavior/logic]

[Details]

---

3. Next Steps

[What client needs to do — review, upload, test, etc.]

---

Please let us know if anything needs adjustment.
```

**Example:**
```
Subject: DEKRA T12 — V3 Variation Ready for Review

Hi [Name],

V3 variation for the Prerequisites section is ready. The section now handles
multiple accordion scenarios across different course pages.

Here is the breakdown:

---

1. Prerequisites Section Logic

- If "Voraussetzungen" accordion exists with license classes → badges shown
- If "Voraussetzungen" exists with text content → content pulled directly
- If "Teilnahmevoraussetzungen" exists → innerHTML pulled
- If neither accordion exists → "Keine Vorkenntnisse nötig" displayed

---

2. Pages Tested

[URLs with expected behavior]

---

3. Next Steps

Please review on the listed pages and let us know if any adjustments are needed.

---
```

---

### 2. Clarification Request (Formal)

**When:** Missing info blocking implementation
**Tone:** Polite, specific, numbered questions

```
Subject: [Test Name] — Clarification Needed

Hi [Name],

Thank you for sharing the details. We have reviewed everything and need
clarification on a few points before proceeding:

---

1. [Question 1]

[Why we need this]

---

2. [Question 2]

[Why we need this]

---

Once we receive clarity, we will proceed with implementation.

---
```

---

### 3. Bug Report / Issue (Semi-Formal)

**When:** Found a bug, need to communicate to client or team
**Tone:** Direct, solution-oriented

```
Hi [Name],

Found a small issue on [page/element]:

**Problem:** [What is happening]
**Expected:** [What should happen]
**Page:** [URL]

[One line fix if you know it]

Let me know how you want to handle this.
```

---

### 4. Quick Update (WhatsApp / Casual)

**When:** Quick status update to team/colleague
**Tone:** Short, direct, Hinglish

```
Bhai [test name] ho gaya. [Key point]. Dekh lo aur batao.

OR

Done bhai. [What was done]. Check kar lo.

OR

Ye bhi fix ho gaya. [Details]. Aage bolo kya karna hai.
```

**Examples:**
```
Bhai DEKRA V3 ho gaya. Prerequisites section ab 4 scenarios handle karta hai.
Check kar lo aur batao.

OR

Done bhai. V3 me badges wala case bhi fix ho gaya. Ab plain text content
bhi dikhta hai jab badges nahi hote. Aage bolo kya karna hai.

OR

Bug fix ho gaya. "Fahrerlaubnis der Klassen:" sirf badges pe aa raha hai
ab. Check kar lo.
```

---

### 5. Handoff / Delivery (Formal)

**When:** Delivering final code/implementation
**Tone:** Structured, complete

```
Hi [Name],

[Test Name] implementation is complete. Here is the summary:

---

Files Changed:
- [file 1] — [what changed]
- [file 2] = [what changed]

Behavior:
1. [Scenario 1] → [Result]
2. [Scenario 2] → [Result]
3. [Scenario 3] → [Result]

Pages to Verify:
- [URL 1] — [expected behavior]
- [URL 2] — [expected behavior]

---

Please review and let us know if anything needs adjustment.
```

---

### 6. WhatsApp — Client Query Response

**When:** Client asks a quick question on WhatsApp
**Tone:** Helpful, concise, professional

```
Hi [Name],

[Direct answer to their question]

[If needed: One line context or next step]
```

**Example:**
```
Hi [Name],

Yes, the V3 variation handles both cases — when accordion has badges and
when it has plain text content. Both will show correctly under the
prerequisites section.
```

---

### 7. Internal Team Note (Hinglish)

**When:** Explaining something to dev team
**Tone:** Casual, technical, direct

```
Bhai ye test me ye logic hai:

- Agar v1 accordion hai with badges (C1, C1E) → badges dikhao
- Agar v1 hai but badges nahi → content text dikhao
- Agar v2 hai → uska innerHTML dikhao
- Agar koi nahi hai → "Keine Vorkenntnisse nötig"

CSS same hai v1 jaisi. Check kar lo.
```

---

### 8. Follow-Up Email (Formal)

**When:** No response, need to follow up
**Tone:** Polite, brief

```
Hi [Name],

Just following up on my previous email regarding [topic].

[One line recap of what is pending]

Please let us know when you get a chance so we can proceed accordingly.

Thanks!
```

---

### 9. Appreciation / Thank You (Casual)

**When:** Client appreciated work, or team helped
**Tone:** Warm, brief

```
Thanks [Name]! Glad it worked out. Let me know if anything else comes up.

OR (Hinglish)

Thanks bhai! Badhiya laga sun ke. Aur kuch ho to bata dena.
```

---

### 10. Scope / Pricing Query (Formal)

**When:** Client asks about new work scope or pricing
**Tone:** Professional, clear

```
Hi [Name],

Thank you for sharing the details. Based on what you have described,
here is our understanding:

---

1. [Scope item 1]
2. [Scope item 2]
3. [Scope item 3]

Estimated Effort: [Timeline]
Cost: [If applicable]

---

Please confirm if this aligns with your expectations, and we will proceed.

---
```

---

## Language Patterns

### English (Formal)
- "Here is a breakdown of..."
- "Please let us know if..."
- "We have reviewed and..."
- "Once we receive clarity, we will proceed..."
- "Please review and confirm..."

### Hinglish (Casual)
- "Bhai ye ho gaya..."
- "Check kar lo aur batao..."
- "Done bhai..."
- "Aage bolo kya karna hai..."
- "Ye fix ho gaya..."
- "Samajh gaya bhai..."

### Hindi (Formal-ish)
- "Ye kaam ho gaya hai..."
- "Please check karein..."
- "Aage batayein kya karna hai..."

---

## Quick Reference — When to Use What

| Scenario | Style | Language |
|---|---|---|
| Work completed, client update | Client Update Email | English |
| Need info from client | Clarification Request | English |
| Found a bug | Bug Report | English/Hinglish |
| Quick team update | WhatsApp Quick Update | Hinglish |
| Delivering final code | Handoff/Delivery | English |
| Client asks quick question | WhatsApp Query Response | English |
| Explaining logic to team | Internal Team Note | Hinglish |
| No response, follow up | Follow-Up Email | English |
| Client said thanks | Appreciation | Hinglish/English |
| New scope/pricing | Scope Query | English |

---

## Smart Generation Rules

When user asks for a communication:

1. **Identify the scenario** — which of the 10 styles fits
2. **Identify the language** — what language is user speaking in
3. **Identify the tone** — formal (client) vs casual (team/WhatsApp)
4. **Pull context** — from the conversation (what was done, what is the issue, etc.)
5. **Generate** — using the matching template + user's voice + context
6. **Keep it short** — user said "chota sa hi bol raha hu" — respect brevity
7. **No over-explaining** — only include what is necessary

---

## Do's and Don'ts

### Do's
- Keep it structured with numbered points
- Use `---` separators for sections
- Be specific — mention page URLs, element names, what changed
- Match the user's language (English/Hinglish/Hindi)
- Keep it as short as possible while being complete

### Don'ts
- Don't over-explain simple things
- Don't use jargon client won't understand
- Don't write long paragraphs — use bullet points
- Don't make up information — only state facts
- Don't be overly formal on WhatsApp

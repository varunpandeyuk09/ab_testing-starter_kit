# 15 — Codebase Stats (Reference Only)

> Source: `AGENTS.md` Section 13. Priority: LOWEST. Context only, not rules.
> Last updated: September 2026.

- Total Tests: 4,340+ variation.js files
- Total Clients: 300+
- Top Clients: ALTIUM (337), BETASHARES (146), OCTO_PART (140), NEW BALANCE (138), HSBC (118), BRIT_BOX (105), THE_SPANISH_GROUP (99), REGUS (90), VACATION (88), AIRDOCTORPRO (88)

## Top techniques (Audit 4344 tests, 2026-09-01)

| # | Technique | Usage |
|---|---|---|
| 1 | `waitForElement` + polling | 97.5% |
| 2 | `querySelector` / DOM access | 99.4% |
| 3 | `insertAdjacentHTML/Element` | 75.3% |
| 4 | `classList.add` / CSS class injection | 68.4% |
| 5 | `live()` delegated events | 28.7% var / 95.8% share.js |
| 6 | Sticky elements | 12.9% |
| 7 | Cookie get/set/delete | 4.3% |
| 8 | Slick/Carousel loading | 5.4% slick / 21.7% CDN |
| 9 | XHR/Fetch hooks | 11.2% |
| 10 | MutationObserver | 8.6% |

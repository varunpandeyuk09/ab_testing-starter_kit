# 2023 Test Analysis Log

> Track which clients have been analyzed for learnings.
> Updated: 2026-09-21

---

## STATUS

| Metric | Count |
|---|---|
| **Total Tests** | 859 |
| **Analyzed** | ~200 |
| **Pending** | ~659 |
| **Completion** | 23% |

---

## ANALYZED CLIENTS (34 clients, ~200 tests)

| # | Client | Tests | Status |
|---|---|---|---|
| 1 | ABCIVF | 3 | ✅ Done |
| 2 | ABSOLUTEDOMESTICS | 2 | ✅ Done |
| 3 | AIRCALL | 3 | ✅ Done |
| 4 | ALLIANT | 4 | ✅ Done |
| 5 | ALTIUM | 40 | ✅ Done |
| 6 | ATHENA | 4 | ✅ Done |
| 7 | BETASHARES | 5 | ✅ Done |
| 8 | BRIT_BOX | 5 | ✅ Done |
| 9 | CLEARSCORE | 2 | ✅ Done |
| 10 | DEKRA | 0 | ⚠️ Files missing |
| 11 | DRINKGT | 4 | ✅ Done |
| 12 | EASY_OFFICES | 3 | ✅ Done |
| 13 | EON Clinics | 2 | ✅ Done |
| 14 | EQUIFAX | 1 | ✅ Done |
| 15 | EVERY_LIFE | 1 | ✅ Done |
| 16 | GRACO_BABY | 2 | ✅ Done |
| 17 | HSBC | 7 | ✅ Done |
| 18 | IITTALA | 2 | ✅ Done |
| 19 | LINGO_KIDS | 1 | ✅ Done |
| 20 | MARMOT | 2 | ✅ Done |
| 21 | Moorings | 8 | ✅ Done |
| 22 | NEW BALANCE | 0 | ⚠️ Files missing |
| 23 | OCTO_PART | 10 | ✅ Done |
| 24 | TRUST_AND_WILL | 5 | ✅ Done |
| 25 | WICKED_CLOTHES | 5 | ✅ Done |
| 26 | THE_SPANISH_GROUP | 20 | ✅ Done |
| 27 | VACATION | 8 | ✅ Done |
| 28 | YANKEE_CANDLE | 9 | ✅ Done |
| 29 | REGUS | 10 | ✅ Done |
| 30 | SUNSAIL | 4 | ✅ Done |
| 31 | CREATE FERTILITY | 18 | ✅ Done |
| 32 | QUARK_EXPEDITIONS | 10 | ✅ Done |
| 33 | WINE_SELECTORS | 5 | ✅ Done |
| 34 | TWEEZER_MAN | 2 | ✅ Done |

---

## PENDING CLIENTS (50+ clients, ~769 tests)

| # | Client | Tests | Priority |
|---|---|---|---|
| 1 | THE_SPANISH_GROUP | 121 | High |
| 2 | VACATION | 126 | High |
| 3 | YANKEE_CANDLE | 71 | High |
| 4 | REGUS | 87 | High |
| 5 | SUNSAIL | 97 | High |
| 6 | QUARK_EXPEDITIONS | 48 | Medium |
| 7 | TWEEZER_MAN | 55 | Medium |
| 8 | ZWILLINGBEAUTY | 50+ | Medium |
| 9 | LILYSKIN | 55 | Medium |
| 10 | ROYAL_DOUTON | 42 | Medium |
| 11 | SWEET PLAID | 37 | Medium |
| 12 | TCS_WORLD_TRAVEL | 29 | Medium |
| 13 | CREATE FERTILITY | 92 | High |
| 14 | LTD(Love to dream) | 40 | Medium |
| 15 | VACIER | 42 | Medium |
| 16 | MLN | 41 | Medium |
| 17 | BELLA_AND_DUKE | 35 | Medium |
| 18 | MADEMOISELLE CULOTTE | 33 | Low |
| 19 | UNITY | 33 | Low |
| 20 | LYTX | 28 | Low |
| 21 | BENISOUK | 25+ | Low |
| 22 | NOMINAL | 20+ | Low |
| 23 | CONTIKI | 20+ | Low |
| 24 | MOORINGS | Already done | — |
| 25 | SUNSAIL | 97 | High |
| 26-50+ | Remaining clients | ~300 | Low |

---

## PATTERN SUMMARY (From 90 tests analyzed)

### NEW Patterns Found (P21-P46)
| # | Pattern | Source |
|---|---|---|
| P21 | Locale branching | ALTIUM, HSBC |
| P22 | GeoIP detection | ALTIUM |
| P23 | Multi-step form wizard | ALTIUM TS-1677 |
| P24 | Drupal AJAX detection | ALTIUM TS-1733 |
| P25 | XHR cross-page extraction | ALTIUM TS-1651 |
| P26 | URL query-string stripping | ALTIUM TS-1765 |
| P27 | UTM content mapping | ATHENA Dynamic |
| P28 | Proxy-click filter bridge | BETASHARES 2.04 |
| P29 | Attribute-driven metric switcher | BETASHARES 2.05 |
| P30 | Scroll-threshold DOM relocation | BETASHARES 4.06 |
| P31 | CDN carousel injection | BRIT_BOX A-Z, EO |
| P32 | history.pushState SPA | OCTO_PART, TRUST_AND_WILL |
| P33 | MutationObserver card replace | HSBC 09 |
| P34 | fetch() interception | IITTALA |
| P35 | Dual codebase adaptation | MARMOT |
| P36 | Login-state-aware DOM | MARMOT |
| P37 | Out-of-stock API check | MARMOT PDP |
| P38 | Cross-page localStorage | Moorings |
| P39 | Cart-abandonment popup | Moorings |
| P40 | Locale-branched copy | Moorings Countdown |
| P41 | Timezone-adjusted countdown | Moorings, WICKED |
| P42 | Checkout progress bar | Moorings Checkout |
| P43 | Bidirectional scroll DOM | OCTO_PART Search |
| P44 | Distributor-name-driven | OCTO_PART HIVE-239 |
| P45 | Tab section switcher | OCTO_PART HIVE-243 |
| P46 | Responsive picture injection | ALTIUM Hero |

### Anti-Patterns Found
| # | Issue | Count |
|---|---|---|
| 1 | Fragile nth-child selectors | 20+ |
| 2 | Hardcoded dates | 5+ |
| 3 | Empty init() stubs | 8+ |
| 4 | console.log in prod | 10+ |
| 5 | Duplicate HTML IDs | 3+ |
| 6 | Missing null checks | 15+ |

### Security Issues Found
| # | Issue | Files |
|---|---|---|
| 1 | eval() usage | Moorings |
| 2 | innerHTML with UTM | ATHENA |
| 3 | Plaintext credentials | OCTO_PART |
| 4 | Third-party deps no fallback | Multiple |

---

## NEXT STEPS

1. **Continue with HIGH priority clients** (THE_SPANISH_GROUP, VACATION, YANKEE_CANDLE, REGUS, SUNSAIL, CREATE FERTILITY)
2. **Read CSS files** for additional patterns
3. **Update Theultimatebrain.md** with any new findings
4. **Cross-reference** with existing P1-P46 to avoid duplicates

---

## FILE LOCATIONS

| File | Path |
|---|---|
| **Theultimatebrain.md** | `AI/brain/Theultimatebrain.md` |
| **2023 Tests List** | `2023_tests.md` |
| **This Log** | `2023_analysis_log.md` |
| **AB-test Repo** | `D:\WORK_EXPOGROWTH\AB-test` |

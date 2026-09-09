# Shopify Rollouts - AB Testing Research

Hey Team,

Researched Shopify Rollouts feature for AB testing. Here's the detailed breakdown:

---

## What is Rollouts?

Shopify's native A/B testing feature, built directly into the admin panel. No third-party app needed. Launched in Winter '26 Edition.

**Ref:** https://help.shopify.com/en/manual/markets/rollouts

---

## Key Capabilities

- **Theme-level AB testing** - Test entire theme variants (layouts, sections, content)
- **Checkout testing** - A/B test checkout and customer account configurations
- **Server-side testing** - No flicker, no page speed impact
- **Gradual rollout** - 5% → 20% → 50% → 100% traffic release
- **Market targeting** - Test localized content per market (Advanced/Plus plans)
- **Scheduling** - Set start/end dates for tests
- **Free** - No additional app cost (plan-gated for A/B feature)

**Ref:** https://changelog.shopify.com/posts/schedule-publish-and-a-b-test-new-themes-and-checkout-and-customer-account-configurations

---

## Metrics Tracked

**Theme Tests:**
- Conversion Rate
- Bounce Rate
- Reached Checkout Rate
- Add-to-Cart Rate
- Sessions

**Checkout Tests:**
- Checkout Conversion Rate

**Limitation:** No statistical significance calculator built-in. Need external tools (VWO, Easy Apps calculator).

**Ref:** https://help.shopify.com/en/manual/markets/rollouts

---

## Plan Requirements

| Feature | Basic | Grow | Advanced | Plus |
|---------|-------|------|----------|------|
| Schedule Rollouts | ✅ | ✅ | ✅ | ✅ |
| Gradual Rollout | ✅ | ✅ | ✅ | ✅ |
| A/B Experiments | ❌ | ✅ | ✅ | ✅ |
| Market Targeting | ❌ | ❌ | ✅ | ✅ |

**Ref:** https://www.letstalkshop.com/blog/shopify-native-a-b-testing-how-to-use

---

## What We CAN Test

- Homepage redesign
- Hero sections, headlines, CTAs
- Product page layouts
- Collection page grids
- Navigation structure
- Footer content
- Checkout configurations
- Seasonal campaigns
- Market-specific content

**Ref:** https://neat.digital/blogs/blogs/shopify-rollouts-native-ab-testing-guide-2026

---

## What We CANNOT Test

- ❌ **Custom goals** - No accordion clicks, button clicks, form submissions tracking
- ❌ **Specific page elements** - Only theme-level changes
- ❌ **Pricing/discount changes** - Prices are not theme changes
- ❌ **Liquid template edits** - Only theme editor customizations
- ❌ **Audience segmentation** - No new vs returning, mobile vs desktop
- ❌ **Custom event tracking** - Only predefined metrics

**Ref:** https://www.usestorepilot.com/blog/shopify-rollouts-ab-testing/

---

## Comparison with Third-Party Tools

| Need | Native Rollouts | Shoplift/Intelligems | VWO/Enterprise |
|------|-----------------|----------------------|----------------|
| Theme AB tests | ✅ | ✅ | ✅ |
| Statistical significance | ❌ | ✅ | ✅ |
| Segment by audience | ❌ | ✅ | ✅ |
| Price/discount tests | ❌ | ✅ | ✅ |
| Heatmaps/session recordings | ❌ | ❌ | ✅ |
| Custom goals | ❌ | ✅ | ✅ |
| Cost | Free | ~$74/mo+ | $$$$ |

**Ref:** https://addigitech.com/blog/shopify-native-ab-testing-vs-apps

---

## Limitations

1. **No custom goal tracking** - Can't track specific CTAs, accordion clicks, form submissions
2. **Theme-level only** - Can't test individual sections or elements
3. **No statistical significance** - Must calculate externally
4. **Plan-gated** - A/B feature needs Grow plan or higher
5. **No audience segmentation** - Can't target by visitor type
6. **Liquid edits apply to both arms** - Global theme settings not testable

**Ref:** https://www.wiro.agency/blog/shopifys-native-a-b-testing-changes-everything-and-why-most-cro-setups-are-now-outdated

---

## Recommendations

- **For theme-level tests:** Rollouts is sufficient and free
- **For custom goals:** Need Google Analytics events or third-party tool
- **For pricing tests:** Need Intelligems
- **For page-level tests:** Need PageFly or similar
- **For audience segmentation:** Need Shoplift/Convert

**Ref:** https://ecomhint.com/blog/shopify-ab-testing

---

## Next Steps

1. Confirm test requirements - theme level vs page level vs custom goals
2. If custom goals needed → Setup GA events
3. If page-level testing needed → Evaluate PageFly
4. If pricing testing needed → Evaluate Intelligems

Let me know how to proceed!

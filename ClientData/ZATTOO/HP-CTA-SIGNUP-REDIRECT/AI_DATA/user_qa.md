# User QA — EG-ZAT001 — HP CTA & Signup Redirect

---

## Checklist

### Scenario 1: Homepage CTA

- [ ] Go to https://zattoo.com/de
- [ ] Scroll to "Für jeden Geschmack das Richtige" section
- [ ] Find "Zur Senderübersicht" CTA
- [ ] **Click CTA**
  - [ ] Should go DIRECTLY to `/start/signup` (not SPA navigation through multiple pages)
  - [ ] Console: `EG-ZAT001: CTA updated → /start/signup`

### Scenario 2: Shop → Signup Redirect

- [ ] Go to https://zattoo.com/start/shop
- [ ] **Should auto-redirect to `/start/signup`**
- [ ] Console: `EG-ZAT001: Shop page detected, redirecting to signup...`
- [ ] No redirect loops

### Cross-check

- [ ] No JS errors in console
- [ ] Signup page loads correctly after redirect

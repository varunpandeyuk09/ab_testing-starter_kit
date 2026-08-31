# User QA — EG-DKR001 — PLP Sections to Tabs

---

## Pre-requisites
- Test script injected
- Body class `.EG-DKR001` present
- Test on https://www.dekra-akademie.de/weiterbildung/berufskraftfahrer-weiterbildung

---

## Checklist

### Tab Navigation

- [ ] Tab navigation appears below hero section
- [ ] Tabs are named based on section headings (not generic "Tab 1, Tab 2")
- [ ] First tab is active by default (green underline)
- [ ] Clicking a tab switches to that section's content
- [ ] Active tab has green color (#007d40)
- [ ] Inactive tabs are gray

### Tab Content

- [ ] Only the active tab's section content is visible
- [ ] Other sections are hidden
- [ ] Content renders correctly in each tab
- [ ] No layout broken in any tab

### Responsive

- [ ] Tabs scroll horizontally on mobile if many tabs
- [ ] Tab text is readable on all devices
- [ ] Content fits properly in each tab panel

### Cross-check

- [ ] No JS errors in console
- [ ] Hero section remains unchanged
- [ ] Footer remains unchanged
- [ ] Console shows `EG-DKR001: Tabs built — X tabs`

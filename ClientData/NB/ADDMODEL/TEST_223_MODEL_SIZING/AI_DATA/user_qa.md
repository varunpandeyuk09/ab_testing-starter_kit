# User QA — EG-NB-22_03

## Test
Test 22.03: Model Size Test on PDP — AU - All Devices

## What to check
1. **Badge appears** — "Model is 6'2\" (188cm) and wears a size M" white pill bottom-left of model image (second image on desktop, carousel on mobile)
2. **Source** — parsed from img[data-modelinfo]="Osman is wearing size M and is 6'2\"/188cm..."
3. **No duplicate** — one badge per image, not duplicating on re-render/variant switch
4. **Responsive** — desktop 11px/12px bottom, mobile 10px/8px bottom
5. **Body class** — .EG-NB-22_03 on body, all CSS scoped
6. **No break** — carousel swipe, zoom still works, no CLS

## URL
https://www.newbalance.com.au/pd/trackside-fleece-hoodie/MT62Y14P.html?dwvar_MT62Y14P_style=MT62Y14PGYM#dwvar_MT62Y14P_style=MT62Y14PNNY&pid=MT62Y14P&quantity=1

## Devices to test
- [ ] Desktop — badge on second image
- [ ] Mobile — badge in carousel
- [ ] Tablet

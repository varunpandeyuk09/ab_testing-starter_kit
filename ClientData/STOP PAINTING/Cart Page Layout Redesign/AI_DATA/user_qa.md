# User QA — EG-SP-001

## Test
Cart Page Layout Redesign — Stop-Painting.com

## What to check

### Layout
1. **Two-column layout** — Cart items left, Order Summary right
2. **Continue Shopping link** — visible top-right
3. **Heading** — "YOUR CART" (all caps)
4. **Cart items** — card-style, no table headers visible
5. **Order Summary** — sticky sidebar with subtotal, shipping, total

### Interactive Elements (CRITICAL)
6. **Quantity +/− buttons** — work correctly (BigCommerce AJAX)
7. **Remove item (×)** — removes item from cart
8. **Change/Edit link** — opens variant editor
9. **Coupon Code "Add Coupon"** — opens coupon form
10. **Shipping "Add Info"** — opens shipping estimator
11. **"SECURE CHECKOUT"** — navigates to checkout
12. **"CART TO QUOTE"** — triggers quote functionality
13. **"Email Cart"** — triggers email cart

### Content
14. **Subtotal** — matches cart total
15. **Grand Total** — matches cart total
16. **USP bar** — Fast Shipping, Expert Support, 45-Day Guarantee, 5S Standards
17. **Payment icons** — VISA, MC, AMEX, DISC, PayPal
18. **Trust badge** — "Your Order is Secure · SSL Encrypted"
19. **Phone bar** — (866) 284-1541, hours

### Body class
20. **`.EG-SP-001`** added to `<body>`

## URL
https://stop-painting.com/cart.php (with items in cart)

## Devices to test
- [ ] Desktop (1920px)
- [ ] Desktop (1280px)

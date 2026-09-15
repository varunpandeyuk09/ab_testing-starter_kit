(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-SP-001';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (
          document &&
          document.querySelector(selector) &&
          document.querySelectorAll(selector).length > 0
        ) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    function restructureCart() {
      var cart = document.querySelector('.page-cart');
      if (!cart || cart.querySelector('.eg-cart-layout')) return;

      var breadcrumbs = cart.querySelector('.breadcrumbs');
      var heading = cart.querySelector('[data-cart-page-title]');
      var cartContent = cart.querySelector('[data-cart-content]');
      var cartTotals = cart.querySelector('[data-cart-totals]');
      var cartActions = cart.querySelector('.cart-actions-container');
      if (!cartContent || !cartTotals) return;

      var itemCount = cartContent.querySelector('.cart') ? cartContent.querySelector('.cart').dataset.cartQuantity : '?';

      if (heading) {
        heading.innerHTML = 'YOUR CART';
      }

      var continueLink = document.createElement('div');
      continueLink.className = 'eg-continue-shopping';
      continueLink.innerHTML = '<a href="/">&larr; Continue Shopping</a>';

      var cartLayout = document.createElement('div');
      cartLayout.className = 'eg-cart-layout';

      var cartLeft = document.createElement('div');
      cartLeft.className = 'eg-cart-left';

      var cartRight = document.createElement('div');
      cartRight.className = 'eg-cart-right';

      var orderSummary = document.createElement('div');
      orderSummary.className = 'eg-order-summary';
      orderSummary.innerHTML =
        '<h3 class="eg-order-summary__title">Order Summary</h3>' +
        '<div class="eg-order-summary__coupon">' +
          '<span class="eg-order-summary__label">Coupon Code</span>' +
          '<a href="#" class="eg-order-summary__coupon-link coupon-code-add">Add Coupon</a>' +
        '</div>' +
        '<div class="eg-order-summary__divider"></div>' +
        '<div class="eg-order-summary__row">' +
          '<span>Subtotal</span>' +
          '<span class="eg-order-summary__subtotal">—</span>' +
        '</div>' +
        '<div class="eg-order-summary__row eg-order-summary__row--shipping">' +
          '<span>Shipping</span>' +
          '<span><button class="shipping-estimate-show eg-order-summary__link">Add Info</button></span>' +
        '</div>' +
        '<div class="eg-order-summary__divider"></div>' +
        '<div class="eg-order-summary__row eg-order-summary__row--total">' +
          '<span>Total</span>' +
          '<span class="eg-order-summary__total">—</span>' +
        '</div>' +
        '<a href="/checkout" class="eg-order-summary__checkout" id="eg-checkout-btn">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
          ' SECURE CHECKOUT' +
        '</a>' +
        '<button class="eg-order-summary__quote" id="eg-quote-btn">CART TO QUOTE</button>' +
        '<a href="#" class="eg-order-summary__email">Email Cart</a>' +
        '<div class="eg-order-summary__trust">' +
          '<p class="eg-order-summary__trust-title">We Accept:</p>' +
          '<div class="eg-order-summary__payments">' +
            '<span class="eg-payment-icon">VISA</span>' +
            '<span class="eg-payment-icon">MC</span>' +
            '<span class="eg-payment-icon">AMEX</span>' +
            '<span class="eg-payment-icon">DISC</span>' +
            '<span class="eg-payment-icon">PayPal</span>' +
          '</div>' +
          '<p class="eg-order-summary__secure">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>' +
            ' Your Order is Secure · SSL Encrypted' +
          '</p>' +
        '</div>';

      cartLeft.appendChild(cartContent);
      cartRight.appendChild(orderSummary);
      cartLayout.appendChild(cartLeft);
      cartLayout.appendChild(cartRight);

      var origCheckout = cart.querySelector('#checkoutButton');
      var origQuote = cart.querySelector('#qn-cart-to-quote');

      if (origCheckout) {
        var newCheckout = document.getElementById('eg-checkout-btn');
        if (newCheckout) {
          newCheckout.href = origCheckout.href;
          newCheckout.addEventListener('click', function (e) {
            e.preventDefault();
            origCheckout.click();
          });
        }
      }
      if (origQuote) {
        var newQuote = document.getElementById('eg-quote-btn');
        if (newQuote) {
          newQuote.addEventListener('click', function (e) {
            e.preventDefault();
            origQuote.click();
          });
        }
      }

      var uspBar = document.createElement('div');
      uspBar.className = 'eg-usp-bar';
      uspBar.innerHTML =
        '<div class="eg-usp-bar__item">' +
          '<svg class="eg-usp-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
          '<span>Fast & Reliable Shipping</span>' +
        '</div>' +
        '<div class="eg-usp-bar__item">' +
          '<svg class="eg-usp-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' +
          '<span>Expert Floor Marking Support</span>' +
        '</div>' +
        '<div class="eg-usp-bar__item">' +
          '<svg class="eg-usp-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' +
          '<span>45-Day Durability Guarantee</span>' +
        '</div>' +
        '<div class="eg-usp-bar__item">' +
          '<svg class="eg-usp-bar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' +
          '<span>Meets 5S/Lean Standards</span>' +
        '</div>';

      var phoneBar = document.createElement('div');
      phoneBar.className = 'eg-phone-bar';
      phoneBar.innerHTML =
        '<span>Have Questions?</span>' +
        '<a href="tel:8662841541" class="eg-phone-bar__link">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>' +
          ' (866) 284-1541' +
        '</a>' +
        '<span class="eg-phone-bar__hours">Mon - Fri 8am to 5:00 pm EST</span>';

      cart.insertBefore(continueLink, heading ? heading.nextSibling : cart.firstChild);
      cart.insertBefore(cartLayout, cartTotals);
      cartTotals.style.display = 'none';
      if (cartActions) cartActions.style.display = 'none';
      cart.insertBefore(uspBar, cartLayout.nextSibling);
      cart.appendChild(phoneBar);
    }

    function updateSummary() {
      var subtotalEl = document.querySelector('.cart-total-grandTotal span, [data-cart-totals] .cart-total-grandTotal span');
      var egSubtotal = document.querySelector('.eg-order-summary__subtotal');
      var egTotal = document.querySelector('.eg-order-summary__total');
      if (subtotalEl && egSubtotal) egSubtotal.textContent = subtotalEl.textContent;
      if (subtotalEl && egTotal) egTotal.textContent = subtotalEl.textContent;
    }

    function init() {
      document.body.classList.add('EG-SP-001');
      restructureCart();
      updateSummary();
    }

    waitForElement('[data-cart-content]', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();

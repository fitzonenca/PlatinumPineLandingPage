/**
 * Platinum Pine - Natural Kick Landing Page
 * Meta Ads conversion tracking + form handling
 */

const PRICE_PER_UNIT = 610;
const MRP_PER_UNIT = 910;
const RAZORPAY_KEY_ID = (typeof CONFIG !== 'undefined' && CONFIG.razorpayKeyId) ? CONFIG.razorpayKeyId : '';

// Buy 2 Get 50% Off: qty 1 = 610, qty 2 = 910, qty 3+ = 610 * qty
function getTotalAmount(qty) {
  if (qty <= 0) return 0;
  if (qty === 1) return 610;
  if (qty === 2) return 910; // 50% off MRP 1820
  return 610 * qty;
}
window.getTotalAmount = getTotalAmount;
const RAZORPAY_API_URL = (typeof CONFIG !== 'undefined' && CONFIG.razorpayApiUrl) ? CONFIG.razorpayApiUrl : (window.location.origin + '/.netlify/functions/create-order');
const ORDER_API_URL = (typeof CONFIG !== 'undefined' && CONFIG.orderApiUrl) ? CONFIG.orderApiUrl : (window.location.origin + '/.netlify/functions/submit-order');

// Meta Pixel events (auto-enabled when metaPixelId set in config.js)
function trackEvent(eventName, params = {}) {
  if (typeof CONFIG !== 'undefined' && CONFIG.metaPixelId && CONFIG.metaPixelId !== 'YOUR_PIXEL_ID' && typeof fbq === 'function') {
    fbq('track', eventName, params);
  }
}
window.trackEvent = trackEvent;

// CTA click tracking
document.querySelectorAll('.cta-order').forEach(btn => {
  btn.addEventListener('click', () => {
    trackEvent('InitiateCheckout', { content_name: 'Natural Kick Energy Drink' });
  });
});

// Preserve UTM params across navigation
function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
    if (params.has(key)) utm[key] = params.get(key);
  });
  return utm;
}

function appendUtmToUrl(url) {
  const utm = getUtmParams();
  if (Object.keys(utm).length === 0) return url;
  const separator = url.includes('?') ? '&' : '?';
  return url + separator + new URLSearchParams(utm).toString();
}

// Update CTA links with UTM params
document.querySelectorAll('a[href="checkout.html"]').forEach(link => {
  link.href = appendUtmToUrl('checkout.html');
});
document.querySelectorAll('a[href="checkout.html?qty=2"]').forEach(link => {
  link.href = appendUtmToUrl('checkout.html?qty=2');
});

// Generate unique Order ID (PP = Platinum Pine)
function generateOrderId() {
  const now = new Date();
  const ts = now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${ts}${rand}`;
}

// Pincode lookup - India Postal API (free, no key)
async function fetchLocationFromPincode(pincode) {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length) {
      const po = data[0].PostOffice[0];
      return {
        district: po.District,
        state: po.State
      };
    }
  } catch (e) { console.error('Pincode fetch error:', e); }
  return null;
}

// Checkout form handling (runs on checkout.html)
if (document.getElementById('order-form')) {
  const form = document.getElementById('order-form');
  const quantityInput = document.getElementById('quantity');
  const totalDisplay = document.getElementById('order-total');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Update total on quantity change (uses getTotalAmount for Buy 2 offer)
  function updateTotal() {
    const qty = Math.max(1, Math.min(10, parseInt(quantityInput?.value || 1, 10)));
    quantityInput.value = qty;
    const total = getTotalAmount(qty);
    if (totalDisplay) totalDisplay.textContent = `₹${total}`;
    const sidebarTotal = document.getElementById('order-total-sidebar');
    if (sidebarTotal) sidebarTotal.textContent = `₹${total}`;
    const sidebarQty = document.getElementById('qty-display-sidebar');
    if (sidebarQty) sidebarQty.textContent = qty;
    const qtyDisplay = document.getElementById('qty-display');
    if (qtyDisplay) qtyDisplay.textContent = qty;
    // Price per unit display
    const pricePerUnitEl = document.getElementById('price-per-unit-display');
    if (pricePerUnitEl) pricePerUnitEl.textContent = qty === 2 ? '₹455 (50% off)' : '₹610';
    const pricePerUnitSidebar = document.getElementById('price-per-unit-sidebar');
    if (pricePerUnitSidebar) pricePerUnitSidebar.textContent = qty === 2 ? '₹455 (50% off)' : '₹610';
    // Discount line (Buy 2)
    const discountRow = document.getElementById('order-discount-row');
    if (discountRow) discountRow.style.display = qty === 2 ? '' : 'none';
    const discountRowSidebar = document.getElementById('order-discount-row-sidebar');
    if (discountRowSidebar) discountRowSidebar.style.display = qty === 2 ? '' : 'none';
    // Congrats hint
    const congratsHint = document.getElementById('buy2-congrats-hint');
    if (congratsHint) congratsHint.style.display = qty === 2 ? '' : 'none';
  }

  if (quantityInput) {
    quantityInput.addEventListener('input', updateTotal);
    quantityInput.addEventListener('change', updateTotal);
    // Pre-fill quantity from URL (e.g. checkout.html?qty=2)
    const urlParams = new URLSearchParams(window.location.search);
    const qtyParam = parseInt(urlParams.get('qty') || '0', 10);
    if (qtyParam >= 1 && qtyParam <= 10) {
      quantityInput.value = qtyParam;
    }
    updateTotal();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const paymentMethod = formData.get('payment_method');
    const quantity = parseInt(formData.get('quantity') || 1, 10);
    const total = getTotalAmount(quantity);
    const orderId = generateOrderId();
    const isBuy2Offer = quantity === 2;

    const phoneCountry = formData.get('phone_country') || '+91';
    const countryWithPlus = phoneCountry.startsWith('+') ? phoneCountry : '+' + phoneCountry;
    const phoneNumber = (formData.get('phone') || '').replace(/\D/g, '').slice(-10);
    const fullPhone = phoneNumber.length === 10 ? countryWithPlus + phoneNumber : (formData.get('phone') || '');

    const utm = getUtmParams();
    const orderPayload = {
      order_id: orderId,
      name: formData.get('name') || '',
      phone: fullPhone,
      email: formData.get('email') || '',
      address_line1: formData.get('address_line1') || '',
      address_line2: formData.get('address_line2') || '',
      city: formData.get('city') || '',
      district: formData.get('district') || '',
      state: formData.get('state') || '',
      pincode: formData.get('pincode') || '',
      quantity: quantity,
      total_amount: total,
      payment_method: paymentMethod,
      utm_source: utm.utm_source || '',
      utm_medium: utm.utm_medium || '',
      utm_campaign: utm.utm_campaign || ''
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      if (paymentMethod === 'cod') {
        const response = await fetch(ORDER_API_URL, {
          method: 'POST',
          body: JSON.stringify(orderPayload),
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
        });
        const resData = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(resData.error || 'Order submission failed. Please try again.');
        }
        trackEvent('Purchase', { value: total, currency: 'INR' });
        const params = new URLSearchParams({ method: 'cod', total: total, order_id: orderId, quantity: quantity });
        if (isBuy2Offer) params.set('offer', 'buy2');
        Object.entries(getUtmParams()).forEach(([k, v]) => params.append(k, v));
        window.location.href = 'success.html?' + params.toString();
        return;
      }

      // Online payment: run order submit and Razorpay create-order in parallel for faster open
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_ID.startsWith('rzp_')) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Proceed to Pay';
        alert('Razorpay not configured. Add razorpayKeyId in config.js and deploy to Netlify.\n\nSee RAZORPAY_SETUP.md');
        return;
      }
      if (typeof Razorpay === 'undefined') {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Proceed to Pay';
        alert('Razorpay script failed to load. Check your connection or disable ad blocker.');
        return;
      }

      trackEvent('InitiateCheckout', { value: total });
      sessionStorage.setItem('pp_order_id', orderId);

      const orderSubmitPromise = fetch(ORDER_API_URL, {
        method: 'POST',
        body: JSON.stringify(orderPayload),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
      });
      const orderPromise = fetch(RAZORPAY_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total * 100,
          receipt: orderId,
          notes: { order_id: orderId }
        })
      });

      const [response, orderRes] = await Promise.all([orderSubmitPromise, orderPromise]);

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.error || 'Order submission failed. Please try again.');
      }

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.orderId) throw new Error(orderData.error || 'Order creation failed');

      const customerName = (orderPayload.name || '').trim();
      const customerEmail = (orderPayload.email || '').trim();
      const fullContact = orderPayload.phone || '';
      const prefill = {};
      if (customerName) prefill.name = customerName;
      if (customerEmail) prefill.email = customerEmail;
      if (fullContact) prefill.contact = fullContact;

      const logoUrl = window.location.origin + '/assets/images/platinum-pine-logo.png';
      const productDesc = quantity > 1
        ? 'Natural Kick Energy Drink - Qty ' + quantity + ' - Rs ' + total
        : 'Natural Kick Energy Drink - Rs 610';

      const options = {
        key: orderData.keyId || RAZORPAY_KEY_ID,
        amount: orderData.amount || total * 100,
        currency: 'INR',
        name: 'Platinum Pine - Natural Kick',
        description: productDesc,
        image: logoUrl,
        order_id: orderData.orderId,
        prefill: prefill,
        theme: { color: '#c9a227' },
        notes: { product: 'Natural Kick Energy Drink', quantity: quantity.toString(), total: total.toString() },
        handler: function (response) {
          const params = new URLSearchParams({ method: 'online', total: total, order_id: orderId, quantity: quantity });
          if (isBuy2Offer) params.set('offer', 'buy2');
          Object.entries(getUtmParams()).forEach(([k, v]) => params.append(k, v));
          window.location.href = 'success.html?' + params.toString();
        },
        modal: { ondismiss: function () { submitBtn.disabled = false; submitBtn.textContent = 'Proceed to Pay'; } }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.textContent = paymentMethod === 'cod' ? 'Place Order' : 'Proceed to Pay';
      alert('Something went wrong. Please try again.');
    }
  });

  // Pincode fetch - auto-fill City, District, State
  const pincodeInput = document.getElementById('pincode');
  const fetchBtn = document.getElementById('fetch-location-btn');
  const statusEl = document.getElementById('pincode-status');

  async function handlePincodeFetch() {
    const pincode = pincodeInput?.value?.trim();
    if (!pincode || pincode.length !== 6) {
      if (statusEl) statusEl.textContent = 'Enter 6-digit pincode';
      return;
    }
    if (statusEl) statusEl.textContent = 'Fetching...';
    if (fetchBtn) fetchBtn.disabled = true;

    const location = await fetchLocationFromPincode(pincode);
    if (location) {
      document.getElementById('district').value = location.district;
      document.getElementById('state').value = location.state;
      if (statusEl) { statusEl.textContent = '✓ Location found'; statusEl.className = 'pincode-status success'; }
    } else {
      if (statusEl) { statusEl.textContent = 'Invalid pincode'; statusEl.className = 'pincode-status error'; }
    }
    if (fetchBtn) fetchBtn.disabled = false;
  }

  if (fetchBtn) fetchBtn.addEventListener('click', handlePincodeFetch);
  if (pincodeInput) {
    pincodeInput.addEventListener('blur', () => { if (pincodeInput.value.length === 6) handlePincodeFetch(); });
    pincodeInput.addEventListener('input', () => { if (statusEl) statusEl.textContent = ''; });
  }

  // Payment option selection UI
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;

      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = opt.dataset.method === 'cod' ? 'Place Order' : 'Proceed to Pay';
    });
  });
}

// Success page - show dynamic message + Order ID + Buy 2 congratulations
if (document.getElementById('success-message') || document.getElementById('order-id-display')) {
  const params = new URLSearchParams(window.location.search);
  const method = params.get('method') || 'cod';
  const total = params.get('total') || PRICE_PER_UNIT;
  const quantity = parseInt(params.get('quantity') || '1', 10);
  const offerBuy2 = params.get('offer') === 'buy2' || quantity === 2;
  let orderId = params.get('order_id');
  if (!orderId) orderId = sessionStorage.getItem('pp_order_id') || '';
  if (orderId) sessionStorage.removeItem('pp_order_id');

  const orderIdEl = document.getElementById('order-id-display');
  if (orderIdEl && orderId) {
    orderIdEl.textContent = orderId;
    orderIdEl.closest('.order-id-block')?.classList.remove('hidden');
  }

  const congratsEl = document.getElementById('success-congrats-buy2');
  if (congratsEl && offerBuy2) {
    congratsEl.classList.remove('hidden');
    const congratsText = congratsEl.querySelector('.success-congrats-text');
    if (congratsText && method === 'cod') {
      congratsText.innerHTML = 'You got 50% off — 2 units for just ₹910! Pay ₹910 when your order arrives.';
    }
  }

  const msgEl = document.getElementById('success-message');
  if (msgEl) {
    if (offerBuy2) {
      msgEl.classList.add('hidden');
    } else if (method === 'cod') {
      msgEl.innerHTML = `Your order is confirmed! Pay <strong>₹${total}</strong> when your order arrives. We'll call you before delivery.`;
    } else {
      msgEl.innerHTML = `Payment received! Your order is confirmed. We'll deliver to your address soon.`;
    }
  }
}

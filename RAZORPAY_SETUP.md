# Razorpay Integration Guide (Proper Checkout)

Platinum Pine uses **Razorpay Standard Checkout** — popup on same page, dynamic amount (quantity × ₹610), proper payment capture.

---

## Requirements

- Razorpay account ([dashboard.razorpay.com](https://dashboard.razorpay.com))
- **Netlify** for deployment (serverless function for order creation)
- Domain: platinumpine.in

---

## Step 1: Razorpay API Keys

1. Dashboard → **Settings** → **API Keys**
2. Generate **Key ID** and **Key Secret**
3. **Test Mode** ke liye: `rzp_test_xxxxx`
4. **Live Mode** ke liye: `rzp_live_xxxxx` (KYC complete hona chahiye)

---

## Step 2: config.js Update

```javascript
razorpayKeyId: 'rzp_test_xxxxxxxx',  // Your Key ID (public, safe in frontend)
```

**Important:** Key Secret kabhi config.js me mat daalo. Sirf Netlify env vars me.

---

## Step 3: Netlify Deployment

1. Push code to GitHub
2. [app.netlify.com](https://app.netlify.com) → New site from Git
3. Build settings: **Publish directory:** `.` (root)
4. Deploy

---

## Step 4: Netlify Environment Variables

Site → **Site settings** → **Environment variables** → Add:

| Variable | Value | Scoped to |
|----------|-------|-----------|
| `RAZORPAY_KEY_ID` | rzp_test_xxxxx (or rzp_live_xxxxx) | All |
| `RAZORPAY_KEY_SECRET` | Your Key Secret | All |

**Redeploy** after adding env vars.

---

## Step 5: Custom Domain (Optional)

Netlify → Domain settings → Add custom domain → `platinumpine.in`

---

## Flow

1. User fills form, selects **Pay Online**
2. Form submits to Formspree (order saved)
3. Frontend calls `/.netlify/functions/create-order` with amount (₹610 × qty)
4. Server creates Razorpay order, returns `order_id`
5. Razorpay Checkout popup opens
6. User pays → Success page with Order ID

---

## Local Testing

```bash
netlify dev
```

Opens `http://localhost:8888` — functions work locally. `npx serve` se functions nahi chalenge.

---

## Test Cards (Test Mode)

| Card | Result |
|------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Failure |

CVV: any 3 digits, Expiry: any future date

---

## Troubleshooting

**"Order creation failed"**
- Check Netlify env vars (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
- Redeploy after adding env vars

**"Razorpay is not defined"**
- Checkout script load ho raha hai? (checkout.html me hai)
- Ad blocker disable karo

**CORS error**
- Netlify function already sends `Access-Control-Allow-Origin: *`

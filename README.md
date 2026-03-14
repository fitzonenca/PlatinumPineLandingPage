# Natural Kick Energy Drink - Landing Page

Meta Ads se aane wale customers ke liye conversion-focused landing page. **Platinum Pine** brand, **Natural Kick Energy Drink** product.

## Setup (Live karne se pehle)

### 1. Order Backend (Supabase + Resend)
**Full guide:** [ORDER_BACKEND_SETUP.md](ORDER_BACKEND_SETUP.md)

1. Supabase project banao, `supabase-orders-table.sql` run karo
2. Resend pe signup, API key lo
3. Netlify env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ORDER_NOTIFICATION_EMAIL`

### 2. Razorpay (Standard Checkout)
**Full guide:** [RAZORPAY_SETUP.md](RAZORPAY_SETUP.md)

1. Razorpay Dashboard → API Keys → Copy **Key ID**
2. `config.js` me `razorpayKeyId` paste karo
3. **Netlify** pe deploy karo
4. Netlify env vars: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

**Note:** Netlify serverless function order create karta hai. Multi-quantity support hai (₹610 × qty).

### 3. Meta Pixel (Optional)
1. Facebook Events Manager me Pixel banao
2. `config.js` me `metaPixelId` me apna Pixel ID paste karo — Pixel auto-enable ho jayega

## File Structure

```
├── index.html       # Landing page
├── checkout.html    # Order form (COD + Online)
├── success.html     # Order confirmation
├── config.js        # Razorpay, Pixel IDs
├── css/style.css
├── js/main.js
└── assets/images/
    └── platinum-pine-logo.png
```

## Local Testing

Simple HTTP server chalao (API fetch CORS ke liye):

```bash
npx serve .
```

Ya VS Code Live Server extension use karo.

## Order ID & Confirmation

- **Order ID:** Har order pe unique ID generate hoti hai (e.g. `PP-2503031802X7K9`)
- **Confirmation kahan aati hai:**
  1. **Success page** – Order place hone ke baad user ko Order ID dikhti hai
  2. **Email** – Resend se tumhe order details + Order ID email aata hai
  3. **Supabase** – Saare orders database mein save hote hain

## Price

- MRP: ₹910
- Selling: ₹610 (33% off)

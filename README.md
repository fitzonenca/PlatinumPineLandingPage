# Natural Kick Energy Drink - Landing Page

Meta Ads se aane wale customers ke liye conversion-focused landing page. **Platinum Pine** brand, **Natural Kick Energy Drink** product.

## Setup (Live karne se pehle)

### 1. Formspree
1. [formspree.io](https://formspree.io) pe jao
2. New form banao
3. `config.js` me `formspreeId` me apna form ID paste karo (e.g. `xyzabcde`)
4. (Optional) Formspree Settings → Notifications → **Auto-responder** enable karo taaki customer ko confirmation email jaye

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
├── config.js        # Formspree, Razorpay, Pixel IDs
├── css/style.css
├── js/main.js
└── assets/images/
    └── platinum-pine-logo.png
```

## Local Testing

Simple HTTP server chalao (Formspree fetch CORS ke liye):

```bash
npx serve .
```

Ya VS Code Live Server extension use karo.

## Order ID & Confirmation

- **Order ID:** Har order pe unique ID generate hoti hai (e.g. `PP-2503031802X7K9`)
- **Confirmation kahan aati hai:**
  1. **Success page** – Order place hone ke baad user ko Order ID dikhti hai
  2. **Formspree email** – Aapko (form owner) email aata hai with order details + Order ID
  3. **Formspree dashboard** – [formspree.io/forms](https://formspree.io/forms) pe saare submissions with Order ID

## Price

- MRP: ₹910
- Selling: ₹610 (33% off)

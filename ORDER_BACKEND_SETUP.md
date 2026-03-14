# Order Backend Setup (Formspree Replacement)

Orders ab Supabase + Resend se handle hote hain.

## 1. Supabase

1. [supabase.com](https://supabase.com) pe signup / login
2. New project banao
3. **SQL Editor** → `supabase-orders-table.sql` ka content paste karo → Run
4. **Settings** → **API** se copy karo:
   - Project URL → `SUPABASE_URL`
   - Service role key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Resend (Email)

1. [resend.com](https://resend.com) pe signup
2. **API Keys** → Create → copy `RESEND_API_KEY`
3. Free tier: apna email verify karo (jahan orders aayenge)

## 3. Netlify Environment Variables

Netlify → Site → **Site settings** → **Environment variables** → Add:

| Variable | Value |
|----------|-------|
| SUPABASE_URL | https://xxx.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | eyJ... |
| RESEND_API_KEY | re_... |
| ORDER_NOTIFICATION_EMAIL | your@email.com |

## 4. Deploy

Push to GitHub → Netlify auto-deploy. Orders Supabase mein save + email aayega.

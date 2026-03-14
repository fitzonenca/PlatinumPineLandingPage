-- Platinum Pine - Orders table for Supabase
-- Run STEP 1 first, then STEP 2 (in Supabase Dashboard → SQL Editor)

-- ========== STEP 1: Create table (run this first) ==========
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  quantity INTEGER DEFAULT 1,
  total_amount INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'cod',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== STEP 2: Create indexes (run after STEP 1 succeeds) ==========
-- CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
-- CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

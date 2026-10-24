CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verify_token TEXT,
  reset_token TEXT,
  reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  size TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  phone TEXT,
  address TEXT,
  payment_method TEXT NOT NULL DEFAULT 'momo',
  network TEXT,
  momo_number TEXT,
  reference TEXT UNIQUE,
  payment_ref_entered TEXT,
  txn_id TEXT,
  paid_from TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade path for databases created by the first scaffold (Paystack version)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='paystack_ref') THEN
    ALTER TABLE orders RENAME COLUMN paystack_ref TO reference;
  END IF;
END $$;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'momo';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS network TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS momo_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_ref_entered TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS txn_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_from TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
UPDATE orders SET payment_status='awaiting_confirmation' WHERE status='awaiting_confirmation';
UPDATE orders SET payment_status='paid' WHERE status='paid';
UPDATE orders SET status = CASE status WHEN 'delivered' THEN 'completed' ELSE 'new' END
  WHERE status IN ('pending','awaiting_confirmation','paid','delivered');
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('new','confirmed','preparing','out_for_delivery','completed','cancelled'));
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('unpaid','awaiting_confirmation','paid'));

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  photo_url TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

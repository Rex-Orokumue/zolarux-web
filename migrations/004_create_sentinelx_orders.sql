-- ============================================================
-- Migration: Create sentinelx_orders table
-- Run this in Supabase SQL Editor
-- Backs the SentinelX Gaming Exchange escrow integration.
-- Rows are only ever written via the service-role client from
-- app/api/sentinelx/*, app/api/paystack/webhook, and
-- app/api/admin/sentinelx/* — never from a browser session —
-- so RLS is enabled with no policies (service role bypasses RLS).
-- ============================================================

CREATE TABLE IF NOT EXISTS sentinelx_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT UNIQUE NOT NULL,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  amount BIGINT NOT NULL CHECK (amount > 0),
  paystack_reference TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'held', 'released', 'refunded', 'disputed')),
  initiated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  held_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sentinelx_orders_paystack_reference_idx
  ON sentinelx_orders (paystack_reference);

CREATE INDEX IF NOT EXISTS sentinelx_orders_status_idx
  ON sentinelx_orders (status);

ALTER TABLE sentinelx_orders ENABLE ROW LEVEL SECURITY;
-- No policies — only the service-role client (createAdminClient()) reads/writes this table.

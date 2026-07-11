-- ============================================================
-- Permit Portal Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERMITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permits (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  permit_type         TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'processing',
  property_address    TEXT,
  city                TEXT,
  county              TEXT,
  state               TEXT,
  zip                 TEXT,
  contractor_info     TEXT,
  scope_of_work       TEXT,
  estimated_cost      NUMERIC,
  contract_signed     BOOLEAN DEFAULT FALSE,
  upfront_paid        BOOLEAN DEFAULT FALSE,
  ai_analysis_result  JSONB,
  denial_reason       TEXT,
  admin_notes         TEXT,
  resubmitted_from    UUID REFERENCES permits(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast customer lookups
CREATE INDEX IF NOT EXISTS permits_customer_id_idx ON permits(customer_id);
CREATE INDEX IF NOT EXISTS permits_status_idx ON permits(status);

-- ============================================================
-- PERMIT_STAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS permit_stages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permit_id   UUID NOT NULL REFERENCES permits(id) ON DELETE CASCADE,
  stage_name  TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS permit_stages_permit_id_idx ON permit_stages(permit_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_permits_updated_at ON permits;
CREATE TRIGGER update_permits_updated_at
  BEFORE UPDATE ON permits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- NOTE: Since we use NextAuth (not Supabase Auth), all
-- server-side operations use the service role key which
-- bypasses RLS. These policies protect direct client access.
-- ============================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE permit_stages ENABLE ROW LEVEL SECURITY;

-- Customers: read own record only
DROP POLICY IF EXISTS "customers_self_read" ON customers;
CREATE POLICY "customers_self_read" ON customers
  FOR SELECT USING (auth.uid()::text = id::text);

-- Permits: customers can only read their own permits
-- (Server-side uses service role so this is a safety net only)
DROP POLICY IF EXISTS "permits_customer_read" ON permits;
CREATE POLICY "permits_customer_read" ON permits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = permits.customer_id
        AND c.email = auth.email()
    )
  );

-- Permit stages: readable if owning permit is accessible
DROP POLICY IF EXISTS "permit_stages_read" ON permit_stages;
CREATE POLICY "permit_stages_read" ON permit_stages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM permits p
      JOIN customers c ON c.id = p.customer_id
      WHERE p.id = permit_stages.permit_id
        AND c.email = auth.email()
    )
  );

-- ============================================================
-- DONE
-- ============================================================
-- Tables created:
--   customers (id, email, name, created_at)
--   permits   (id, customer_id, permit_type, status, property_address,
--              city, county, state, zip, contractor_info, scope_of_work,
--              estimated_cost, contract_signed, upfront_paid,
--              ai_analysis_result, denial_reason, admin_notes,
--              resubmitted_from, created_at, updated_at)
--   permit_stages (id, permit_id, stage_name, completed_at)

-- Add new toggle columns (run if tables already exist)
ALTER TABLE permits ADD COLUMN IF NOT EXISTS has_subs BOOLEAN DEFAULT FALSE;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS property_owned BOOLEAN DEFAULT FALSE;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS under_contract BOOLEAN DEFAULT FALSE;
ALTER TABLE permits ADD COLUMN IF NOT EXISTS estimate_signed BOOLEAN DEFAULT FALSE;

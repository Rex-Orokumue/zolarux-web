-- ============================================================
-- Migration: Add brand, condition, and specs to products
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- All columns are nullable — existing rows are unaffected, and the app UI
-- handles null brand/condition/specs gracefully throughout.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS condition TEXT,
  ADD COLUMN IF NOT EXISTS specs JSONB;

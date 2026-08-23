-- Adds retail-discovery facets to products: brand (free text), condition
-- (new / uk_used / refurbished / used), and specs (optional key/value spec list).
-- All columns are nullable — existing rows are unaffected, and the app UI
-- already handles null brand/condition/specs gracefully.
--
-- This file is a reference only. There is no migration tooling wired into
-- this repo — apply it directly against the Supabase project's SQL editor,
-- or via the Supabase MCP tool if connected, before relying on these fields
-- returning real data.

alter table products
  add column if not exists brand text,
  add column if not exists condition text,
  add column if not exists specs jsonb;

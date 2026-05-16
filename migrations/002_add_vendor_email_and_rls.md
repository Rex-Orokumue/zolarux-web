# RLS & Schema Fix Plan

## Overview
Properly architect the auth/RLS system so vendors operate as authenticated users,
not via service-role bypass.

## Changes

### 1. SQL Migration — Add `email` to `vendors` table
- `ALTER TABLE vendors ADD COLUMN email TEXT;`
- Backfill from vendor_applications

### 2. SQL — RLS policies for `products` table
- SELECT: public (anyone can browse)
- INSERT: authenticated vendors can insert where vendor_id matches their vendor record
- UPDATE: authenticated vendors can update their own products
- DELETE: authenticated vendors can delete their own products

### 3. Code Changes
- vendor-apply route: include email in vendors insert
- activate page: include email in vendors update
- product creation: switch from admin client → normal authenticated client
- vendor profile: read email directly from vendors table
- Remove /api/products/create route (no longer needed)

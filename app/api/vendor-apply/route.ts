import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Input sanitizers
function sanitize(str: unknown): string {
  if (typeof str !== 'string') return ''
  return str.trim().replace(/[\x00-\x1F]/g, '').slice(0, 500)
}
function isValidPhone(phone: string): boolean {
  const clean = phone.replace(/[\s-]/g, '')
  return /^(\+?234|0)[789][01]\d{8}$/.test(clean)
}
function isValidNIN(nin: string): boolean {
  return /^[0-9]{11}$/.test(nin)
}
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 vendor applications per 10 minutes per IP
  const { rateLimit, getClientIp } = await import('@/lib/rate-limit')
  const ip = getClientIp(request.headers)
  const { limited, resetIn } = rateLimit(`vendor-apply:${ip}`, 5, 600_000)
  if (limited) {
    return NextResponse.json(
      { error: 'Too many submissions. Please wait and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    // Sanitize all inputs
    const cleanData = {
      business_name: sanitize(body.business_name),
      category: sanitize(body.category),
      phone_number: sanitize(body.phone_number),
      email: sanitize(body.email),
      business_address: sanitize(body.business_address),
      instagram_handle: sanitize(body.instagram_handle),
      whatsapp_number: sanitize(body.whatsapp_number),
      years_in_business: sanitize(body.years_in_business),
      owner_full_name: sanitize(body.owner_full_name),
      nin_number: sanitize(body.nin_number),
      id_type: sanitize(body.id_type),
      supplier_name: sanitize(body.supplier_name),
      supplier_relationship: sanitize(body.supplier_relationship),
      business_description: sanitize(body.business_description).slice(0, 2000),
      guarantor_name: sanitize(body.guarantor_name),
      guarantor_phone: sanitize(body.guarantor_phone),
      agrees_to_terms: body.agrees_to_terms,
      agrees_to_sop: body.agrees_to_sop,
      agrees_to_escrow: body.agrees_to_escrow,
    }

    // Validate required fields
    if (!cleanData.business_name || !cleanData.category || !cleanData.phone_number || !cleanData.whatsapp_number) {
      return NextResponse.json({ error: 'Missing required business fields' }, { status: 400 })
    }
    if (!cleanData.owner_full_name || !cleanData.nin_number || !cleanData.supplier_name || !cleanData.business_description) {
      return NextResponse.json({ error: 'Missing required identity fields' }, { status: 400 })
    }
    if (!cleanData.guarantor_name || !cleanData.guarantor_phone) {
      return NextResponse.json({ error: 'Missing guarantor information' }, { status: 400 })
    }
    if (!cleanData.agrees_to_terms || !cleanData.agrees_to_sop || !cleanData.agrees_to_escrow) {
      return NextResponse.json({ error: 'All agreements must be accepted' }, { status: 400 })
    }

    // Format validation
    if (!isValidPhone(cleanData.phone_number)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }
    if (!isValidPhone(cleanData.whatsapp_number)) {
      return NextResponse.json({ error: 'Invalid WhatsApp number format' }, { status: 400 })
    }
    if (!isValidNIN(cleanData.nin_number)) {
      return NextResponse.json({ error: 'NIN must be exactly 11 digits' }, { status: 400 })
    }
    if (cleanData.email && !isValidEmail(cleanData.email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }
    if (!isValidPhone(cleanData.guarantor_phone)) {
      return NextResponse.json({ error: 'Invalid guarantor phone number' }, { status: 400 })
    }

    // Admin client bypasses RLS
    const supabase = createAdminClient()
    const ref = `ZLX-V-${Date.now().toString(36).toUpperCase()}`

    // 1. Insert into vendor_applications (intake record)
    const { error: appErr } = await supabase
      .from('vendor_applications')
      .insert({
        reference: ref,
        business_name: cleanData.business_name,
        category: cleanData.category,
        phone_number: cleanData.phone_number,
        email: cleanData.email || null,
        business_address: cleanData.business_address || null,
        instagram_handle: cleanData.instagram_handle || null,
        whatsapp_number: cleanData.whatsapp_number,
        years_in_business: cleanData.years_in_business || null,
        owner_full_name: cleanData.owner_full_name,
        nin_number: cleanData.nin_number,
        id_type: cleanData.id_type || null,
        supplier_name: cleanData.supplier_name,
        supplier_relationship: cleanData.supplier_relationship || null,
        business_description: cleanData.business_description,
        guarantor_name: cleanData.guarantor_name,
        guarantor_phone: cleanData.guarantor_phone,
        agrees_to_terms: cleanData.agrees_to_terms,
        agrees_to_sop: cleanData.agrees_to_sop,
        agrees_to_escrow: cleanData.agrees_to_escrow,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })

    if (appErr) {
      console.error('vendor_applications insert failed:', appErr.message)
      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // 2. Create a pending record in vendors table (admin dashboard reads this)
    const { error: vendorErr } = await supabase
      .from('vendors')
      .insert({
        vendor_id: ref,
        business_name: cleanData.business_name,
        business_category: cleanData.category,
        phone_number: cleanData.phone_number,
        email: cleanData.email || null,
        address: cleanData.business_address || null,
        status: 'pending',
        is_verified: false,
        risk_score: 0,
        trade_count: 0,
        enforcement_count: 0,
      })

    if (vendorErr) {
      console.error('vendors insert failed:', vendorErr.message)
      return NextResponse.json({ error: 'Failed to create vendor record' }, { status: 500 })
    }

    // 3. Notify admin
    await supabase.from('admin_notifications').insert({
      title: 'New Vendor Application',
      message: `${cleanData.business_name} (${cleanData.category}) has submitted a vendor application. Ref: ${ref}`,
      type: 'vendor_application',
      is_read: false,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, reference: ref })

  } catch (error) {
    console.error('Vendor application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

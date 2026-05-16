import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      business_name,
      category,
      phone_number,
      email,
      business_address,
      instagram_handle,
      whatsapp_number,
      years_in_business,
      owner_full_name,
      nin_number,
      id_type,
      supplier_name,
      supplier_relationship,
      business_description,
      guarantor_name,
      guarantor_phone,
      agrees_to_terms,
      agrees_to_sop,
      agrees_to_escrow,
    } = body

    // Validate required fields
    if (!business_name || !category || !phone_number || !whatsapp_number) {
      return NextResponse.json({ error: 'Missing required business fields' }, { status: 400 })
    }
    if (!owner_full_name || !nin_number || !supplier_name || !business_description) {
      return NextResponse.json({ error: 'Missing required identity fields' }, { status: 400 })
    }
    if (!guarantor_name || !guarantor_phone) {
      return NextResponse.json({ error: 'Missing guarantor information' }, { status: 400 })
    }
    if (!agrees_to_terms || !agrees_to_sop || !agrees_to_escrow) {
      return NextResponse.json({ error: 'All agreements must be accepted' }, { status: 400 })
    }

    // Admin client bypasses RLS
    const supabase = createAdminClient()
    const ref = `ZLX-V-${Date.now().toString(36).toUpperCase()}`

    // 1. Insert into vendor_applications (intake record)
    const { error: appErr } = await supabase
      .from('vendor_applications')
      .insert({
        reference: ref,
        business_name,
        category,
        phone_number,
        email: email || null,
        business_address: business_address || null,
        instagram_handle: instagram_handle || null,
        whatsapp_number,
        years_in_business: years_in_business || null,
        owner_full_name,
        nin_number,
        id_type: id_type || null,
        supplier_name,
        supplier_relationship: supplier_relationship || null,
        business_description,
        guarantor_name,
        guarantor_phone,
        agrees_to_terms,
        agrees_to_sop,
        agrees_to_escrow,
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
        business_name,
        business_category: category,
        phone_number,
        email: email || null,
        address: business_address || null,
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
      message: `${business_name} (${category}) has submitted a vendor application. Ref: ${ref}`,
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

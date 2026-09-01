import { createClient } from '@/lib/supabase/client'

export interface StolenReportInput {
  item_name: string
  imei?: string
  serial_number?: string
  date_stolen?: string
  location_stolen?: string
  police_report_ref?: string
  owner_contact: string
  description?: string
}

export async function submitStolenReport(
  input: StolenReportInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient()
  const { error } = await supabase.from('stolen_reports').insert({
    item_name: input.item_name.trim(),
    imei: input.imei?.trim() || null,
    serial_number: input.serial_number?.trim() || null,
    date_stolen: input.date_stolen || null,
    location_stolen: input.location_stolen?.trim() || null,
    police_report_ref: input.police_report_ref?.trim() || null,
    owner_contact: input.owner_contact.trim(),
    description: input.description?.trim() || null,
    status: 'pending',
  })
  if (error) {
    console.error('submitStolenReport error:', error)
    return {
      ok: false,
      error: 'Could not submit the report. Please try again or message us on WhatsApp.',
    }
  }
  return { ok: true }
}

export interface StolenRecord {
  item_name: string | null
  imei: string | null
  serial_number: string | null
  date_stolen?: string | null
  location_stolen?: string | null
  created_at: string
}

export interface DeviceCheckResult {
  status: 'stolen' | 'reported' | 'clean' | 'error' | 'invalid'
  record?: StolenRecord
}

export async function checkDevice(query: string): Promise<DeviceCheckResult> {
  const q = query.trim().replace(/[^a-zA-Z0-9]/g, '')
  if (q.length < 5 || q.length > 20) return { status: 'invalid' }

  const supabase = createClient()

  // 1. Confirmed registry
  const reg = await supabase
    .from('stolen_registry')
    .select('item_name, imei, serial_number, created_at')
    .or(`imei.eq.${q},serial_number.eq.${q}`)
    .limit(1)
  if (reg.error) return { status: 'error' }
  if (reg.data && reg.data.length > 0) return { status: 'stolen', record: reg.data[0] as StolenRecord }

  // 2. Pending reports
  const rep = await supabase
    .from('stolen_reports')
    .select('item_name, imei, serial_number, date_stolen, location_stolen, created_at')
    .eq('status', 'pending')
    .or(`imei.eq.${q},serial_number.eq.${q}`)
    .limit(1)
  if (rep.error) return { status: 'error' }
  if (rep.data && rep.data.length > 0) return { status: 'reported', record: rep.data[0] as StolenRecord }

  return { status: 'clean' }
}

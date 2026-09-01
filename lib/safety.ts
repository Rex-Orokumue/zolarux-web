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

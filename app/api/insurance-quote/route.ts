import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// This route receives the insurance quote details from the /insurance page
// and emails them to one or more configured partners using Resend.
export async function POST(request: Request) {
  console.log('[insurance-quote] Received a quote request')

  try {
    const data = await request.json()

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.INSURANCE_FROM_EMAIL
    const partnersConfig = process.env.INSURANCE_PARTNERS

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[insurance-quote] Missing Supabase server configuration')
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }
    if (!apiKey) {
      console.error('[insurance-quote] Missing RESEND_API_KEY in .env.local')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    if (!fromEmail || !partnersConfig) {
      console.error('[insurance-quote] Missing INSURANCE_FROM_EMAIL or INSURANCE_PARTNERS in .env.local')
      return NextResponse.json({ error: 'Email addresses not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const clean = (value: unknown) => {
      if (value === undefined || value === null || value === '') return '&mdash;'
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    const row = (label: string, value: unknown) =>
      `<tr>
        <td style="padding: 6px 10px; font-weight: bold; border-bottom: 1px solid #eee; width: 40%;">${label}</td>
        <td style="padding: 6px 10px; border-bottom: 1px solid #eee;">${clean(value)}</td>
      </tr>`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; color: #111;">
        <h2 style="color: #b45309; margin-bottom: 4px;">New insurance quote request</h2>
        <p style="color: #555; margin-top: 0;">A driver has submitted a quote request on UK Driver Hub.</p>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Contact details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Full name', data.name)}
          ${row('Phone', data.phone)}
          ${row('Email', data.email)}
          ${row('Postcode', data.postcode)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Licensing</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Council / area', data.council)}
          ${row('Licence type', data.licence_type)}
          ${row('Years held taxi/PH badge', data.years_held_taxi_badge)}
          ${row('Years held full driving licence', data.years_held_full_licence)}
          ${row('Best time to call', data.best_time_to_call)}
          ${row('When do you need cover from?', data.cover_start_date)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Vehicle</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Vehicle make and model', data.vehicle_make_model)}
          ${row('Registration', data.vehicle_reg)}
          ${row('Estimated annual mileage', data.estimated_annual_mileage)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Cover &amp; history</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Cover type', data.cover_type)}
          ${row('No-claims years', data.no_claims_years)}
          ${row('Penalty points', data.points_count)}
          ${row('Points details', data.points_details)}
          ${row('Vehicle usage', data.usage_details)}
          ${row('Claims / convictions in last 5 years?', data.claims_history)}
        </table>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Sent automatically by UK Driver Hub.</p>
      </div>
    `

    const enquiryPayload = {
      ...data,
      user_id: typeof data.user_id === 'string' && data.user_id ? data.user_id : null,
      consent: Boolean(data.consent),
      consent_text: typeof data.consent_text === 'string' ? data.consent_text : null,
    }

    const { error: insertError } = await supabase.from('insurance_enquiries').insert([enquiryPayload])
    if (insertError) {
      console.error('[insurance-quote] Failed to save enquiry:', insertError)
      return NextResponse.json({ error: 'Failed to save enquiry', details: insertError }, { status: 500 })
    }

    const partners = partnersConfig
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const parts = entry.split('|').map((part) => part.trim())
        const [name, to, ccText = ''] = parts
        if (!name || !to) {
          throw new Error(`Invalid partner entry: ${entry}`)
        }

        const cc = ccText
          .split(',')
          .map((address) => address.trim())
          .filter(Boolean)

        return { name, to, cc }
      })

    const sentResults: Array<{ partner: string; id?: string; status: 'sent' | 'failed'; error?: string }> = []

    for (const partner of partners) {
      const { data: sent, error } = await resend.emails.send({
        from: fromEmail,
        to: [partner.to],
        cc: partner.cc.length > 0 ? partner.cc : undefined,
        replyTo: typeof data.email === 'string' && data.email ? data.email : undefined,
        subject: `New insurance quote request \u2014 ${clean(data.name)}`,
        html,
      })

      if (error) {
        console.error(`[insurance-quote] Partner ${partner.name} failed to send. Resend error:`, error)
        sentResults.push({ partner: partner.name, status: 'failed', error: String(error) })
        continue
      }

      console.log(`[insurance-quote] Partner ${partner.name} sent successfully. Resend id:`, sent?.id)
      sentResults.push({ partner: partner.name, status: 'sent', id: sent?.id })
    }

    const failed = sentResults.filter((result) => result.status === 'failed')
    const succeeded = sentResults.filter((result) => result.status === 'sent')

    if (failed.length > 0 && succeeded.length === 0) {
      return NextResponse.json({ success: false, sent: [], failed }, { status: 500 })
    }

    return NextResponse.json({ success: true, sent: succeeded, failed })
  } catch (err) {
    console.error('[insurance-quote] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
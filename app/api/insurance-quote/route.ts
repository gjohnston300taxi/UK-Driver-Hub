import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// The ONLY fields we accept from the form, with a maximum length for each.
// Anything else sent to this route is ignored.
const ALLOWED_FIELDS: Record<string, number> = {
  name: 120,
  email: 200,
  phone: 40,
  postcode: 12,
  council: 120,
  licence_type: 60,
  years_held_taxi_badge: 20,
  years_held_full_licence: 20,
  best_time_to_call: 60,
  vehicle_make_model: 120,
  vehicle_reg: 15,
  cover_start_date: 10,
  cover_type: 60,
  estimated_annual_mileage: 10,
  no_claims_years: 20,
  points_count: 3, // now just 'Yes' or 'No'
  usage_details: 500,
  claims_history: 20,
}

// Don't accept the same phone number more than this many times in this many minutes
const MAX_REQUESTS = 3
const WINDOW_MINUTES = 10

// This route receives the insurance quote details from the /insurance page,
// saves them, and emails them to the configured insurance partners using Resend.
export async function POST(request: Request) {
  console.log('[insurance-quote] Received a quote request')

  try {
    const data = await request.json().catch(() => null)
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Spam trap: a hidden "website" box that people can't see but bots fill in.
    // Pretend it worked so the bot doesn't try again.
    if (typeof data.website === 'string' && data.website.trim() !== '') {
      console.warn('[insurance-quote] Spam trap triggered, request ignored')
      return NextResponse.json({ success: true })
    }

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

    // 1. Keep only the allowed fields, as trimmed text, cut to a safe length
    const fields: Record<string, string> = {}
    for (const [key, maxLength] of Object.entries(ALLOWED_FIELDS)) {
      const value = data[key]
      fields[key] = value === undefined || value === null ? '' : String(value).trim().slice(0, maxLength)
    }

    // Penalty points and claims/convictions are yes/no answers only
    for (const key of ['points_count', 'claims_history']) {
      if (fields[key] && fields[key] !== 'Yes' && fields[key] !== 'No') fields[key] = ''
    }

    // 2. Check the required fields and consent on the server too
    if (!fields.name || !fields.phone || !fields.postcode || !fields.council || !fields.cover_start_date) {
      return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 })
    }
    if (fields.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.cover_start_date)) {
      return NextResponse.json({ error: 'Please enter a valid cover start date' }, { status: 400 })
    }
    if (data.consent !== true) {
      return NextResponse.json({ error: 'Consent is required' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // 3. Work out who is signed in from their login token, instead of trusting
    //    an ID sent by the browser. Guests simply get no user_id.
    let userId: string | null = null
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (token) {
      const { data: userData } = await supabase.auth.getUser(token)
      userId = userData?.user?.id ?? null
    }

    // 4. Simple flood protection: limit repeat requests from the same phone number
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString()
    const { count: recentCount } = await supabase
      .from('insurance_enquiries')
      .select('id', { count: 'exact', head: true })
      .eq('phone', fields.phone)
      .gte('created_at', since)
    if ((recentCount || 0) >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: 'We have already received your request. Please wait a few minutes before trying again.' },
        { status: 429 }
      )
    }

    const consentText = typeof data.consent_text === 'string' ? data.consent_text.slice(0, 500) : null
    const mileage = parseInt(fields.estimated_annual_mileage, 10)

    const enquiryPayload = {
      ...fields,
      email: fields.email || null,
      // These two columns are a number and a date in the database
      estimated_annual_mileage: Number.isFinite(mileage) && mileage >= 0 ? mileage : null,
      cover_start_date: fields.cover_start_date,
      user_id: userId,
      consent: true,
      consent_text: consentText,
      consent_given_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase.from('insurance_enquiries').insert([enquiryPayload])
    if (insertError) {
      // Full details go to the server log only, never back to the visitor
      console.error('[insurance-quote] Failed to save enquiry:', insertError)
      return NextResponse.json({ error: 'Failed to save enquiry' }, { status: 500 })
    }

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
        <p style="color: #555; margin-top: 0;">A driver has submitted a quote request on UK Driver Hub and consented to being contacted about a quote.</p>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Contact details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Full name', fields.name)}
          ${row('Phone', fields.phone)}
          ${row('Email', fields.email)}
          ${row('Postcode', fields.postcode)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Licensing</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Council / area', fields.council)}
          ${row('Licence type', fields.licence_type)}
          ${row('Years held taxi/PH badge', fields.years_held_taxi_badge)}
          ${row('Years held full driving licence', fields.years_held_full_licence)}
          ${row('Best time to call', fields.best_time_to_call)}
          ${row('When do you need cover from?', fields.cover_start_date)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Vehicle</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Vehicle make and model', fields.vehicle_make_model)}
          ${row('Registration', fields.vehicle_reg)}
          ${row('Estimated annual mileage', fields.estimated_annual_mileage)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Cover &amp; history</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Cover type', fields.cover_type)}
          ${row('No-claims years', fields.no_claims_years)}
          ${row('Any penalty points?', fields.points_count)}
          ${row('Vehicle usage', fields.usage_details)}
          ${row('Claims / convictions in last 5 years?', fields.claims_history)}
        </table>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Sent automatically by UK Driver Hub. Please handle these details in line with data protection law and use them only to provide a quote.</p>
      </div>
    `

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

    const resend = new Resend(apiKey)
    const sentResults: Array<{ partner: string; status: 'sent' | 'failed' }> = []

    // Email subjects are plain text, so only remove line breaks (no HTML escaping)
    const subjectName = fields.name.replace(/[\r\n]+/g, ' ')

    for (const partner of partners) {
      const { data: sent, error } = await resend.emails.send({
        from: fromEmail,
        to: [partner.to],
        cc: partner.cc.length > 0 ? partner.cc : undefined,
        replyTo: fields.email || undefined,
        subject: `New insurance quote request — ${subjectName}`,
        html,
      })

      if (error) {
        console.error(`[insurance-quote] Partner ${partner.name} failed to send. Resend error:`, error)
        sentResults.push({ partner: partner.name, status: 'failed' })
        continue
      }

      console.log(`[insurance-quote] Partner ${partner.name} sent successfully. Resend id:`, sent?.id)
      sentResults.push({ partner: partner.name, status: 'sent' })
    }

    const succeeded = sentResults.filter((result) => result.status === 'sent')
    if (succeeded.length === 0) {
      return NextResponse.json({ success: false, error: 'Could not send your request' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[insurance-quote] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}

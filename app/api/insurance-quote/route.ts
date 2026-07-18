import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// This route receives the insurance quote details from the /insurance page
// and emails them to the address in INSURANCE_TO_EMAIL using Resend.
export async function POST(request: Request) {
  console.log('[insurance-quote] Received a quote request')

  try {
    const data = await request.json()

    const apiKey = process.env.RESEND_API_KEY
    const fromEmail = process.env.INSURANCE_FROM_EMAIL
    const toEmail = process.env.INSURANCE_TO_EMAIL

    // Make sure the settings in .env.local are actually present.
    if (!apiKey) {
      console.error('[insurance-quote] Missing RESEND_API_KEY in .env.local')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }
    if (!fromEmail || !toEmail) {
      console.error('[insurance-quote] Missing INSURANCE_FROM_EMAIL or INSURANCE_TO_EMAIL in .env.local')
      return NextResponse.json({ error: 'Email addresses not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)

    // Escape anything the driver typed so it can't break the email layout
    // or inject links/markup. Also shows a dash for empty fields.
    const clean = (value: unknown) => {
      if (value === undefined || value === null || value === '') return '&mdash;'
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    // Build one table row: label on the left, value on the right.
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
          ${row('Email', data.email)}
          ${row('Phone', data.phone)}
          ${row('Postcode', data.postcode)}
          ${row('Date of birth', data.date_of_birth)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Licensing</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Council / area', data.council)}
          ${row('Licence type', data.licence_type)}
          ${row('Years licensed', data.years_licensed)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Vehicle</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Make', data.vehicle_make)}
          ${row('Model', data.vehicle_model)}
          ${row('Year', data.vehicle_year)}
          ${row('Registration', data.vehicle_reg)}
          ${row('Estimated value', data.vehicle_value)}
        </table>

        <h3 style="border-bottom: 2px solid #eab308; padding-bottom: 4px;">Cover &amp; history</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${row('Cover type', data.cover_type)}
          ${row('No-claims years', data.no_claims_years)}
          ${row('Penalty points', data.points_count)}
          ${row('Points details', data.points_details)}
          ${row('Vehicle usage', data.usage_details)}
          ${row('Claims / convictions', data.claims_history)}
        </table>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Sent automatically by UK Driver Hub.</p>
      </div>
    `

    // INSURANCE_TO_EMAIL may hold one address, or several separated by commas.
    // Split it into a clean list so every recipient receives the lead.
    const recipients = toEmail
      .split(',')
      .map((address) => address.trim())
      .filter((address) => address.length > 0)

    const { data: sent, error } = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      replyTo: typeof data.email === 'string' && data.email ? data.email : undefined,
      subject: `New insurance quote request \u2014 ${clean(data.name)}`,
      html,
    })

    if (error) {
      console.error('[insurance-quote] Resend returned an error:', error)
      return NextResponse.json({ error: 'Failed to send email', details: error }, { status: 500 })
    }

    console.log('[insurance-quote] Email sent successfully. Resend id:', sent?.id)
    return NextResponse.json({ success: true, id: sent?.id })
  } catch (err) {
    console.error('[insurance-quote] Unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
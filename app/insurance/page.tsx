'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Insurer {
  id: string
  title: string
  description: string
  website_url: string
  contact_info: string
  featured: boolean
}

export default function InsurancePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [postcode, setPostcode] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [council, setCouncil] = useState('')
  const [licenceType, setLicenceType] = useState('Private Hire')
  const [yearsLicensed, setYearsLicensed] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [vehicleValue, setVehicleValue] = useState('')
  const [coverType, setCoverType] = useState('Comprehensive')
  const [noClaimsYears, setNoClaimsYears] = useState('')
  const [pointsCount, setPointsCount] = useState('')
  const [pointsDetails, setPointsDetails] = useState('')
  const [usageDetails, setUsageDetails] = useState('')
  const [claimsHistory, setClaimsHistory] = useState('')
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    loadUser()
    loadInsurers()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('name').eq('id', user.id).single()
      if (data?.name) setName(data.name)
    }
    setLoading(false)
  }

  const loadInsurers = async () => {
    const { data } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('category', 'insurance')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
    setInsurers(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setShowSignupPrompt(true)
      return
    }
    if (!name || !email || !phone || !postcode) {
      alert('Please fill in at least your name, email, phone and postcode.')
      return
    }
    if (!consent) {
      alert('Please tick the box to confirm you are happy to be contacted with a quote.')
      return
    }
    setSubmitting(true)

    const payload = {
      name, email, phone, postcode, date_of_birth: dateOfBirth,
      council, licence_type: licenceType, years_licensed: yearsLicensed,
      vehicle_make: vehicleMake, vehicle_model: vehicleModel, vehicle_year: vehicleYear,
      vehicle_reg: vehicleReg, vehicle_value: vehicleValue,
      cover_type: coverType, no_claims_years: noClaimsYears,
      points_count: pointsCount, points_details: pointsDetails,
      usage_details: usageDetails, claims_history: claimsHistory
    }

    const { error } = await supabase.from('insurance_enquiries').insert([{ user_id: user.id, ...payload }])
    setSubmitting(false)

    if (error) {
      alert('Sorry, something went wrong sending your request: ' + error.message)
      return
    }

    // Email the insurers via Resend (the enquiry is already saved, so this is best-effort)
    try {
      await fetch('/api/insurance-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (err) {
      console.error('Email notification failed (enquiry still saved):', err)
    }

    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ color: '#666', fontSize: '18px' }}>Loading...</p>
      </div>
    )
  }

  const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '14px' }
  const sectionHeading = { fontSize: '13px', color: '#374151', margin: '12px 0 12px 0', textTransform: 'uppercase' as const, letterSpacing: '0.5px', fontWeight: 700 }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 16px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 'bold', margin: '0 0 6px 0' }}>🛡️ Taxi &amp; Private Hire Insurance</h2>
        <p style={{ color: '#666', margin: '0 0 24px 0' }}>Fill in your details and our insurance partners will get in touch with a tailored quote.</p>

        {insurers.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 12px 0' }}>Our insurance partners</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
              {insurers.map(ins => (
                <div key={ins.id} style={{ backgroundColor: 'white', borderRadius: '10px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: ins.featured ? '2px solid #eab308' : '1px solid #e5e7eb' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>{ins.title}</h4>
                  {ins.description && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666', lineHeight: 1.4 }}>{ins.description}</p>}
                  {ins.website_url && <a href={ins.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#b45309', fontWeight: 600, textDecoration: 'none' }}>Visit website →</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {submitted ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px 24px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px' }}>Thanks, {name || 'driver'}!</h3>
            <p style={{ color: '#666', margin: '0 0 8px 0', fontSize: '15px', lineHeight: 1.5 }}>Your details have been received. Our insurance partners will be in touch with a tailored quote soon.</p>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>You can close this page — we will take it from here.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0' }}>Request a quote</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px 0' }}>The more detail you give, the more accurate your quote.</p>

            <h4 style={sectionHeading}>Your contact details</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Full name</label><input style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Phone</label><input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Postcode</label><input style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Date of birth</label><input type="date" style={inputStyle} value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} /></div>
            </div>

            <h4 style={sectionHeading}>Licensing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Licensing council / area</label><input style={inputStyle} value={council} onChange={e => setCouncil(e.target.value)} placeholder="e.g. Aberdeen City" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Licence type</label><select style={inputStyle} value={licenceType} onChange={e => setLicenceType(e.target.value)}><option>Private Hire</option><option>Hackney Carriage</option><option>Both</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Years licensed</label><input style={inputStyle} value={yearsLicensed} onChange={e => setYearsLicensed(e.target.value)} placeholder="e.g. 5" /></div>
            </div>

            <h4 style={sectionHeading}>Your vehicle</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Make</label><input style={inputStyle} value={vehicleMake} onChange={e => setVehicleMake(e.target.value)} placeholder="e.g. Toyota" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Model</label><input style={inputStyle} value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} placeholder="e.g. Prius" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Year</label><input style={inputStyle} value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} placeholder="e.g. 2020" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Registration</label><input style={inputStyle} value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} placeholder="e.g. AB20 CDE" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Estimated value</label><input style={inputStyle} value={vehicleValue} onChange={e => setVehicleValue(e.target.value)} placeholder="e.g. 12000" /></div>
            </div>

            <h4 style={sectionHeading}>Cover &amp; history</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Cover type</label><select style={inputStyle} value={coverType} onChange={e => setCoverType(e.target.value)}><option>Comprehensive</option><option>Third Party, Fire &amp; Theft</option><option>Third Party Only</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Years no-claims bonus</label><input style={inputStyle} value={noClaimsYears} onChange={e => setNoClaimsYears(e.target.value)} placeholder="e.g. 3" /></div>
            </div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Penalty points on your licence</label><input style={inputStyle} value={pointsCount} onChange={e => setPointsCount(e.target.value)} placeholder="e.g. 3, or 0 if none" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>What were the points for? (offence and date)</label><input style={inputStyle} value={pointsDetails} onChange={e => setPointsDetails(e.target.value)} placeholder="e.g. SP30 speeding, March 2024" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>How is the vehicle used? (optional)</label><input style={inputStyle} value={usageDetails} onChange={e => setUsageDetails(e.target.value)} placeholder="e.g. Private hire, school runs, airport work" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Any claims or convictions in the last 5 years? (optional)</label><textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={claimsHistory} onChange={e => setClaimsHistory(e.target.value)} placeholder="Brief details, or write None" /></div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0 20px 0', fontSize: '14px', color: '#374151' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px' }} />
              <span>I am happy for UK Driver Hub and its insurance partners to contact me about a quote based on the details above.</span>
            </label>

            <button type="submit" disabled={submitting} style={{ width: '100%', padding: '14px', backgroundColor: submitting ? '#d1d5db' : '#eab308', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '16px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Sending...' : 'Request my quote'}</button>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: '12px 0 0 0', textAlign: 'center' }}>Your details are stored securely and only shared with our insurance partners to provide your quote.</p>
          </form>
        )}

        {showSignupPrompt && (
          <div onClick={() => setShowSignupPrompt(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px 24px', width: '100%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛡️</div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700 }}>Sign up free to send your quote</h3>
              <p style={{ color: '#666', margin: '0 0 20px 0', fontSize: '15px', lineHeight: 1.5 }}>Create a free account and we will send your details to our insurance partners for a tailored quote.</p>
              <a href="/signup" style={{ display: 'block', padding: '13px', backgroundColor: '#eab308', color: 'black', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', marginBottom: '10px' }}>Sign up free</a>
              <a href="/signin" style={{ display: 'block', padding: '13px', backgroundColor: '#f3f4f6', color: '#333', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '15px', marginBottom: '10px', border: '1px solid #d1d5db' }}>I already have an account</a>
              <button onClick={() => setShowSignupPrompt(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '14px' }}>Back to form</button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

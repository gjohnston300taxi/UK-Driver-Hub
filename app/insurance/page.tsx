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

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = `${tomorrow.getMonth() + 1}`.padStart(2, '0')
  const day = `${tomorrow.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
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
  const [council, setCouncil] = useState('')
  const [licenceType, setLicenceType] = useState('Private Hire')
  const [yearsHeldBadge, setYearsHeldBadge] = useState('')
  const [yearsHeldLicence, setYearsHeldLicence] = useState('')
  const [bestTimeToCall, setBestTimeToCall] = useState('Any time')
  const [vehicleMakeModel, setVehicleMakeModel] = useState('')
  const [vehicleReg, setVehicleReg] = useState('')
  const [coverStartDate, setCoverStartDate] = useState(getTomorrowDate())
  const [coverType, setCoverType] = useState('Comprehensive')
  const [estimatedAnnualMileage, setEstimatedAnnualMileage] = useState('')
  const [noClaimsYears, setNoClaimsYears] = useState('')
  const [pointsCount, setPointsCount] = useState('')
  const [pointsDetails, setPointsDetails] = useState('')
  const [usageDetails, setUsageDetails] = useState('')
  const [claimsHistory, setClaimsHistory] = useState('No')
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

    const tomorrow = getTomorrowDate()
    if (!name || !phone || !postcode || !council || !coverStartDate) {
      alert('Please fill in your full name, phone, postcode, licensing council and cover start date.')
      return
    }
    if (new Date(coverStartDate) < new Date(tomorrow)) {
      alert('When do you need cover from? must be tomorrow or later.')
      return
    }
    if (!consent) {
      alert('Please tick the consent box to allow UK Driver Hub to share your details with specialist brokers and insurers.')
      return
    }
    setSubmitting(true)

    const payload = {
      name,
      email,
      phone,
      postcode,
      council,
      licence_type: licenceType,
      years_held_taxi_badge: yearsHeldBadge,
      years_held_full_licence: yearsHeldLicence,
      best_time_to_call: bestTimeToCall,
      vehicle_make_model: vehicleMakeModel,
      vehicle_reg: vehicleReg,
      cover_start_date: coverStartDate,
      cover_type: coverType,
      estimated_annual_mileage: estimatedAnnualMileage,
      no_claims_years: noClaimsYears,
      points_count: pointsCount,
      points_details: pointsDetails,
      usage_details: usageDetails,
      claims_history: claimsHistory,
      consent
    }

    const { error } = await supabase.from('insurance_enquiries').insert([{ user_id: user.id, ...payload }])
    setSubmitting(false)

    if (error) {
      alert('Sorry, something went wrong sending your request: ' + error.message)
      return
    }

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
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Full name</label><input required style={inputStyle} value={name} onChange={e => setName(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Phone</label><input required style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} /><p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>Brokers quote by phone, so this is how you'll get your price.</p></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Postcode</label><input required style={inputStyle} value={postcode} onChange={e => setPostcode(e.target.value)} /></div>
            </div>

            <h4 style={sectionHeading}>Licensing</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Licensing council / area</label><input required style={inputStyle} value={council} onChange={e => setCouncil(e.target.value)} placeholder="e.g. Aberdeen City" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Licence type</label><select style={inputStyle} value={licenceType} onChange={e => setLicenceType(e.target.value)}><option>Private Hire</option><option>Hackney Carriage</option><option>Both</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Years held taxi/PH badge</label><input style={inputStyle} value={yearsHeldBadge} onChange={e => setYearsHeldBadge(e.target.value)} placeholder="e.g. 5" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Years held full driving licence</label><input style={inputStyle} value={yearsHeldLicence} onChange={e => setYearsHeldLicence(e.target.value)} placeholder="e.g. 10" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Best time to call</label><select style={inputStyle} value={bestTimeToCall} onChange={e => setBestTimeToCall(e.target.value)}><option>Morning 8am-12pm</option><option>Afternoon 12pm-5pm</option><option>Evening 5pm-8pm</option><option>Any time</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>When do you need cover from?</label><input required type="date" min={getTomorrowDate()} style={inputStyle} value={coverStartDate} onChange={e => setCoverStartDate(e.target.value)} /></div>
            </div>

            <h4 style={sectionHeading}>Your vehicle</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Vehicle make and model</label><input style={inputStyle} value={vehicleMakeModel} onChange={e => setVehicleMakeModel(e.target.value)} placeholder="e.g. Toyota Prius" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Registration</label><input style={inputStyle} value={vehicleReg} onChange={e => setVehicleReg(e.target.value)} placeholder="e.g. AB20 CDE" /></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Estimated annual mileage</label><input type="number" min="0" style={inputStyle} value={estimatedAnnualMileage} onChange={e => setEstimatedAnnualMileage(e.target.value)} placeholder="e.g. 12000" /></div>
            </div>

            <h4 style={sectionHeading}>Cover &amp; history</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Cover type</label><select style={inputStyle} value={coverType} onChange={e => setCoverType(e.target.value)}><option>Comprehensive</option><option>Third Party, Fire &amp; Theft</option><option>Third Party Only</option></select></div>
              <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Years no-claims bonus</label><input style={inputStyle} value={noClaimsYears} onChange={e => setNoClaimsYears(e.target.value)} placeholder="e.g. 3" /></div>
            </div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Penalty points on your licence</label><input style={inputStyle} value={pointsCount} onChange={e => setPointsCount(e.target.value)} placeholder="e.g. 3, or 0 if none" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>What were the points for? (offence and date)</label><input style={inputStyle} value={pointsDetails} onChange={e => setPointsDetails(e.target.value)} placeholder="e.g. SP30 speeding, March 2024" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>How is the vehicle used? (optional)</label><input style={inputStyle} value={usageDetails} onChange={e => setUsageDetails(e.target.value)} placeholder="e.g. Private hire, school runs, airport work" /></div>
            <div style={{ marginBottom: '16px' }}><label style={labelStyle}>Claims or convictions in the last 5 years?</label><select style={inputStyle} value={claimsHistory} onChange={e => setClaimsHistory(e.target.value)}><option>No</option><option>Yes</option><option>Not sure</option></select><p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280' }}>A yes is fine — it just tells us which brokers to send you to.</p></div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '8px 0 20px 0', fontSize: '14px', color: '#374151' }}>
              <input required type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: '3px' }} />
              <span>I agree that UK Driver Hub may share these details with specialist insurance brokers and insurers so they can contact me about a quote, by phone or email. <a href="/privacy" style={{ color: '#b45309', textDecoration: 'none' }}>Privacy policy</a>.</span>
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

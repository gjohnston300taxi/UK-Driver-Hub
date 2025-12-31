'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UK_REGIONS = [
  'Scotland - Highlands',
  'Scotland - Grampian',
  'Scotland - Tayside',
  'Scotland - Fife',
  'Scotland - Central',
  'Scotland - Lothian',
  'Scotland - Borders',
  'Scotland - Strathclyde',
  'Scotland - Dumfries & Galloway',
  'Northern Ireland',
  'North East England',
  'North West England',
  'Yorkshire & Humber',
  'East Midlands',
  'West Midlands',
  'East of England',
  'London',
  'South East England',
  'South West England',
  'Wales - North',
  'Wales - Mid',
  'Wales - South'
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile(data)
      setName(data.name || '')
      setRegion(data.region || '')
      setPhone(data.phone || '')
      setLicenseType(data.license_type || '')
      setYearsExperience(data.years_experience?.toString() || '')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!name.trim() || !region) {
      alert('Please fill in your name and region')
      return
    }
    
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim(),
        region,
        phone: phone.trim() || null,
        license_type: licenseType || null,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (error) {
      alert('Failed to save: ' + error.message)
    } else {
      alert('Profile saved!')
      loadUser()
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Header with Hamburger Menu */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left side - Title + Hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🚕 Driver Hub</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{mobileMenuOpen ? '✕' : '☰'}</button>
          </div>
          {/* Right side - Profile only */}
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold', fontSize: '16px' }}>{name?.charAt(0).toUpperCase() || '?'}</div>
        </div>
        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 99 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', maxWidth: '680px', margin: '0 auto' }}>
              <a href="/feed" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📰 Feed</a>
              <a href="/news" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📢 News</a>
              <a href="/marketplace" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🏪 Marketplace</a>
              <a href="/finance" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>💰 Finance</a>
              <a href="/resources" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📚 Resources</a>
              <a href="/assistant" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🤖 Driver AI Assistant</a>
              <a href="/profile" style={{ padding: '16px', color: '#eab308', textDecoration: 'none', fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>👤 Profile</a>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut() }} style={{ padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#dc2626', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>🚪 Sign Out</button>
            </nav>
          </div>
        )}
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>👤 My Profile</h2>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Profile Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', color: 'black' }}>
              {name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>

          {/* Email (read-only) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#666' }}>Email</label>
            <input type="email" value={user?.email || ''} disabled style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', backgroundColor: '#f9fafb', color: '#666', boxSizing: 'border-box' }} />
          </div>

          {/* Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>

          {/* Region */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Region *</label>
            <select value={region} onChange={e => setRegion(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
              <option value="">Select your region</option>
              {UK_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Phone (optional)</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>

          {/* License Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>License Type (optional)</label>
            <select value={licenseType} onChange={e => setLicenseType(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
              <option value="">Select license type</option>
              <option value="Hackney">Hackney Carriage</option>
              <option value="Private Hire">Private Hire</option>
              <option value="Both">Both</option>
            </select>
          </div>

          {/* Years Experience */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Years of Experience (optional)</label>
            <input type="number" value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} placeholder="e.g. 5" min="0" max="50" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
          </div>

          {/* Save Button */}
          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '14px', backgroundColor: saving ? '#9ca3af' : '#eab308', color: 'black', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {/* Admin Link (if admin) */}
        {profile?.is_admin && (
          <div style={{ marginTop: '16px' }}>
            <a href="/admin" style={{ display: 'block', padding: '14px', backgroundColor: '#1f2937', color: 'white', textDecoration: 'none', borderRadius: '8px', textAlign: 'center', fontWeight: '600' }}>
              ⚙️ Admin Portal
            </a>
          </div>
        )}

        {/* Sign Out */}
        <button onClick={handleSignOut} style={{ width: '100%', marginTop: '16px', padding: '14px', backgroundColor: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          🚪 Sign Out
        </button>
      </main>
    </div>
  )
}

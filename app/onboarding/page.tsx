'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const UK_REGIONS = [
  'Scotland 🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Northern Ireland 🇬🇧',
  'London 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'North West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Yorkshire & Humber 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'West Midlands 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South East England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'South West England 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Republic of Ireland 🇮🇪'
]

const LICENSE_TYPES = [
  'Private Hire (PHV)',
  'Hackney Carriage (Taxi)',
  'Both PHV & Hackney',
  'Not yet licensed'
]

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
]

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [experience, setExperience] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  
  // Profile image states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/signin'
      return
    }

    setUser(user)
    
    // Check if profile already exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile && profile.name && profile.region) {
      // Already onboarded, redirect to feed
      window.location.href = '/feed'
      return
    }

    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setError('Failed to upload image. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!name.trim() || !region || !licenseType || !experience) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: name.trim(),
        region,
        license_type: licenseType,
        experience,
        badge_number: badgeNumber.trim() || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })

    if (upsertError) {
      setError(upsertError.message)
      setSubmitting(false)
      return
    }

    window.location.href = '/feed'
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            🚕 Welcome to UK Driver Hub
          </h1>
          <p style={{ color: '#666', margin: 0 }}>Let's set up your profile</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Profile Picture Upload */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '12px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Profile Picture <span style={{ color: '#666', fontWeight: 'normal' }}>(optional)</span>
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Avatar Preview */}
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '3px solid #eab308'
              }}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '40px' }}>👤</span>
                )}
              </div>

              {/* Upload Button */}
              <label style={{
                padding: '8px 16px',
                backgroundColor: uploadingImage ? '#9ca3af' : '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: uploadingImage ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-block'
              }}>
                {uploadingImage ? 'Uploading...' : avatarUrl ? '📷 Change Photo' : '📷 Add Photo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{ display: 'none' }}
                />
              </label>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Your Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your name"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Region *
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select your region</option>
              {UK_REGIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              License Type *
            </label>
            <select
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select license type</option>
              {LICENSE_TYPES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Years of Experience *
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                backgroundColor: 'white'
              }}
            >
              <option value="">Select experience</option>
              {EXPERIENCE_OPTIONS.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Badge Number <span style={{ color: '#666', fontWeight: 'normal' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter your badge number"
            />
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: submitting ? '#9ca3af' : '#eab308',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}

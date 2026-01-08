'use client'

import { useState, useEffect, useRef } from 'react'
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

// Resize image for avatar (smaller size, square crop)
const resizeAvatar = (file: File, size: number = 200, quality: number = 0.85): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Calculate crop to make square (center crop)
        let sourceX = 0
        let sourceY = 0
        let sourceSize = Math.min(img.width, img.height)
        
        if (img.width > img.height) {
          sourceX = (img.width - sourceSize) / 2
        } else {
          sourceY = (img.height - sourceSize) / 2
        }
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Could not create blob'))
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [phone, setPhone] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      setAvatarUrl(data.avatar_url || null)
    }
    setLoading(false)
  }

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploadingAvatar(true)

    try {
      // Resize the image
      const resizedBlob = await resizeAvatar(file, 200, 0.85)
      
      // Generate unique filename
      const fileName = `${user.id}-${Date.now()}.jpg`
      
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, resizedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        alert('Failed to upload image: ' + uploadError.message)
        setUploadingAvatar(false)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        alert('Failed to update profile: ' + updateError.message)
      } else {
        setAvatarUrl(publicUrl)
        alert('Profile picture updated!')
      }
    } catch (error) {
      console.error('Avatar processing error:', error)
      alert('Failed to process image. Please try again.')
    }

    setUploadingAvatar(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return
    if (!confirm('Remove your profile picture?')) return

    setUploadingAvatar(true)

    try {
      // Delete from storage
      const fileName = avatarUrl.split('/').pop()
      if (fileName) {
        await supabase.storage.from('avatars').remove([fileName])
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) {
        alert('Failed to remove picture: ' + error.message)
      } else {
        setAvatarUrl(null)
      }
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Failed to remove picture')
    }

    setUploadingAvatar(false)
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
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>👤 My Profile</h2>

        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {/* Profile Avatar with Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ position: 'relative' }}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #eab308'
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: '#eab308',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px',
                  fontWeight: 'bold',
                  color: 'black',
                  border: '3px solid #eab308'
                }}>
                  {name?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              
              {/* Upload overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#eab308',
                  border: '2px solid white',
                  cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
                title="Change photo"
              >
                {uploadingAvatar ? '...' : '📷'}
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarSelect}
              accept="image/*"
              capture="user"
              style={{ display: 'none' }}
            />
            
            {/* Upload/Remove buttons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Add Photo'}
              </button>
              
              {avatarUrl && (
                <button
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Remove
                </button>
              )}
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

        {/* Back to Feed */}
        <a href="/feed" style={{ display: 'block', marginTop: '16px', padding: '14px', backgroundColor: 'white', color: '#333', textDecoration: 'none', borderRadius: '8px', textAlign: 'center', fontWeight: '600', border: '1px solid #d1d5db' }}>
          ← Back to Feed
        </a>

        {/* Sign Out */}
        <button onClick={handleSignOut} style={{ width: '100%', marginTop: '16px', padding: '14px', backgroundColor: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
          🚪 Sign Out
        </button>
      </main>
    </div>
  )
}

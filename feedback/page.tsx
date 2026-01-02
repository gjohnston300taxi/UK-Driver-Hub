'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FeedbackPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [likes, setLikes] = useState('')
  const [dislikes, setDislikes] = useState('')
  const [features, setFeatures] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    
    const { data } = await supabase.from('profiles').select('name, region').eq('id', user.id).single()
    if (!data?.name || !data?.region) { window.location.href = '/onboarding'; return }
    setProfile(data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!likes.trim() && !dislikes.trim() && !features.trim()) {
      alert('Please fill in at least one field')
      return
    }

    setSubmitting(true)

    const { error } = await supabase
      .from('feedback')
      .insert([{
        user_id: user.id,
        user_name: profile.name,
        user_region: profile.region,
        likes: likes.trim() || null,
        dislikes: dislikes.trim() || null,
        features: features.trim() || null,
        status: 'new'
      }])

    if (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback. Please try again.')
    } else {
      setSubmitted(true)
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px 24px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '24px' }}>Thank You!</h2>
            <p style={{ color: '#666', margin: '0 0 24px 0', lineHeight: '1.6' }}>
              Your feedback has been submitted. We really appreciate you taking the time to help us improve UK Driver Hub.
            </p>
            <a
              href="/feed"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#eab308',
                color: 'black',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              Back to Feed
            </a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>📝 Give Your Feedback Here</h1>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            Help us make UK Driver Hub better for all drivers
          </p>
        </div>

        {/* Feedback Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* What do you like? */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              fontSize: '16px'
            }}>
              👍 What do you like about the app?
            </label>
            <textarea
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              placeholder="Tell us what's working well for you..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* What don't you like? */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              fontSize: '16px'
            }}>
              👎 What don't you like or find frustrating?
            </label>
            <textarea
              value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              placeholder="Tell us what needs improvement..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Feature requests */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              fontSize: '16px'
            }}>
              💡 What features would you like added?
            </label>
            <textarea
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="Tell us your ideas for new features..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                minHeight: '100px',
                resize: 'vertical',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: submitting ? '#d1d5db' : '#eab308',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>

          <p style={{ 
            margin: '16px 0 0 0', 
            fontSize: '13px', 
            color: '#999', 
            textAlign: 'center' 
          }}>
            Your feedback is anonymous to other users but visible to our team.
          </p>
        </div>
      </main>
    </div>
  )
}

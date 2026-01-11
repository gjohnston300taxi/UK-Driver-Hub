'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Allowed countries - UK and Ireland
const ALLOWED_COUNTRIES = ['GB', 'IE', 'UK']

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingLocation, setCheckingLocation] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [locationBlocked, setLocationBlocked] = useState(false)
  const [userCountry, setUserCountry] = useState('')

  useEffect(() => {
    checkUserLocation()
  }, [])

  const checkUserLocation = async () => {
    try {
      // Using free IP geolocation API
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      
      if (data.country_code) {
        setUserCountry(data.country_name || data.country_code)
        
        if (!ALLOWED_COUNTRIES.includes(data.country_code)) {
          setLocationBlocked(true)
        }
      }
    } catch (error) {
      // If geolocation fails, allow signup (fail open for better UX)
      console.error('Location check failed:', error)
    } finally {
      setCheckingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Double-check location before signup
    if (locationBlocked) {
      setError('Registration is only available for users in the UK and Ireland.')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Check if email confirmation is required
      if (data.user.identities && data.user.identities.length === 0) {
        setError('This email is already registered. Please sign in instead.')
        setLoading(false)
        return
      }
      
      // Redirect to onboarding to complete profile
      window.location.href = '/onboarding'
    }
  }

  // Show loading while checking location
  if (checkingLocation) {
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
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚕</div>
          <p style={{ color: '#666', margin: 0 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Show blocked message if outside UK/Ireland
  if (locationBlocked) {
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
          maxWidth: '450px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🇬🇧</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            UK & Ireland Only
          </h2>
          <p style={{ color: '#666', marginBottom: '16px', lineHeight: '1.6' }}>
            UK Driver Hub is exclusively for taxi and private hire drivers based in the United Kingdom and Republic of Ireland.
          </p>
          <p style={{ color: '#999', marginBottom: '24px', fontSize: '14px' }}>
            Your location: {userCountry}
          </p>
          <div style={{
            backgroundColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              If you believe this is an error (e.g., you're using a VPN), please try disabling your VPN and refreshing the page.
            </p>
          </div>
          <Link 
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#e5e7eb',
              color: '#374151',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Go Back
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
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
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
            Check your email
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            We've sent you a confirmation link. Please check your email to verify your account.
          </p>
          <Link 
            href="/signin"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#eab308',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}
          >
            Go to Sign In
          </Link>
        </div>
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
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            🚕 UK Driver Hub
          </h1>
          <p style={{ color: '#666', margin: 0 }}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="At least 6 characters"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Confirm your password"
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
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#9ca3af' : '#eab308',
              color: 'black',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/signin" style={{ color: '#eab308', fontWeight: '600', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

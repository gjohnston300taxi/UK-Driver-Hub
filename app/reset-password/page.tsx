'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  // If the driver arrived via a reset link, Supabase will have a session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdating(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Step 1: Driver enters email to request a reset link
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://ukdriverhub.org/reset-password',
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Check your email! We sent you a password reset link.')
    }
    setLoading(false)
  }

  // Step 2: Driver clicked link in email and sets a new password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Password updated successfully!')
      setTimeout(() => {
        window.location.href = '/signin'
      }, 2000)
    }
    setLoading(false)
  }

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '20px'
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box' as const
  }

  const buttonStyle = {
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
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            🚕 UK Driver Hub
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            {isUpdating ? 'Set your new password' : 'Reset your password'}
          </p>
        </div>

        {/* Step 2: Set new password (arrived via email link) */}
        {isUpdating ? (
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={inputStyle}
                placeholder="Enter your new password"
              />
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

        ) : (
          /* Step 1: Request reset email */
          <form onSubmit={handleRequestReset}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </div>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center' }}>
          <Link href="/signin" style={{ color: '#eab308', textDecoration: 'none', fontSize: '14px' }}>
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

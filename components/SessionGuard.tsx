'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SessionGuard() {
  useEffect(() => {
    const checkSession = async () => {
      // Get the stored expiry date
      const expiryStr = localStorage.getItem('session_expiry')

      // If no expiry is set, nothing to check
      if (!expiryStr) return

      const expiry = new Date(expiryStr)
      const now = new Date()

      // If the expiry date has passed, sign them out
      if (now > expiry) {
        localStorage.removeItem('session_expiry')
        localStorage.removeItem('session_days')
        await supabase.auth.signOut()
        window.location.href = '/signin'
      }
    }

    // Check immediately when page loads
    checkSession()

    // Also check every 5 minutes while they're using the app
    const interval = setInterval(checkSession, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // This component renders nothing visible
  return null
}

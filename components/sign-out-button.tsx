'use client'

import { useState } from 'react'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
    // The signOut action will handle the redirect
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={loading}
      variant="outline"
      className="border-taxi-yellow text-taxi-yellow hover:bg-taxi-yellow hover:text-black font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  )
}

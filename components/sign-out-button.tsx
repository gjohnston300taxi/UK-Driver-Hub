'use client'

import { useState } from 'react'
import { signOut } from '@/lib/auth/actions'
import { Button } from '@/components/ui/button'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      variant="ghost"
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}

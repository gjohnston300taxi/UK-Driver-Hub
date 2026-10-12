'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Drivers who are already signed in skip the welcome page and go to the feed.
// Visitors and Google stay on the welcome page.
export default function SignedInRedirect({ to = '/feed' }: { to?: string }) {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace(to)
    })
  }, [router, to])

  return null
}

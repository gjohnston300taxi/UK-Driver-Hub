import Link from 'next/link'
import { Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/sign-out-button'

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
            <Car className="h-6 w-6 text-taxi-yellow" />
          </div>
          <span className="text-xl font-bold">UK Driver Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link href="/feed" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                Dashboard
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                Earnings
              </Link>
              <Link href="#" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                Community
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                How It Works
              </a>
              <a href="#contact" className="text-sm font-medium hover:text-taxi-yellow transition-colors">
                Contact
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/signin">
                <Button variant="ghost" className="hover:text-taxi-yellow">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

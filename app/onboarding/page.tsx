import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/header'

export default async function OnboardingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <div className="flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-taxi-yellow/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-taxi-yellow" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Welcome to UK Driver Hub!
          </CardTitle>
          <CardDescription className="text-lg">
            You've successfully created your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Getting Started</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Complete your driver profile with your license information
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Track your earnings and manage your bookings
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-taxi-yellow mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Connect with other drivers in your community
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/feed" className="flex-1">
              <Button className="w-full bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold">
                Continue to Dashboard
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
        </Card>
      </div>
    </div>
  )
}

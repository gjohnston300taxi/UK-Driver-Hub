import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Calendar, Users, DollarSign } from 'lucide-react'
import { Header } from '@/components/header'

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your driving activity
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-taxi-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£0.00</div>
              <p className="text-xs text-muted-foreground">
                Start tracking your earnings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Trips
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-taxi-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No trips recorded yet
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hours Worked
              </CardTitle>
              <Calendar className="h-4 w-4 text-taxi-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0h</div>
              <p className="text-xs text-muted-foreground">
                Track your working hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community
              </CardTitle>
              <Users className="h-4 w-4 text-taxi-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Connect with other drivers
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Dashboard</CardTitle>
            <CardDescription>
              Your personalized driver dashboard is coming soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-taxi-yellow/20 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-taxi-yellow" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Dashboard Coming Soon</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  We're building out your personalized dashboard where you'll be able to
                  track earnings, manage bookings, and connect with the driver community.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

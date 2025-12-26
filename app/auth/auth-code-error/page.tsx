import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Authentication Error
          </CardTitle>
          <CardDescription>
            The authentication link is invalid or has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            This can happen if the link has already been used or if it's more than 24 hours old.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/signin" className="w-full">
              <Button className="w-full bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold">
                Go to Sign In
              </Button>
            </Link>
            <Link href="/reset-password" className="w-full">
              <Button variant="outline" className="w-full">
                Request New Reset Link
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

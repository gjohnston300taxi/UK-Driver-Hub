'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/app/actions/auth'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.append('email', values.email)

    const result = await resetPassword(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-taxi-yellow/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-taxi-yellow" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Check your email
            </CardTitle>
            <CardDescription>
              We've sent you a password reset link to{' '}
              <span className="font-medium text-foreground">{form.getValues('email')}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              If you don't see the email, check your spam folder or try again with a different email address.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => {
                  setSuccess(false)
                  form.reset()
                }}
                variant="outline"
                className="w-full"
              >
                Try another email
              </Button>
              <Link href="/signin" className="w-full">
                <Button
                  variant="ghost"
                  className="w-full"
                >
                  Back to sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            Reset your password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="driver@example.com"
                        type="email"
                        autoComplete="email"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-taxi-yellow hover:bg-taxi-yellow/90 text-black font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              href="/signin"
              className="text-taxi-yellow hover:text-taxi-yellow/80 font-semibold"
            >
              ← Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

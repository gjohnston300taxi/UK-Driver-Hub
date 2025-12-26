import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">UK Driver Hub</h1>
          <SignOutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Your Feed</h2>
          <p className="text-gray-600 mb-6">
            Welcome back, {user.email}! This is your personalized feed.
          </p>
          <div className="bg-white rounded-lg border p-6">
            <p className="text-sm text-gray-500">
              This is a placeholder page. Add your feed content here.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

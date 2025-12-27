import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FeedClient } from '@/components/feed/FeedClient'
import { getPosts } from './actions'

export default async function FeedPage() {
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/signin')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, region')
    .eq('id', user.id)
    .single()

  // If profile doesn't exist or is incomplete, redirect to onboarding
  if (profileError || !profile || !profile.name) {
    redirect('/onboarding')
  }

  // Load initial posts
  const { posts, error: postsError } = await getPosts('all')

  if (postsError) {
    console.error('Error loading posts:', postsError)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <FeedClient
          initialPosts={posts}
          userRegion={profile.region}
        />
      </div>
    </div>
  )
}

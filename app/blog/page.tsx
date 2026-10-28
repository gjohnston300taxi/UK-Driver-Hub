import type { Metadata } from 'next'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/public'

// This page is built on the server, so Google can read every post title.
// It is built fresh on every visit, so a newly published post shows up straight away.
// (The old 10-minute cache got stuck and kept showing an old list.)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog: Tips & Guides for UK Taxi and Private Hire Drivers',
  description:
    'Practical tips, guides and insights for UK taxi, private hire and rideshare drivers: licensing, insurance, tax, earnings and life on the road.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog', title: 'UK Driver Hub Blog' },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  image_url: string | null
  created_at: string
  author_id: string | null
  authorName?: string | null
}

async function getPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, image_url, created_at, author_id')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // Load all author names in one go
    const authorIds = Array.from(new Set(data.map((p) => p.author_id).filter(Boolean)))
    let names: Record<string, string> = {}
    if (authorIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, name').in('id', authorIds)
      names = Object.fromEntries((profiles || []).map((p) => [p.id, p.name]))
    }
    return data.map((p) => ({ ...p, authorName: p.author_id ? names[p.author_id] : null }))
  } catch {
    return []
  }
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Hover effect for the post cards */}
      <style dangerouslySetInnerHTML={{ __html: `
        .blog-card { transition: box-shadow 0.2s, transform 0.2s; }
        .blog-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; transform: translateY(-2px); }
      ` }} />

      {/* Hero Section */}
      <div style={{ backgroundColor: '#1f2937', color: 'white', padding: '60px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          UK Driver Hub Blog
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
          News, tips, and insights for UK taxi and private hire drivers
        </p>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px' }}>
        {posts.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
              No blog posts yet. Check back soon!
            </p>
            <Link href="/feed" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '8px', fontWeight: '600' }}>
              Go to Feed
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <article className="blog-card" style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                  {post.image_url && (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                      <img
                        src={post.image_url}
                        alt={post.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '24px' }}>
                    <div style={{ fontSize: '14px', color: '#eab308', marginBottom: '8px', fontWeight: '500' }}>
                      <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                      {post.authorName && ` • ${post.authorName}`}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px', lineHeight: '1.3' }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <span style={{ color: '#eab308', fontWeight: '600', fontSize: '15px' }}>
                      Read more →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

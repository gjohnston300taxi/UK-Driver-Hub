'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  image_url: string | null
  created_at: string
  profiles?: { name: string }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, image_url, created_at, author_id')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading posts:', error)
    } else {
      // Load author names
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          if (post.author_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', post.author_id)
              .single()
            return { ...post, profiles: profile }
          }
          return post
        })
      )
      setPosts(postsWithAuthors)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Hero Section */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '60px 24px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
          UK Driver Hub Blog
        </h1>
        <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
          News, tips, and insights for UK taxi and private hire drivers
        </p>
      </div>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '16px' }}>
              No blog posts yet. Check back soon!
            </p>
            <Link href="/feed" style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#eab308',
              color: 'black',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600'
            }}>
              Go to Feed
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <article style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                >
                  {post.image_url && (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src={post.image_url}
                        alt={post.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '24px' }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#eab308',
                      marginBottom: '8px',
                      fontWeight: '500'
                    }}>
                      {formatDate(post.created_at)}
                      {post.profiles?.name && ` • ${post.profiles.name}`}
                    </div>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '12px',
                      lineHeight: '1.3'
                    }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: '1.6',
                        marginBottom: '16px'
                      }}>
                        {post.excerpt}
                      </p>
                    )}
                    <span style={{
                      color: '#eab308',
                      fontWeight: '600',
                      fontSize: '15px'
                    }}>
                      Read more →
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

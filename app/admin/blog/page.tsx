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
  content: string
  image_url: string | null
  published: boolean
  created_at: string
}

export default function AdminBlogPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [published, setPublished] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = '/signin'
      return
    }
    setUser(user)

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      window.location.href = '/feed'
      return
    }

    setIsAdmin(true)
    loadPosts()
  }

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading posts:', error)
    } else {
      setPosts(data || [])
    }
    setLoading(false)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!editingPost) {
      setSlug(generateSlug(value))
    }
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setExcerpt('')
    setContent('')
    setImageUrl('')
    setPublished(false)
    setEditingPost(null)
    setShowForm(false)
  }

  const editPost = (post: BlogPost) => {
    setEditingPost(post)
    setTitle(post.title)
    setSlug(post.slug)
    setExcerpt(post.excerpt || '')
    setContent(post.content)
    setImageUrl(post.image_url || '')
    setPublished(post.published)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!title.trim() || !slug.trim() || !content.trim()) {
      alert('Please fill in title, slug, and content')
      return
    }

    setSaving(true)

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content.trim(),
      image_url: imageUrl.trim() || null,
      published,
      author_id: user.id,
      updated_at: new Date().toISOString()
    }

    let error
    if (editingPost) {
      const result = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id)
      error = result.error
    } else {
      const result = await supabase
        .from('blog_posts')
        .insert([postData])
      error = result.error
    }

    if (error) {
      console.error('Error saving post:', error)
      alert('Failed to save: ' + error.message)
    } else {
      resetForm()
      loadPosts()
    }

    setSaving(false)
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      alert('Failed to delete: ' + error.message)
    } else {
      loadPosts()
    }
  }

  const togglePublished = async (post: BlogPost) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ published: !post.published })
      .eq('id', post.id)

    if (error) {
      alert('Failed to update: ' + error.message)
    } else {
      loadPosts()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading || !isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>📝 Blog Management</h1>
            <Link href="/admin" style={{ color: '#eab308', fontSize: '14px' }}>← Back to Admin</Link>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#eab308',
                color: 'black',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              + New Post
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              {editingPost ? 'Edit Post' : 'New Post'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Slug */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  URL: ukdriverhub.org/blog/{slug || 'your-slug'}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Excerpt (short description)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description shown in the blog list"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
                  Content *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here...

You can use:
## Headings
### Smaller headings
**Bold text**
* Bullet points
1. Numbered lists"
                  rows={15}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              {/* Published */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Published (visible to everyone)</span>
                </label>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: saving ? '#9ca3af' : '#eab308',
                    color: 'black',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '15px'
                  }}
                >
                  {saving ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'white',
                    color: '#666',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '15px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb'
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
              All Posts ({posts.length})
            </h2>
          </div>

          {posts.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
              No blog posts yet. Create your first one!
            </div>
          ) : (
            <div>
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: index < posts.length - 1 ? '1px solid #e5e7eb' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: post.published ? '#dcfce7' : '#fef3c7',
                        color: post.published ? '#166534' : '#92400e'
                      }}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <span style={{ fontSize: '13px', color: '#666' }}>
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {post.title}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#666' }}>
                      /blog/{post.slug}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {post.published && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f3f4f6',
                          color: '#333',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      >
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => togglePublished(post)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: post.published ? '#fef3c7' : '#dcfce7',
                        color: post.published ? '#92400e' : '#166534',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => editPost(post)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePost(post.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

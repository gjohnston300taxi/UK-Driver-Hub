'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types
interface Profile {
  id: string
  name: string
  region: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles?: { name: string }
}

interface Post {
  id: string
  author_id: string
  content: string
  link_url: string | null
  image_url: string | null
  region: string
  created_at: string
  profiles?: { name: string; region: string }
}

interface Like {
  post_id: string
  user_id: string
}

interface Dislike {
  post_id: string
  user_id: string
}

// Helper to extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Check if URL is a YouTube link
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

// Resize image function - handles any size, outputs max 1200px width
const resizeImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Could not create blob'))
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export default function FeedPage() {
  // State
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [likes, setLikes] = useState<Like[]>([])
  const [dislikes, setDislikes] = useState<Dislike[]>([])
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({})
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState<'all' | 'my-region'>('all')
  
  // Post composer state
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostLink, setNewPostLink] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Comment state
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({})
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>({})

  // Load user and data on mount
  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadPosts()
      loadAllLikes()
      loadAllDislikes()
    }
  }, [user, regionFilter])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      window.location.href = '/signin'
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profileData || !profileData.name || !profileData.region) {
      window.location.href = '/onboarding'
      return
    }

    setProfile(profileData)
    setLoading(false)
  }

  const loadPosts = async () => {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (regionFilter === 'my-region' && profile?.region) {
      query = query.eq('region', profile.region)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error loading posts:', error)
    } else {
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name, region')
            .eq('id', post.author_id)
            .single()
          return { ...post, profiles: profileData }
        })
      )
      setPosts(postsWithProfiles)
      postsWithProfiles.forEach(post => loadComments(post.id))
    }
  }

  const loadAllLikes = async () => {
    const { data } = await supabase
      .from('post_likes')
      .select('post_id, user_id')
    
    setLikes(data || [])
  }

  const loadAllDislikes = async () => {
    const { data } = await supabase
      .from('post_dislikes')
      .select('post_id, user_id')
    
    setDislikes(data || [])
  }

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (data) {
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', comment.user_id)
            .single()
          return { ...comment, profiles: profileData }
        })
      )
      setComments(prev => ({ ...prev, [postId]: commentsWithProfiles }))
    }
  }

  // Handle image selection
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setSelectedImage(file)
    setUploadProgress('Processing image...')

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
      setUploadProgress('')
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress('Resizing image...')
      const resizedBlob = await resizeImage(file, 1200, 0.85)
      
      setUploadProgress('Uploading...')
      const fileName = `${user.id}-${Date.now()}.jpg`
      const filePath = `post-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, resizedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)

      setUploadProgress('')
      return publicUrl
    } catch (error) {
      console.error('Image processing error:', error)
      setUploadProgress('')
      return null
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user || !profile) return
    if (newPostContent.length > 1000) {
      alert('Post must be 1000 characters or less')
      return
    }

    setPosting(true)

    let imageUrl = null
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage)
      if (!imageUrl) {
        alert('Failed to upload image. Please try again.')
        setPosting(false)
        return
      }
    }

    const { error } = await supabase
      .from('posts')
      .insert([{
        author_id: user.id,
        content: newPostContent.trim(),
        link_url: newPostLink.trim() || null,
        image_url: imageUrl,
        region: profile.region
      }])

    if (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post: ' + error.message)
    } else {
      setNewPostContent('')
      setNewPostLink('')
      removeImage()
      loadPosts()
    }

    setPosting(false)
  }

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } else {
      loadPosts()
    }
  }

  // Like/unlike post
  const toggleLike = async (postId: string) => {
    if (!user) return

    const existingLike = likes.find(l => l.post_id === postId && l.user_id === user.id)
    const existingDislike = dislikes.find(d => d.post_id === postId && d.user_id === user.id)

    // Remove dislike if exists
    if (existingDislike) {
      await supabase
        .from('post_dislikes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    }

    if (existingLike) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('post_likes')
        .insert([{ post_id: postId, user_id: user.id }])
    }

    loadAllLikes()
    loadAllDislikes()
  }

  // Dislike/undislike post
  const toggleDislike = async (postId: string) => {
    if (!user) return

    const existingDislike = dislikes.find(d => d.post_id === postId && d.user_id === user.id)
    const existingLike = likes.find(l => l.post_id === postId && l.user_id === user.id)

    // Remove like if exists
    if (existingLike) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    }

    if (existingDislike) {
      await supabase
        .from('post_dislikes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('post_dislikes')
        .insert([{ post_id: postId, user_id: user.id }])
    }

    loadAllLikes()
    loadAllDislikes()
  }

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim()
    if (!commentText || !user) return

    const { error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: postId,
        user_id: user.id,
        content: commentText
      }])

    if (error) {
      console.error('Error adding comment:', error)
    } else {
      setNewComments(prev => ({ ...prev, [postId]: '' }))
      loadComments(postId)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getLikeCount = (postId: string) => likes.filter(l => l.post_id === postId).length
  const getDislikeCount = (postId: string) => dislikes.filter(d => d.post_id === postId).length
  const hasUserLiked = (postId: string) => likes.some(l => l.post_id === postId && l.user_id === user?.id)
  const hasUserDisliked = (postId: string) => dislikes.some(d => d.post_id === postId && d.user_id === user?.id)
  const isPostOwner = (postAuthorId: string) => user?.id === postAuthorId

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {/* Region Filter */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '16px',
          display: 'flex',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={() => setRegionFilter('all')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: regionFilter === 'all' ? '#eab308' : 'transparent',
              color: regionFilter === 'all' ? 'black' : '#666'
            }}
          >
            All UK
          </button>
          <button
            onClick={() => setRegionFilter('my-region')}
            style={{
              flex: 1,
              padding: '10px 8px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: regionFilter === 'my-region' ? '#eab308' : 'transparent',
              color: regionFilter === 'my-region' ? 'black' : '#666'
            }}
          >
            {profile?.region || 'My Region'}
          </button>
        </div>

        {/* Post Composer */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="What's happening in your driving world?"
            maxLength={1000}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              minHeight: '80px',
              resize: 'vertical',
              fontSize: '16px',
              boxSizing: 'border-box',
              fontFamily: 'inherit'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '8px',
            marginBottom: '12px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              color: newPostContent.length > 900 ? '#ef4444' : '#999' 
            }}>
              {newPostContent.length}/1000
            </span>
            {uploadProgress && (
              <span style={{ fontSize: '14px', color: '#eab308' }}>
                {uploadProgress}
              </span>
            )}
          </div>

          {imagePreview && (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px', 
                  borderRadius: '8px',
                  objectFit: 'contain',
                  backgroundColor: '#f3f4f6'
                }} 
              />
              <button
                onClick={removeImage}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
          )}

          <input
            type="url"
            value={newPostLink}
            onChange={(e) => setNewPostLink(e.target.value)}
            placeholder="Add a link or YouTube URL (optional)"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />

          {newPostLink && isYouTubeUrl(newPostLink) && getYouTubeId(newPostLink) && (
            <div style={{ marginBottom: '12px' }}>
              <iframe
                width="100%"
                height="180"
                src={`https://www.youtube.com/embed/${getYouTubeId(newPostLink)}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '8px' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={posting}
              style={{
                padding: '10px 14px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: posting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              📷 Photo
            </button>
            <button
              onClick={handleCreatePost}
              disabled={posting || !newPostContent.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: posting || !newPostContent.trim() ? '#d1d5db' : '#eab308',
                color: 'black',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: posting || !newPostContent.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                marginLeft: 'auto'
              }}
            >
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            color: '#666',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            No posts yet. Be the first to share something!
          </div>
        ) : (
          posts.map((post) => {
            const postComments = comments[post.id] || []
            const isExpanded = expandedComments[post.id]
            const likeCount = getLikeCount(post.id)
            const dislikeCount = getDislikeCount(post.id)
            const userLiked = hasUserLiked(post.id)
            const userDisliked = hasUserDisliked(post.id)
            const youtubeId = post.link_url ? getYouTubeId(post.link_url) : null
            const canDelete = isPostOwner(post.author_id)

            return (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                {/* Post Header */}
                <div style={{ 
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '15px' }}>
                      {post.profiles?.name || 'Unknown Driver'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {post.profiles?.region || post.region} • {formatDate(post.created_at)}
                    </div>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        flexShrink: 0
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p style={{ 
                  margin: '0 0 12px 0', 
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  fontSize: '15px'
                }}>
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image_url && (
                  <div style={{ marginBottom: '12px' }}>
                    <img
                      src={post.image_url}
                      alt="Post image"
                      style={{
                        width: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        backgroundColor: '#f3f4f6'
                      }}
                    />
                  </div>
                )}

                {/* YouTube Embed */}
                {youtubeId && (
                  <div style={{ marginBottom: '12px' }}>
                    <iframe
                      width="100%"
                      height="200"
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: '8px' }}
                    />
                  </div>
                )}

                {/* Regular Link */}
                {post.link_url && !youtubeId && (
                  <a
                    href={post.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      padding: '10px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      textDecoration: 'none',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ 
                      color: '#2563eb', 
                      fontSize: '13px',
                      wordBreak: 'break-all'
                    }}>
                      🔗 {post.link_url}
                    </div>
                  </a>
                )}

                {/* Actions */}
                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '10px',
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap'
                }}>
                  {/* Like Button */}
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 10px',
                      border: 'none',
                      backgroundColor: userLiked ? '#fef3c7' : 'transparent',
                      cursor: 'pointer',
                      color: userLiked ? '#eab308' : '#666',
                      fontWeight: userLiked ? '600' : '400',
                      fontSize: '14px',
                      borderRadius: '6px'
                    }}
                  >
                    👍 {likeCount}
                  </button>

                  {/* Dislike Button */}
                  <button
                    onClick={() => toggleDislike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 10px',
                      border: 'none',
                      backgroundColor: userDisliked ? '#fee2e2' : 'transparent',
                      cursor: 'pointer',
                      color: userDisliked ? '#dc2626' : '#666',
                      fontWeight: userDisliked ? '600' : '400',
                      fontSize: '14px',
                      borderRadius: '6px'
                    }}
                  >
                    👎 {dislikeCount}
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setExpandedComments(prev => ({ 
                      ...prev, 
                      [post.id]: !prev[post.id] 
                    }))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '8px 10px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      color: '#666',
                      fontSize: '14px',
                      borderRadius: '6px'
                    }}
                  >
                    💬 {postComments.length}
                  </button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    marginTop: '10px'
                  }}>
                    {postComments.map((comment) => (
                      <div
                        key={comment.id}
                        style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                          padding: '10px',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{ 
                          fontWeight: '600', 
                          fontSize: '13px',
                          marginBottom: '4px'
                        }}>
                          {comment.profiles?.name || 'Anonymous'}
                          <span style={{ 
                            fontWeight: '400', 
                            color: '#999',
                            marginLeft: '8px'
                          }}>
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px' }}>{comment.content}</p>
                      </div>
                    ))}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input
                        type="text"
                        value={newComments[post.id] || ''}
                        onChange={(e) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: e.target.value
                        }))}
                        placeholder="Write a comment..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id)
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          minWidth: 0
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#eab308',
                          color: 'black',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '14px',
                          flexShrink: 0
                        }}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </main>
    </div>
  )
}

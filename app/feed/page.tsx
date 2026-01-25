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
  avatar_url?: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  profiles?: { name: string; avatar_url?: string }
}

interface Post {
  id: string
  author_id: string
  content: string
  link_url: string | null
  image_url: string | null
  region: string
  created_at: string
  profiles?: { name: string; region: string; avatar_url?: string }
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

// Helper to ensure URL has protocol (https://)
const ensureHttps = (url: string): string => {
  if (!url) return url
  url = url.trim()
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return 'https://' + url
}

// Resize image function
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
            if (blob) resolve(blob)
            else reject(new Error('Could not create blob'))
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

// Avatar component
const Avatar = ({ name, avatarUrl, size = 36 }: { name: string; avatarUrl?: string; size?: number }) => {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    )
  }
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      backgroundColor: '#eab308',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: `${size * 0.4}px`,
      color: 'black'
    }}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
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
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; authorName: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  
  // Edit post state
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [editPostLink, setEditPostLink] = useState('')
  
  // Likes/Dislikes popup state
  const [showLikesModal, setShowLikesModal] = useState<string | null>(null)
  const [showDislikesModal, setShowDislikesModal] = useState<string | null>(null)
  const [likedByNames, setLikedByNames] = useState<string[]>([])
  const [dislikedByNames, setDislikedByNames] = useState<string[]>([])
  const [loadingNames, setLoadingNames] = useState(false)

  // Share/toast state
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  
  // Track if user has made any posts (for welcome message)
  const [userHasPosted, setUserHasPosted] = useState(true) // Default true to avoid flash

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadPosts()
      loadAllLikes()
      loadAllDislikes()
      checkIfUserHasPosted()
    }
  }, [user, regionFilter])

  const checkIfUserHasPosted = async () => {
    if (!user) return
    const { count } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id)
    setUserHasPosted((count || 0) > 0)
  }

  useEffect(() => {
    if (shareMessage) {
      const timer = setTimeout(() => setShareMessage(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [shareMessage])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
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
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
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
            .select('name, region, avatar_url')
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
    const { data } = await supabase.from('post_likes').select('post_id, user_id')
    setLikes(data || [])
  }

  const loadAllDislikes = async () => {
    const { data } = await supabase.from('post_dislikes').select('post_id, user_id')
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
            .select('name, avatar_url')
            .eq('id', comment.user_id)
            .single()
          return { ...comment, profiles: profileData }
        })
      )
      setComments(prev => ({ ...prev, [postId]: commentsWithProfiles }))
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }

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
        .upload(filePath, resizedBlob, { contentType: 'image/jpeg', cacheControl: '3600' })

      if (uploadError) { console.error('Upload error:', uploadError); return null }

      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(filePath)
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
    if (newPostContent.length > 1000) { alert('Post must be 1000 characters or less'); return }

    setPosting(true)
    let imageUrl = null
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage)
      if (!imageUrl) { alert('Failed to upload image. Please try again.'); setPosting(false); return }
    }

    // Ensure link has https:// if provided
    const linkUrl = newPostLink.trim() ? ensureHttps(newPostLink.trim()) : null

    const { error } = await supabase.from('posts').insert([{
      author_id: user.id,
      content: newPostContent.trim(),
      link_url: linkUrl,
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
      setUserHasPosted(true) // User has now posted
      loadPosts()
    }
    setPosting(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) { console.error('Error deleting post:', error); alert('Failed to delete post') }
    else { loadPosts() }
  }

  // Edit post functions
  const startEditPost = (post: Post) => {
    setEditingPost(post.id)
    setEditPostContent(post.content)
    setEditPostLink(post.link_url || '')
  }

  const cancelEditPost = () => {
    setEditingPost(null)
    setEditPostContent('')
    setEditPostLink('')
  }

  const saveEditPost = async (postId: string) => {
    if (!editPostContent.trim()) { alert('Post content cannot be empty'); return }
    if (editPostContent.length > 1000) { alert('Post must be 1000 characters or less'); return }

    // Ensure link has https:// if provided
    const linkUrl = editPostLink.trim() ? ensureHttps(editPostLink.trim()) : null

    const { error } = await supabase
      .from('posts')
      .update({
        content: editPostContent.trim(),
        link_url: linkUrl
      })
      .eq('id', postId)

    if (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
    } else {
      setShareMessage('Post updated!')
      cancelEditPost()
      loadPosts()
    }
  }

  // Delete comment (and its replies)
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Delete this comment and all its replies?')) return

    // First delete all replies to this comment
    await supabase.from('post_comments').delete().eq('parent_id', commentId)
    
    // Then delete the comment itself
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    
    if (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    } else {
      loadComments(postId)
    }
  }

  const toggleLike = async (postId: string) => {
    if (!user) return
    const existingLike = likes.find(l => l.post_id === postId && l.user_id === user.id)
    const existingDislike = dislikes.find(d => d.post_id === postId && d.user_id === user.id)

    if (existingDislike) {
      await supabase.from('post_dislikes').delete().eq('post_id', postId).eq('user_id', user.id)
    }
    if (existingLike) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: user.id }])
    }
    loadAllLikes()
    loadAllDislikes()
  }

  const toggleDislike = async (postId: string) => {
    if (!user) return
    const existingDislike = dislikes.find(d => d.post_id === postId && d.user_id === user.id)
    const existingLike = likes.find(l => l.post_id === postId && l.user_id === user.id)

    if (existingLike) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id)
    }
    if (existingDislike) {
      await supabase.from('post_dislikes').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      await supabase.from('post_dislikes').insert([{ post_id: postId, user_id: user.id }])
    }
    loadAllLikes()
    loadAllDislikes()
  }

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim()
    if (!commentText || !user) return

    const { error } = await supabase.from('post_comments').insert([{
      post_id: postId,
      user_id: user.id,
      content: commentText,
      parent_id: null
    }])

    if (error) { console.error('Error adding comment:', error) }
    else {
      setNewComments(prev => ({ ...prev, [postId]: '' }))
      loadComments(postId)
    }
  }

  const handleAddReply = async (postId: string, parentId: string) => {
    if (!replyText.trim() || !user) return

    const { error } = await supabase.from('post_comments').insert([{
      post_id: postId,
      user_id: user.id,
      content: replyText.trim(),
      parent_id: parentId
    }])

    if (error) { console.error('Error adding reply:', error) }
    else {
      setReplyText('')
      setReplyingTo(null)
      loadComments(postId)
    }
  }

  const handleSharePost = async (post: Post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    const shareText = `Check out this post on Driver Hub: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Driver Hub Post', text: shareText, url: postUrl })
      } catch (error) {
        if ((error as Error).name !== 'AbortError') copyToClipboard(postUrl)
      }
    } else {
      copyToClipboard(postUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShareMessage('Link copied!')
    } catch (error) {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareMessage('Link copied!')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/signin'
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
  const isCommentOwner = (commentUserId: string) => user?.id === commentUserId

  const getTopLevelComments = (postId: string) => (comments[postId] || []).filter(c => !c.parent_id)
  const getReplies = (postId: string, commentId: string) => (comments[postId] || []).filter(c => c.parent_id === commentId)

  const loadLikedByNames = async (postId: string) => {
    setLoadingNames(true)
    const postLikes = likes.filter(l => l.post_id === postId)
    const names: string[] = []
    for (const like of postLikes) {
      const { data } = await supabase.from('profiles').select('name').eq('id', like.user_id).single()
      if (data?.name) names.push(data.name)
    }
    setLikedByNames(names)
    setLoadingNames(false)
    setShowLikesModal(postId)
  }

  const loadDislikedByNames = async (postId: string) => {
    setLoadingNames(true)
    const postDislikes = dislikes.filter(d => d.post_id === postId)
    const names: string[] = []
    for (const dislike of postDislikes) {
      const { data } = await supabase.from('profiles').select('name').eq('id', dislike.user_id).single()
      if (data?.name) names.push(data.name)
    }
    setDislikedByNames(names)
    setLoadingNames(false)
    setShowDislikesModal(postId)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Toast Message */}
      {shareMessage && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: '8px',
          fontWeight: '600', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          ✓ {shareMessage}
        </div>
      )}

      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🚕 Driver Hub</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          <a href="/profile" title={profile?.name}>
            <Avatar name={profile?.name || ''} avatarUrl={profile?.avatar_url} size={36} />
          </a>
        </div>

        {mobileMenuOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 99 }}>
            <nav style={{ display: 'flex', flexDirection: 'column', maxWidth: '680px', margin: '0 auto' }}>
              <a href="/feed" style={{ padding: '16px', color: '#eab308', textDecoration: 'none', fontSize: '16px', fontWeight: '600', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📰 Feed</a>
              <a href="/news" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>📢 News</a>
              <a href="/marketplace" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>🏪 Marketplace</a>
              <a href="/finance" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>💰 Finance</a>
              <a href="/profile" style={{ padding: '16px', color: '#333', textDecoration: 'none', fontSize: '16px', borderBottom: '1px solid #f3f4f6' }} onClick={() => setMobileMenuOpen(false)}>👤 Profile</a>
              <button onClick={() => { setMobileMenuOpen(false); handleSignOut() }} style={{ padding: '16px', backgroundColor: 'transparent', border: 'none', color: '#dc2626', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>🚪 Sign Out</button>
            </nav>
          </div>
        )}
      </header>

      <main style={{ maxWidth: '680px', margin: '0 auto', padding: '16px' }}>
        {/* Region Filter */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '4px', marginBottom: '16px', display: 'flex', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setRegionFilter('all')} style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: regionFilter === 'all' ? '#eab308' : 'transparent', color: regionFilter === 'all' ? 'black' : '#666' }}>All UK</button>
          <button onClick={() => setRegionFilter('my-region')} style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: regionFilter === 'my-region' ? '#eab308' : 'transparent', color: regionFilter === 'my-region' ? 'black' : '#666' }}>{profile?.region || 'My Region'}</button>
        </div>

        {/* Post Composer */}
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={userHasPosted ? "What's happening in your driving world?" : "Tell us a bit about yourself, what city you're working in and how many years have you been a cab driver"} maxLength={1000} style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', minHeight: '80px', resize: 'vertical', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', color: newPostContent.length > 900 ? '#ef4444' : '#999' }}>{newPostContent.length}/1000</span>
            {uploadProgress && <span style={{ fontSize: '14px', color: '#eab308' }}>{uploadProgress}</span>}
          </div>

          {imagePreview && (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#f3f4f6' }} />
              <button onClick={removeImage} style={{ position: 'absolute', top: '8px', right: '8px', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          )}

          <input type="url" value={newPostLink} onChange={(e) => setNewPostLink(e.target.value)} placeholder="Add a link or YouTube URL (optional)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', marginBottom: '12px', boxSizing: 'border-box' }} />

          {newPostLink && isYouTubeUrl(newPostLink) && getYouTubeId(newPostLink) && (
            <div style={{ marginBottom: '12px' }}>
              <iframe width="100%" height="180" src={`https://www.youtube.com/embed/${getYouTubeId(newPostLink)}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '8px' }} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" capture="environment" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} disabled={posting} style={{ padding: '10px 14px', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: posting ? 'not-allowed' : 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>📷 Photo</button>
            <button onClick={handleCreatePost} disabled={posting || !newPostContent.trim()} style={{ padding: '10px 20px', backgroundColor: posting || !newPostContent.trim() ? '#d1d5db' : '#eab308', color: 'black', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: posting || !newPostContent.trim() ? 'not-allowed' : 'pointer', fontSize: '14px', marginLeft: 'auto' }}>{posting ? 'Posting...' : 'Post'}</button>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>No posts yet. Be the first to share something!</div>
        ) : (
          posts.map((post) => {
            const topLevelComments = getTopLevelComments(post.id)
            const totalComments = (comments[post.id] || []).length
            const isExpanded = expandedComments[post.id]
            const likeCount = getLikeCount(post.id)
            const dislikeCount = getDislikeCount(post.id)
            const userLiked = hasUserLiked(post.id)
            const userDisliked = hasUserDisliked(post.id)
            const youtubeId = post.link_url ? getYouTubeId(post.link_url) : null
            const canModify = isPostOwner(post.author_id)
            const isEditing = editingPost === post.id

            return (
              <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {/* Post Header */}
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <Avatar name={post.profiles?.name || ''} avatarUrl={post.profiles?.avatar_url} size={40} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{post.profiles?.name || 'Unknown Driver'}</div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{post.profiles?.region || post.region} • {formatDate(post.created_at)}</div>
                    </div>
                  </div>
                  {canModify && !isEditing && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEditPost(post)} style={{ padding: '4px 8px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
                      <button onClick={() => handleDeletePost(post.id)} style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>🗑️</button>
                    </div>
                  )}
                </div>

                {/* Post Content - Edit Mode */}
                {isEditing ? (
                  <div style={{ marginBottom: '12px' }}>
                    <textarea value={editPostContent} onChange={(e) => setEditPostContent(e.target.value)} maxLength={1000} style={{ width: '100%', padding: '12px', border: '2px solid #eab308', borderRadius: '6px', minHeight: '80px', resize: 'vertical', fontSize: '15px', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                    <input type="url" value={editPostLink} onChange={(e) => setEditPostLink(e.target.value)} placeholder="Link (optional)" style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', marginTop: '8px', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => saveEditPost(post.id)} style={{ padding: '8px 16px', backgroundColor: '#eab308', color: 'black', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Save</button>
                      <button onClick={cancelEditPost} style={{ padding: '8px 16px', backgroundColor: '#f3f4f6', color: '#666', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 12px 0', lineHeight: '1.5', whiteSpace: 'pre-wrap', fontSize: '15px' }}>{post.content}</p>
                )}

                {/* Post Image */}
                {post.image_url && !isEditing && (
                  <div style={{ marginBottom: '12px' }}>
                    <img src={post.image_url} alt="Post image" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f3f4f6' }} />
                  </div>
                )}

                {/* YouTube Embed */}
                {youtubeId && !isEditing && (
                  <div style={{ marginBottom: '12px' }}>
                    <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '8px' }} />
                  </div>
                )}

                {/* Regular Link - NOW WITH ensureHttps() */}
                {post.link_url && !youtubeId && !isEditing && (
                  <a href={ensureHttps(post.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ color: '#2563eb', fontSize: '13px', wordBreak: 'break-all' }}>🔗 {post.link_url}</div>
                  </a>
                )}

                {/* Actions */}
                {!isEditing && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: userLiked ? '#fef3c7' : 'transparent', borderRadius: '6px' }}>
                      <button onClick={() => toggleLike(post.id)} style={{ display: 'flex', alignItems: 'center', padding: '8px 6px 8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: userLiked ? '#eab308' : '#666', fontWeight: userLiked ? '600' : '400', fontSize: '14px' }}>👍</button>
                      <button onClick={() => likeCount > 0 && loadLikedByNames(post.id)} style={{ padding: '8px 10px 8px 4px', border: 'none', backgroundColor: 'transparent', cursor: likeCount > 0 ? 'pointer' : 'default', color: userLiked ? '#eab308' : '#666', fontWeight: userLiked ? '600' : '400', fontSize: '14px', textDecoration: likeCount > 0 ? 'underline' : 'none' }}>{likeCount}</button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: userDisliked ? '#fee2e2' : 'transparent', borderRadius: '6px' }}>
                      <button onClick={() => toggleDislike(post.id)} style={{ display: 'flex', alignItems: 'center', padding: '8px 6px 8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: userDisliked ? '#dc2626' : '#666', fontWeight: userDisliked ? '600' : '400', fontSize: '14px' }}>👎</button>
                      <button onClick={() => dislikeCount > 0 && loadDislikedByNames(post.id)} style={{ padding: '8px 10px 8px 4px', border: 'none', backgroundColor: 'transparent', cursor: dislikeCount > 0 ? 'pointer' : 'default', color: userDisliked ? '#dc2626' : '#666', fontWeight: userDisliked ? '600' : '400', fontSize: '14px', textDecoration: dislikeCount > 0 ? 'underline' : 'none' }}>{dislikeCount}</button>
                    </div>

                    <button onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666', fontSize: '14px', borderRadius: '6px' }}>💬 {totalComments}</button>

                    <button onClick={() => handleSharePost(post)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666', fontSize: '14px', borderRadius: '6px', marginLeft: 'auto' }}>🔗 Share</button>
                  </div>
                )}

                {/* Comments Section */}
                {isExpanded && !isEditing && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '10px' }}>
                    {topLevelComments.map((comment) => {
                      const replies = getReplies(post.id, comment.id)
                      const isReplyingToThis = replyingTo?.commentId === comment.id
                      const canDeleteComment = isCommentOwner(comment.user_id)

                      return (
                        <div key={comment.id}>
                          <div style={{ backgroundColor: '#f9fafb', borderRadius: '6px', padding: '10px', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Avatar name={comment.profiles?.name || ''} avatarUrl={comment.profiles?.avatar_url} size={24} />
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{comment.profiles?.name || 'Anonymous'}</span>
                                <span style={{ color: '#999', fontSize: '12px' }}>{formatDate(comment.created_at)}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={() => { if (isReplyingToThis) { setReplyingTo(null); setReplyText('') } else { setReplyingTo({ postId: post.id, commentId: comment.id, authorName: comment.profiles?.name || 'Anonymous' }); setReplyText('') } }} style={{ padding: '2px 6px', backgroundColor: isReplyingToThis ? '#eab308' : '#e5e7eb', color: isReplyingToThis ? 'black' : '#666', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>{isReplyingToThis ? 'Cancel' : 'Reply'}</button>
                                {canDeleteComment && <button onClick={() => handleDeleteComment(post.id, comment.id)} style={{ padding: '2px 6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>}
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '14px' }}>{comment.content}</p>
                          </div>

                          {isReplyingToThis && (
                            <div style={{ display: 'flex', gap: '8px', marginLeft: '20px', marginBottom: '8px' }}>
                              <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to ${replyingTo.authorName}...`} onKeyPress={(e) => { if (e.key === 'Enter') handleAddReply(post.id, comment.id) }} autoFocus style={{ flex: 1, padding: '8px 10px', border: '1px solid #eab308', borderRadius: '6px', fontSize: '14px', minWidth: 0 }} />
                              <button onClick={() => handleAddReply(post.id, comment.id)} disabled={!replyText.trim()} style={{ padding: '8px 12px', backgroundColor: replyText.trim() ? '#eab308' : '#d1d5db', color: 'black', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: replyText.trim() ? 'pointer' : 'not-allowed', fontSize: '13px', flexShrink: 0 }}>Send</button>
                            </div>
                          )}

                          {replies.length > 0 && (
                            <div style={{ marginLeft: '20px', borderLeft: '2px solid #eab308', paddingLeft: '12px' }}>
                              {replies.map((reply) => {
                                const canDeleteReply = isCommentOwner(reply.user_id)
                                return (
                                  <div key={reply.id} style={{ backgroundColor: '#fefce8', borderRadius: '6px', padding: '10px', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Avatar name={reply.profiles?.name || ''} avatarUrl={reply.profiles?.avatar_url} size={20} />
                                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{reply.profiles?.name || 'Anonymous'}</span>
                                        <span style={{ color: '#999', fontSize: '12px' }}>{formatDate(reply.created_at)}</span>
                                      </div>
                                      {canDeleteReply && <button onClick={() => handleDeleteComment(post.id, reply.id)} style={{ padding: '2px 6px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{reply.content}</p>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <input type="text" value={newComments[post.id] || ''} onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Write a comment..." onKeyPress={(e) => { if (e.key === 'Enter') handleAddComment(post.id) }} style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px', minWidth: 0 }} />
                      <button onClick={() => handleAddComment(post.id)} style={{ padding: '10px 12px', backgroundColor: '#eab308', color: 'black', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>Send</button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </main>

      {/* Liked By Modal */}
      {showLikesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }} onClick={() => setShowLikesModal(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '320px', width: '100%', maxHeight: '400px', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>👍 Liked by</h3>
              <button onClick={() => setShowLikesModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {loadingNames ? <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p> : likedByNames.length === 0 ? <p style={{ color: '#666', textAlign: 'center' }}>No likes yet</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {likedByNames.map((name, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar name={name} size={36} />
                    <span style={{ fontSize: '15px' }}>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Disliked By Modal */}
      {showDislikesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }} onClick={() => setShowDislikesModal(null)}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '320px', width: '100%', maxHeight: '400px', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>👎 Disliked by</h3>
              <button onClick={() => setShowDislikesModal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#666' }}>✕</button>
            </div>
            {loadingNames ? <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p> : dislikedByNames.length === 0 ? <p style={{ color: '#666', textAlign: 'center' }}>No dislikes yet</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dislikedByNames.map((name, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{name.charAt(0).toUpperCase()}</div>
                    <span style={{ fontSize: '15px' }}>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

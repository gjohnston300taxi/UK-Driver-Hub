'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '👎', label: 'Dislike' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
]

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

interface Reaction {
  post_id: string
  user_id: string
  emoji: string
}

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

const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

const ensureHttps = (url: string): string => {
  if (!url) return url
  url = url.trim()
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return 'https://' + url
}

const resizeImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height
        if (width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth }
        const canvas = document.createElement('canvas')
        canvas.width = width; canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Could not get canvas context')); return }
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('Could not create blob')) }, 'image/jpeg', quality)
      }
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

const Avatar = ({ name, avatarUrl, size = 36 }: { name: string; avatarUrl?: string; size?: number }) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', objectFit: 'cover' }} />
  }
  return (
    <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: `${size * 0.4}px`, color: 'black' }}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

// Emoji Reaction Button Component
const ReactionPicker = ({ postId, userId, reactions, onReact }: { postId: string; userId: string; reactions: Reaction[]; onReact: (postId: string, emoji: string) => void }) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const postReactions = reactions.filter(r => r.post_id === postId)
  const userReaction = postReactions.find(r => r.user_id === userId)?.emoji || null
  const totalReactions = postReactions.length

  // Count each emoji
  const counts: { [emoji: string]: number } = {}
  postReactions.forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + 1 })
  const usedEmojis = REACTIONS.filter(r => counts[r.emoji] > 0)

  return (
    <div ref={pickerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px',
          backgroundColor: userReaction ? '#fef9c3' : 'transparent',
          border: userReaction ? '1px solid #fde68a' : '1px solid transparent',
          borderRadius: '20px', cursor: 'pointer', fontSize: '14px',
          color: userReaction ? '#92400e' : '#4b5563', transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: '18px' }}>{userReaction || '👍'}</span>
        <span>{userReaction ? REACTIONS.find(r => r.emoji === userReaction)?.label : 'React'}</span>
        {totalReactions > 0 && (
          <span style={{ backgroundColor: '#f3f4f6', borderRadius: '10px', padding: '1px 7px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
            {totalReactions}
          </span>
        )}
      </button>

      {usedEmojis.length > 0 && (
        <span style={{ marginLeft: '6px', fontSize: '14px' }}>
          {usedEmojis.map(r => <span key={r.emoji} title={`${counts[r.emoji]} ${r.label}`}>{r.emoji}</span>)}
        </span>
      )}

      {showPicker && (
        <div style={{
          position: 'absolute', bottom: '44px', left: '0',
          backgroundColor: 'white', borderRadius: '50px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px 12px',
          display: 'flex', gap: '4px', zIndex: 100, border: '1px solid #e5e7eb'
        }}>
          {REACTIONS.map(({ emoji, label }) => (
            <button
              key={emoji}
              onClick={() => { onReact(postId, emoji); setShowPicker(false) }}
              title={label}
              style={{
                background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer',
                padding: '4px 6px', borderRadius: '50%', transition: 'transform 0.15s',
                transform: userReaction === emoji ? 'scale(1.3)' : 'scale(1)',
                backgroundColor: userReaction === emoji ? '#fef9c3' : 'transparent'
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4)')}
              onMouseLeave={e => (e.currentTarget.style.transform = userReaction === emoji ? 'scale(1.3)' : 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FeedPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [comments, setComments] = useState<{ [postId: string]: Comment[] }>({})
  const [loading, setLoading] = useState(true)
  const [regionFilter, setRegionFilter] = useState<'all' | 'my-region'>('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [newPostLink, setNewPostLink] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({})
  const [newComments, setNewComments] = useState<{ [postId: string]: string }>({})
  const [replyingTo, setReplyingTo] = useState<{ postId: string; commentId: string; authorName: string } | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editPostContent, setEditPostContent] = useState('')
  const [editPostLink, setEditPostLink] = useState('')
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [userHasPosted, setUserHasPosted] = useState(true)

  useEffect(() => { loadUser() }, [])
  useEffect(() => { if (user) { loadPosts(); loadAllReactions(); checkIfUserHasPosted() } }, [user, regionFilter])
  useEffect(() => { if (shareMessage) { const t = setTimeout(() => setShareMessage(null), 2000); return () => clearTimeout(t) } }, [shareMessage])

  const checkIfUserHasPosted = async () => {
    if (!user) return
    const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('author_id', user.id)
    setUserHasPosted((count || 0) > 0)
  }

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/signin'; return }
    setUser(user)
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!profileData || !profileData.name || !profileData.region) { window.location.href = '/onboarding'; return }
    setProfile(profileData)
    setLoading(false)
  }

  const loadPosts = async () => {
    let query = supabase.from('posts').select('*').order('created_at', { ascending: false })
    if (regionFilter === 'my-region' && profile?.region) query = query.eq('region', profile.region)
    const { data, error } = await query
    if (error) { console.error('Error loading posts:', error); return }
    const postsWithProfiles = await Promise.all(
      (data || []).map(async (post) => {
        const { data: profileData } = await supabase.from('profiles').select('name, region, avatar_url').eq('id', post.author_id).single()
        return { ...post, profiles: profileData }
      })
    )
    setPosts(postsWithProfiles)
    postsWithProfiles.forEach(post => loadComments(post.id))
  }

  const loadAllReactions = async () => {
    const { data } = await supabase.from('post_reactions').select('post_id, user_id, emoji')
    setReactions(data || [])
  }

  const handleReact = async (postId: string, emoji: string) => {
    if (!user) return
    const existing = reactions.find(r => r.post_id === postId && r.user_id === user.id)
    if (existing?.emoji === emoji) {
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.id)
    } else {
      if (existing) await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.id)
      await supabase.from('post_reactions').insert([{ post_id: postId, user_id: user.id, emoji }])
    }
    loadAllReactions()
  }

  const loadComments = async (postId: string) => {
    const { data } = await supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: true })
    if (data) {
      const withProfiles = await Promise.all(data.map(async (c) => {
        const { data: p } = await supabase.from('profiles').select('name, avatar_url').eq('id', c.user_id).single()
        return { ...c, profiles: p }
      }))
      setComments(prev => ({ ...prev, [postId]: withProfiles }))
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return }
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedImage(null); setImagePreview(null); setUploadProgress('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress('Resizing image...')
      const resizedBlob = await resizeImage(file, 1200, 0.85)
      setUploadProgress('Uploading...')
      const fileName = `${user.id}-${Date.now()}.jpg`
      const { error } = await supabase.storage.from('posts').upload(`post-images/${fileName}`, resizedBlob, { contentType: 'image/jpeg', cacheControl: '3600' })
      if (error) { console.error('Upload error:', error); return null }
      const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(`post-images/${fileName}`)
      setUploadProgress(''); return publicUrl
    } catch (error) { console.error('Image processing error:', error); setUploadProgress(''); return null }
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
    const linkUrl = newPostLink.trim() ? ensureHttps(newPostLink.trim()) : null
    const { error } = await supabase.from('posts').insert([{ author_id: user.id, content: newPostContent.trim(), link_url: linkUrl, image_url: imageUrl, region: profile.region }])
    if (error) { console.error('Error creating post:', error); alert('Failed to create post: ' + error.message) }
    else { setNewPostContent(''); setNewPostLink(''); removeImage(); setUserHasPosted(true); loadPosts() }
    setPosting(false)
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) alert('Failed to delete post')
    else loadPosts()
  }

  const startEditPost = (post: Post) => { setEditingPost(post.id); setEditPostContent(post.content); setEditPostLink(post.link_url || '') }
  const cancelEditPost = () => { setEditingPost(null); setEditPostContent(''); setEditPostLink('') }

  const saveEditPost = async (postId: string) => {
    if (!editPostContent.trim()) { alert('Post content cannot be empty'); return }
    const linkUrl = editPostLink.trim() ? ensureHttps(editPostLink.trim()) : null
    const { error } = await supabase.from('posts').update({ content: editPostContent.trim(), link_url: linkUrl }).eq('id', postId)
    if (error) alert('Failed to update post')
    else { setShareMessage('Post updated!'); cancelEditPost(); loadPosts() }
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Delete this comment and all its replies?')) return
    await supabase.from('post_comments').delete().eq('parent_id', commentId)
    const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
    if (error) alert('Failed to delete comment')
    else loadComments(postId)
  }

  const handleAddComment = async (postId: string) => {
    const commentText = newComments[postId]?.trim()
    if (!commentText || !user) return
    const { error } = await supabase.from('post_comments').insert([{ post_id: postId, user_id: user.id, content: commentText, parent_id: null }])
    if (!error) { setNewComments(prev => ({ ...prev, [postId]: '' })); loadComments(postId) }
  }

  const handleAddReply = async (postId: string, parentId: string) => {
    if (!replyText.trim() || !user) return
    const { error } = await supabase.from('post_comments').insert([{ post_id: postId, user_id: user.id, content: replyText.trim(), parent_id: parentId }])
    if (!error) { setReplyText(''); setReplyingTo(null); loadComments(postId) }
  }

  const handleSharePost = async (post: Post) => {
    const postUrl = `${window.location.origin}/post/${post.id}`
    const shareText = `Check out this post on Driver Hub: "${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}"`
    if (navigator.share) {
      try { await navigator.share({ title: 'Driver Hub Post', text: shareText, url: postUrl }) }
      catch (error) { if ((error as Error).name !== 'AbortError') copyToClipboard(postUrl) }
    } else { copyToClipboard(postUrl) }
  }

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setShareMessage('Link copied!') }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); setShareMessage('Link copied!') }
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); window.location.href = '/signin' }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString); const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000); const diffHours = Math.floor(diffMs / 3600000); const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getTopLevelComments = (postId: string) => (comments[postId] || []).filter(c => !c.parent_id)
  const getReplies = (postId: string, commentId: string) => (comments[postId] || []).filter(c => c.parent_id === commentId)
  const isPostOwner = (authorId: string) => user?.id === authorId
  const isCommentOwner = (userId: string) => user?.id === userId

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}><p style={{ fontSize: '18px', color: '#666' }}>Loading...</p></div>
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {shareMessage && (
        <div style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#22c55e', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', zIndex: 300, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          ✓ {shareMessage}
        </div>
      )}

      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🚕 Driver Hub</h1>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '8px', backgroundColor: 'transparent', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
          <a href="/profile" title={profile?.name}><Avatar name={profile?.name || ''} avatarUrl={profile?.avatar_url} size={36} /></a>
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
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '4px', marginBottom: '16px', display: 'flex', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setRegionFilter('all')} style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: regionFilter === 'all' ? '#eab308' : 'transparent', color: regionFilter === 'all' ? 'black' : '#666' }}>All UK</button>
          <button onClick={() => setRegionFilter('my-region')} style={{ flex: 1, padding: '10px 8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', backgroundColor: regionFilter === 'my-region' ? '#eab308' : 'transparent', color: regionFilter === 'my-region' ? 'black' : '#666' }}>{profile?.region || 'My Region'}</button>
        </div>

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

        {posts.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#666', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>No posts yet. Be the first to share something!</div>
        ) : (
          posts.map((post) => {
            const totalComments = (comments[post.id] || []).length
            const isExpanded = expandedComments[post.id]
            const youtubeId = post.link_url ? getYouTubeId(post.link_url) : null
            const canModify = isPostOwner(post.author_id)
            const isEditing = editingPost === post.id
            const topLevelComments = getTopLevelComments(post.id)

            return (
              <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
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

                {post.image_url && !isEditing && (
                  <div style={{ marginBottom: '12px' }}>
                    <img src={post.image_url} alt="Post image" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f3f4f6' }} />
                  </div>
                )}

                {youtubeId && !isEditing && (
                  <div style={{ marginBottom: '12px' }}>
                    <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ borderRadius: '8px' }} />
                  </div>
                )}

                {post.link_url && !youtubeId && !isEditing && (
                  <a href={ensureHttps(post.link_url)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                    <div style={{ color: '#2563eb', fontSize: '13px', wordBreak: 'break-all' }}>🔗 {post.link_url}</div>
                  </a>
                )}

                {!isEditing && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '10px', display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <ReactionPicker postId={post.id} userId={user?.id} reactions={reactions} onReact={handleReact} />
                    <button onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666', fontSize: '14px', borderRadius: '6px' }}>💬 {totalComments}</button>
                    <button onClick={() => handleSharePost(post)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 10px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#666', fontSize: '14px', borderRadius: '6px', marginLeft: 'auto' }}>🔗 Share</button>
                  </div>
                )}

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
    </div>
  )
}

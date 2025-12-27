'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PostWithAuthor, CommentWithAuthor } from '@/lib/database.types'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'You must be logged in to create a post' }
  }

  // Get user profile for region
  const { data: profile } = await supabase
    .from('profiles')
    .select('region')
    .eq('id', user.id)
    .single()

  const content = formData.get('content') as string
  const link_url = formData.get('link_url') as string

  if (!content || content.trim().length === 0) {
    return { error: 'Post content cannot be empty' }
  }

  if (content.length > 1000) {
    return { error: 'Post content must be less than 1000 characters' }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content: content.trim(),
      link_url: link_url || null,
      region: profile?.region || null,
    })

  if (error) {
    console.error('Error creating post:', error)
    return { error: 'Failed to create post. Please try again.' }
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'You must be logged in to like posts' }
  }

  // Check if user already liked this post
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existingLike) {
    // Unlike: remove the like
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error removing like:', error)
      return { error: 'Failed to unlike post' }
    }

    revalidatePath('/feed')
    return { success: true, liked: false }
  } else {
    // Like: add the like
    const { error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      })

    if (error) {
      console.error('Error adding like:', error)
      return { error: 'Failed to like post' }
    }

    revalidatePath('/feed')
    return { success: true, liked: true }
  }
}

export async function addComment(postId: string, content: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'You must be logged in to comment' }
  }

  if (!content || content.trim().length === 0) {
    return { error: 'Comment cannot be empty' }
  }

  if (content.length > 500) {
    return { error: 'Comment must be less than 500 characters' }
  }

  const { error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content: content.trim(),
    })

  if (error) {
    console.error('Error adding comment:', error)
    return { error: 'Failed to add comment. Please try again.' }
  }

  revalidatePath('/feed')
  return { success: true }
}

export async function getPosts(regionFilter: 'all' | 'my-region' = 'all') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { posts: [], error: 'Not authenticated' }
  }

  // Get user's region for filtering
  const { data: profile } = await supabase
    .from('profiles')
    .select('region')
    .eq('id', user.id)
    .single()

  let query = supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(name, region),
      post_likes(count),
      post_comments(count)
    `)
    .order('created_at', { ascending: false })

  // Apply region filter
  if (regionFilter === 'my-region' && profile?.region) {
    query = query.or(`region.eq.${profile.region},region.is.null`)
  }

  const { data: posts, error } = await query

  if (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], error: 'Failed to load posts' }
  }

  // Transform data to include counts and user like status
  const postsWithDetails = await Promise.all(
    (posts || []).map(async (post: any) => {
      // Check if current user has liked this post
      const { data: userLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .single()

      return {
        ...post,
        author: Array.isArray(post.author) ? post.author[0] : post.author,
        likes_count: post.post_likes?.[0]?.count || 0,
        comments_count: post.post_comments?.[0]?.count || 0,
        user_has_liked: !!userLike,
      } as PostWithAuthor
    })
  )

  return { posts: postsWithDetails, error: null }
}

export async function getComments(postId: string) {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      author:profiles!post_comments_author_id_fkey(name)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return { comments: [], error: 'Failed to load comments' }
  }

  const commentsWithAuthor = (comments || []).map((comment: any) => ({
    ...comment,
    author: Array.isArray(comment.author) ? comment.author[0] : comment.author,
  })) as CommentWithAuthor[]

  return { comments: commentsWithAuthor, error: null }
}

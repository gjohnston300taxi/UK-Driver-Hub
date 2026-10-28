import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL, SITE_NAME } from '@/lib/site'

// Built on the server so Google can read the whole article.
// Built fresh on every visit so new posts and edits show up straight away
// (the old timed cache could get stuck on an old copy).
export const dynamic = 'force-dynamic'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  image_url: string | null
  created_at: string
  updated_at: string | null
  author_id: string | null
}

async function getPost(slug: string): Promise<{ post: BlogPost; authorName: string | null } | null> {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return null

    let authorName: string | null = null
    if (data.author_id) {
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.author_id).single()
      authorName = profile?.name || null
    }
    return { post: data as BlogPost, authorName }
  } catch {
    return null
  }
}

// Short plain-text description for Google, made from the excerpt or first lines.
function makeDescription(post: BlogPost) {
  const source = post.excerpt || post.content || ''
  const plain = source.replace(/[#*_>`-]/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > 155 ? plain.slice(0, 152).trim() + '...' : plain
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const result = await getPost(params.slug)
  if (!result) return { title: 'Post not found', robots: { index: false } }
  const { post } = result
  const description = makeDescription(post)
  const url = `/blog/${post.slug}`
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      images: post.image_url ? [{ url: post.image_url, alt: post.title }] : [{ url: '/logo.png' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.image_url ? [post.image_url] : ['/logo.png'],
    },
  }
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// Turn simple formatting in blog text into safe HTML:
// **bold**, [link text](https://... or /page) and bare https:// web addresses
function inlineFormat(text: string) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, (_m, label, url) => {
    const external = url.startsWith('http')
    return `<a href="${url.replace(/"/g, '&quot;')}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''} style="color:#b45309;font-weight:600">${label}</a>`
  })
  html = html.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,!?])/g, (_m, pre, url) =>
    `${pre}<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" style="color:#b45309;font-weight:600">${url}</a>`)
  return html
}

// Convert markdown-style content to HTML (same rules as before)
function renderContent(content: string) {
  const lines = (content || '').split('\n')
  const elements: JSX.Element[] = []
  let currentList: string[] = []
  let listType: 'ul' | 'ol' | null = null

  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const items = currentList
      elements.push(
        listType === 'ul' ? (
          <ul key={`list-${elements.length}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            ))}
          </ul>
        ) : (
          <ol key={`list-${elements.length}`} style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            {items.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            ))}
          </ol>
        )
      )
      currentList = []
      listType = null
    }
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    if (trimmedLine.startsWith('### ')) {
      flushList()
      elements.push(
        <h3 key={index} style={{ fontSize: '20px', fontWeight: '600', marginTop: '32px', marginBottom: '12px', color: '#1f2937' }}>
          {trimmedLine.slice(4)}
        </h3>
      )
    } else if (trimmedLine.startsWith('## ')) {
      flushList()
      elements.push(
        <h2 key={index} style={{ fontSize: '24px', fontWeight: '600', marginTop: '40px', marginBottom: '16px', color: '#1f2937' }}>
          {trimmedLine.slice(3)}
        </h2>
      )
    } else if (trimmedLine.startsWith('# ')) {
      // Only one main heading (H1) per page is best for Google,
      // so headings written with a single # inside an article show as H2.
      flushList()
      elements.push(
        <h2 key={index} style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px', color: '#1f2937' }}>
          {trimmedLine.slice(2)}
        </h2>
      )
    } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      currentList.push(trimmedLine.slice(2))
    } else if (/^\d+\.\s/.test(trimmedLine)) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      currentList.push(trimmedLine.replace(/^\d+\.\s/, ''))
    } else if (trimmedLine === '') {
      flushList()
    } else {
      flushList()
      const processedLine = inlineFormat(trimmedLine)
      elements.push(
        <p
          key={index}
          style={{ marginBottom: '16px', lineHeight: '1.8', color: '#374151' }}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      )
    }
  })

  flushList()
  return elements
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const result = await getPost(params.slug)
  if (!result) notFound()
  const { post, authorName } = result

  // Hidden "Article" label for Google
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: makeDescription(post),
    image: post.image_url ? [post.image_url] : [`${SITE_URL}/logo.png`],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: authorName ? { '@type': 'Person', name: authorName } : { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Hero Image */}
      {post.image_url && (
        <div style={{ width: '100%', maxHeight: '450px', overflow: 'hidden', backgroundColor: '#1f2937', display: 'flex', justifyContent: 'center' }}>
          <img
            src={post.image_url}
            alt={post.title}
            style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', backgroundColor: '#1f2937' }}
          />
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
        {/* Back Link */}
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#eab308', textDecoration: 'none', fontWeight: '500', marginBottom: '24px' }}>
          ← Back to Blog
        </Link>

        {/* Article */}
        <article style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#eab308', marginBottom: '16px', fontWeight: '500' }}>
            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            {authorName && ` • ${authorName}`}
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', lineHeight: '1.3' }}>
            {post.title}
          </h1>

          <div style={{ fontSize: '17px' }}>
            {renderContent(post.content)}
          </div>
        </article>

        {/* Call to action */}
        <div style={{ backgroundColor: '#fef3c7', borderRadius: '12px', padding: '32px', textAlign: 'center', marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
            Join UK Driver Hub Today
          </h2>
          <p style={{ color: '#92400e', marginBottom: '20px' }}>
            Connect with fellow drivers, track your earnings, and stay informed.
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: '#eab308', color: 'black', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px' }}>
            Sign Up Free
          </Link>
        </div>
      </div>
    </div>
  )
}

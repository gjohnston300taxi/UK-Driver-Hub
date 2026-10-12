import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin-only helper: given a news article link, fetch the page and pull out
// its headline, short description and website name, so the admin News form
// can fill them in automatically.

const MAX_BYTES = 1_500_000
const TIMEOUT_MS = 8000

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function findMeta(html: string, keys: string[]) {
  for (const key of keys) {
    // <meta property="og:title" content="..."> (attributes in either order)
    const a = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i').exec(html)
    if (a?.[1]) return decodeEntities(a[1])
    const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i').exec(html)
    if (b?.[1]) return decodeEntities(b[1])
  }
  return ''
}

// Block links to private/internal addresses
function isSafeUrl(raw: string) {
  try {
    const url = new URL(raw)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return false
    return true
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server configuration missing' }, { status: 500 })
    }

    // Only signed-in admins may use this
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    if (!token) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: userData } = await supabase.auth.getUser(token)
    const userId = userData?.user?.id
    if (!userId) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()
    if (!profile?.is_admin) return NextResponse.json({ error: 'Admins only' }, { status: 403 })

    const body = await request.json().catch(() => null)
    const link = typeof body?.url === 'string' ? body.url.trim() : ''
    if (!isSafeUrl(link)) return NextResponse.json({ error: 'Please paste a full web link starting with https://' }, { status: 400 })

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    let html = ''
    try {
      const res = await fetch(link, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; UKDriverHubBot/1.0; +https://www.ukdriverhub.org)',
          Accept: 'text/html,application/xhtml+xml',
        },
        cache: 'no-store',
      })
      if (!res.ok || !res.body) {
        return NextResponse.json({ error: `That website said no (error ${res.status}). Please fill in the details by hand.` }, { status: 422 })
      }
      // Read only the first part of the page (the details are near the top)
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let received = 0
      while (received < MAX_BYTES) {
        const { done, value } = await reader.read()
        if (done) break
        received += value.length
        html += decoder.decode(value, { stream: true })
        if (html.includes('</head>')) break
      }
      reader.cancel().catch(() => {})
    } finally {
      clearTimeout(timer)
    }

    const titleTag = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]
    const title = findMeta(html, ['og:title', 'twitter:title']) || (titleTag ? decodeEntities(titleTag) : '')
    const description = findMeta(html, ['og:description', 'description', 'twitter:description'])
    let source = findMeta(html, ['og:site_name', 'application-name'])
    if (!source) {
      source = new URL(link).hostname.replace(/^www\./, '')
    }
    const published = findMeta(html, ['article:published_time', 'datePublished', 'pubdate', 'date'])

    if (!title && !description) {
      return NextResponse.json({ error: 'Could not read that page. Please fill in the details by hand.' }, { status: 422 })
    }

    return NextResponse.json({ title, description, source, published })
  } catch (err: any) {
    const timedOut = err?.name === 'AbortError'
    return NextResponse.json(
      { error: timedOut ? 'That website took too long to answer. Please fill in the details by hand.' : 'Could not read that page. Please fill in the details by hand.' },
      { status: 422 }
    )
  }
}

import { createPublicClient } from '@/lib/supabase/public'

// Serves the picture for a news story.
// Pictures added by the news SQL files are saved in the "news_images" table
// (so you only need to run one SQL file - no uploading).
// Vercel keeps a copy for a long time, so the database is rarely asked twice.
export async function GET(_request: Request, { params }: { params: { key: string } }) {
  try {
    const supabase = createPublicClient()
    const { data, error } = await supabase
      .from('news_images')
      .select('content_type, data_base64')
      .eq('key', params.key)
      .single()

    if (error || !data?.data_base64) return new Response('Not found', { status: 404 })

    const bytes = Buffer.from(data.data_base64, 'base64')
    return new Response(bytes, {
      headers: {
        'Content-Type': data.content_type || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}

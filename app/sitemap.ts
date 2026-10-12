import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL } from '@/lib/site'

// Google reads this at https://www.ukdriverhub.org/sitemap.xml
// It lists every public page, plus every blog post and news article.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/feed`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/resources`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/insurance`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/marketplace`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/finance`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/assistant`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  let blogPages: MetadataRoute.Sitemap = []
  let newsPages: MetadataRoute.Sitemap = []

  try {
    const supabase = createPublicClient()

    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, created_at, updated_at')
      .eq('published', true)
    blogPages = (posts || []).map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    const { data: news } = await supabase.from('news').select('id, created_at')
    newsPages = (news || []).map((n) => ({
      url: `${SITE_URL}/news/${n.id}`,
      lastModified: new Date(n.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    // If the database can't be reached, still return the main pages
  }

  return [...staticPages, ...blogPages, ...newsPages]
}

import { createSupabaseServiceClient } from '@/lib/supabase-server'
import { TOOLS } from '@/tools'
import { getSite } from '@/lib/site-config'

export default async function sitemap() {
  const BASE_URL = getSite().url
  const staticPages = [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/tools`, lastModified: new Date() },
    ...TOOLS.map((tool) => ({ url: `${BASE_URL}/tools/${tool.slug}`, lastModified: new Date() })),
    { url: `${BASE_URL}/blog`, lastModified: new Date() },
    { url: `${BASE_URL}/about`, lastModified: new Date() },
    { url: `${BASE_URL}/disclaimer`, lastModified: new Date() },
  ]

  const supabase = createSupabaseServiceClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const blogPages = (posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at),
  }))

  return [...staticPages, ...blogPages]
}

import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * ISR 重生成端點
 * Supabase Webhook（supabase/schema.sql 的 blog_posts_revalidate() trigger）
 * 在 blog_posts INSERT/UPDATE 時呼叫此 API，自動重生成對應的靜態頁面，無需重新部署
 */
export async function POST(request: NextRequest) {
  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'REVALIDATE_SECRET not configured' }, { status: 500 })
  }

  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const slug = body?.record?.slug
    const oldSlug = body?.old_record?.slug

    if (slug) revalidatePath(`/blog/${slug}`)
    if (oldSlug && oldSlug !== slug) revalidatePath(`/blog/${oldSlug}`)

    // 無論如何都重生成文章列表與 sitemap（文章下架時 sitemap 也要跟著更新）
    revalidatePath('/blog')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ revalidated: true, slug, oldSlug })
  } catch {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}

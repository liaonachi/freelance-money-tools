import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase-server'
import { JsonLd } from '@/components/ui/JsonLd'
import { ArticleContent } from '@/components/blog/ArticleContent'
import { getSite } from '@/lib/site-config'
import { formatDate } from '@/lib/date'
import { t } from '@/messages'

export const revalidate = 86400

export async function generateStaticParams() {
  // generateStaticParams 在 build time 執行，不能用 cookies()，改用 service client
  const supabase = createSupabaseServiceClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')
  return data?.map((p) => ({ slug: p.slug })) ?? []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServerClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const site = getSite()

  // 文章內容由 admin 後台輸入，但母版會交給不同客戶維運，marked 輸出不能直接信任
  const html = sanitizeHtml(await marked.parse(post.content), {
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          datePublished: post.published_at ?? post.created_at,
          dateModified: post.updated_at,
          publisher: { '@type': 'Organization', name: site.name },
        }}
      />
      {post.faq_jsonld && post.faq_jsonld.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: post.faq_jsonld.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      )}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
          {post.published_at &&
            (() => {
              const publishedDateStr = formatDate(post.published_at)
              const updatedDateStr = post.updated_at ? formatDate(post.updated_at) : null
              const showUpdated = updatedDateStr && updatedDateStr !== publishedDateStr
              return (
                <p className="text-sm text-gray-400">
                  {publishedDateStr}
                  {showUpdated && <span>{t('blog.updatedAt', { date: updatedDateStr })}</span>}
                </p>
              )
            })()}
        </div>

        <ArticleContent html={html} className="prose" slug={slug} />

        <div className="mt-12 pt-8 border-t border-gray-100 flex gap-6">
          <Link href="/blog" className="text-primary hover:opacity-80 text-sm font-medium">
            {t('blog.backToList')}
          </Link>
          <Link href="/" className="text-primary hover:opacity-80 text-sm font-medium">
            {t('blog.backToTools')}
          </Link>
        </div>
      </div>
    </main>
  )
}

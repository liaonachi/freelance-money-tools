import type { Metadata } from 'next'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { formatDate } from '@/lib/date'
import { t } from '@/messages'

export const revalidate = 86400

export const metadata: Metadata = {
  title: t('blog.pageTitle'),
}

export default async function BlogPage() {
  const supabase = await createSupabaseServerClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('blog.pageTitle')}</h1>
        </div>

        {posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{post.excerpt}</p>
                )}
                {post.published_at && <p className="text-xs text-gray-400">{formatDate(post.published_at)}</p>}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">{t('blog.empty')}</p>
          </div>
        )}
      </div>
    </main>
  )
}

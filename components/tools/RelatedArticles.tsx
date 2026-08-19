import Link from 'next/link'
import type { RelatedArticle } from '@/lib/related-articles'

export function RelatedArticles({ articles }: { articles: RelatedArticle[] }) {
  if (articles.length === 0) return null

  return (
    <div className="mt-12 pt-8 border-t border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">延伸閱讀</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/40 transition-all text-sm text-gray-700 hover:text-primary"
          >
            {article.title}
          </Link>
        ))}
      </div>
    </div>
  )
}

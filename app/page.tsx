import Link from 'next/link'
import { TOOLS } from '@/tools'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export default function Home() {
  const site = getSite()
  const featuredTools = TOOLS.slice(0, 4)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{site.name}</h1>
          <p className="text-gray-600">{site.description}</p>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('home.toolsHeading')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{tool.name}</h3>
                <p className="text-sm text-gray-500">{tool.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="text-center">
          <Link
            href="/blog"
            className="inline-block bg-white rounded-2xl px-8 py-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/40 transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('home.blogHeading')}</h2>
            <p className="text-sm text-gray-500">{t('home.blogDescription')}</p>
          </Link>
        </section>
      </div>
    </main>
  )
}

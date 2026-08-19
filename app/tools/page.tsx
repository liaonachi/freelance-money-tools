import type { Metadata } from 'next'
import Link from 'next/link'
import { TOOLS } from '@/tools'
import { t } from '@/messages'

export const metadata: Metadata = {
  title: t('tools.pageTitle'),
}

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('tools.pageTitle')}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/40 transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{tool.name}</h2>
              <p className="text-sm text-gray-500">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

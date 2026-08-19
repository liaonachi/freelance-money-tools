import Link from 'next/link'
import { t } from '@/messages'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{t('notFound.title')}</h1>
        <p className="text-gray-500 mb-8">{t('notFound.body')}</p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-colors"
        >
          {t('notFound.cta')}
        </Link>
      </div>
    </main>
  )
}

import Link from 'next/link'
import { logoutAction } from './login/actions'
import { hasSupabaseEnv } from '@/lib/supabase-server'
import { t } from '@/messages'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/admin/posts" className="font-semibold text-gray-900">
          {t('admin.headerTitle')}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin/posts" className="text-sm text-gray-500 hover:text-gray-700">
            {t('admin.navPosts')}
          </Link>
          <Link href="/admin/seo" className="text-sm text-gray-500 hover:text-gray-700">
            {t('admin.navSeo')}
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            {t('admin.navFrontend')}
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-red-500 hover:text-red-700">
              {t('admin.logout')}
            </button>
          </form>
        </div>
      </header>
      {!hasSupabaseEnv() && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-2 text-sm text-yellow-800">
          {t('admin.noDbBanner')}
        </div>
      )}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

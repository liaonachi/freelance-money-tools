import { loginAction } from './actions'
import { t } from '@/messages'

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">{t('admin.loginTitle')}</h1>
        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {t('admin.passwordLabel')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t('admin.passwordPlaceholder')}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 transition-colors"
          >
            {t('admin.loginButton')}
          </button>
        </form>
      </div>
    </div>
  )
}

import { t } from '@/messages'

export default function AdminSeoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.navSeo')}</h1>
      <p className="text-gray-500">{t('admin.seoPlaceholder')}</p>
    </div>
  )
}

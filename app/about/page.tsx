import type { Metadata } from 'next'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export const metadata: Metadata = {
  title: t('about.metaTitle'),
}

export default function AboutPage() {
  const site = getSite()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('about.heading', { siteName: site.name })}</h1>
        </div>

        <article className="prose">
          <h2>{t('about.whoWeAreHeading')}</h2>
          <p>{'{{ABOUT_INTRO}}'}</p>

          <h2>{t('about.contactHeading')}</h2>
          <p>{'{{CONTACT_INFO}}'}</p>
        </article>
      </div>
    </main>
  )
}

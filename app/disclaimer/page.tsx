import type { Metadata } from 'next'
import Link from 'next/link'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export const metadata: Metadata = {
  title: t('disclaimer.metaTitle'),
}

export default function DisclaimerPage() {
  const site = getSite()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('disclaimer.metaTitle')}</h1>
          <p className="text-gray-600">{t('disclaimer.subtitle')}</p>
        </div>

        <article className="prose">
          <h2>{t('disclaimer.referenceOnlyHeading')}</h2>
          <p>{t('disclaimer.referenceOnlyBody', { siteName: site.name })}</p>
          <p>
            Nothing on {site.name} is financial, tax, or legal advice. The calculators produce simplified
            estimates for general informational purposes only — always confirm numbers with a qualified
            accountant, tax preparer, or attorney, and check your own contract and local law before relying
            on any result.
          </p>

          <h2>{t('disclaimer.affiliateHeading')}</h2>
          <p>
            {site.name} does not currently use affiliate links. If that changes, this section will be updated
            to disclose it.
          </p>

          <p>
            {t('disclaimer.contactPrefix')}
            <Link href="/about">{t('disclaimer.contactLinkText')}</Link>
            {t('disclaimer.contactSuffix')}
          </p>
        </article>
      </div>
    </main>
  )
}

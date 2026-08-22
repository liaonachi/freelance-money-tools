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
          <p>
            {site.name} is a set of free calculators for freelancers — hourly rate, invoice late fees, and
            tax set-aside — built to answer the questions that come up constantly in freelance communities,
            without the spreadsheet math. It&apos;s built on the{' '}
            <a href="https://github.com/liaonachi/seo-tool-site-starter" target="_blank" rel="noopener noreferrer">
              SEO Tool Site Starter
            </a>{' '}
            by Nadia, who builds calculator-driven sites like this one for freelancers and small businesses.
          </p>

          <h2>{t('about.contactHeading')}</h2>
          <p>
            Questions or want a similar site built? Email{' '}
            <a href="mailto:nadiadevstudio@gmail.com">nadiadevstudio@gmail.com</a>
          </p>
        </article>
      </div>
    </main>
  )
}

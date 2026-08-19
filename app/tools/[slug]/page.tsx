import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { TOOLS, getTool } from '@/tools'
import { ToolRenderer } from '@/components/tools/ToolRenderer'
import { RelatedArticles } from '@/components/tools/RelatedArticles'
import { JsonLd } from '@/components/ui/JsonLd'
import { getRelatedArticles } from '@/lib/related-articles'
import { getSite } from '@/lib/site-config'
import { t } from '@/messages'

export const revalidate = 86400

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) return {}

  return {
    title: tool.seo?.title ? { absolute: tool.seo.title } : tool.name,
    description: tool.seo?.description ?? tool.description,
  }
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const tool = getTool(slug)
  if (!tool) notFound()

  const site = getSite()

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: tool.name,
          applicationCategory: tool.category ?? 'UtilityApplication',
          operatingSystem: 'Web',
          url: `${site.url}/tools/${tool.slug}`,
        }}
      />
      {tool.faq && tool.faq.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: tool.faq.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }}
        />
      )}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
          <p className="text-gray-600">{tool.description}</p>
        </div>

        <ToolRenderer slug={tool.slug} />

        {tool.faq && tool.faq.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('tools.faqHeading')}</h2>
            <div className="space-y-4">
              {tool.faq.map((faq) => (
                <div key={faq.question}>
                  <p className="font-medium text-gray-900">{faq.question}</p>
                  <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <RelatedArticles articles={getRelatedArticles(`/tools/${tool.slug}`)} />
      </div>
    </main>
  )
}

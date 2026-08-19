'use client'

import { useRef, useState } from 'react'
import type { BlogPost, FaqItem } from '@/lib/types'
import { t } from '@/messages'

interface Props {
  initialValues?: Partial<BlogPost>
  action: (formData: FormData) => Promise<void>
}

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function PostForm({ initialValues, action }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [slug, setSlug] = useState(initialValues?.slug ?? '')
  const [slugEdited, setSlugEdited] = useState(!!initialValues?.slug)
  const [faqItems, setFaqItems] = useState<FaqItem[]>(initialValues?.faq_jsonld ?? [])
  const statusRef = useRef<HTMLInputElement>(null)

  function addFaqItem() {
    setFaqItems((items) => [...items, { question: '', answer: '' }])
  }

  function removeFaqItem(index: number) {
    setFaqItems((items) => items.filter((_, i) => i !== index))
  }

  function updateFaqItem(index: number, field: keyof FaqItem, value: string) {
    setFaqItems((items) => items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugEdited) {
      setSlug(titleToSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    setSlugEdited(true)
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
        <input
          name="title"
          type="text"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="文章標題"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug（URL 路徑）</label>
        <input
          name="slug"
          type="text"
          required
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          placeholder="url-friendly-slug"
        />
        <p className="mt-1 text-xs text-gray-400">/blog/{slug || 'slug'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">摘要</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={initialValues?.excerpt ?? ''}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="文章摘要（SEO description 用）"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">內容（Markdown）</label>
        <textarea
          name="content"
          rows={22}
          defaultValue={initialValues?.content ?? ''}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-y font-mono text-sm"
          placeholder={'# 文章標題\n\n內文...'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('admin.faqHeading')}</label>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <input
                type="text"
                value={item.question}
                onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                placeholder={t('admin.faqQuestionPlaceholder')}
                aria-label={t('admin.faqQuestionLabel')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <textarea
                rows={2}
                value={item.answer}
                onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                placeholder={t('admin.faqAnswerPlaceholder')}
                aria-label={t('admin.faqAnswerLabel')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-y"
              />
              <button
                type="button"
                onClick={() => removeFaqItem(index)}
                className="text-sm text-red-600 hover:underline"
              >
                {t('admin.faqRemoveButton')}
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addFaqItem}
          className="mt-2 text-sm text-primary hover:underline"
        >
          {t('admin.faqAddButton')}
        </button>
        <input
          type="hidden"
          name="faq_jsonld"
          value={faqItems.length > 0 ? JSON.stringify(faqItems) : ''}
          readOnly
        />
      </div>

      <input type="hidden" name="status" ref={statusRef} defaultValue="draft" />

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          onClick={() => {
            if (statusRef.current) statusRef.current.value = 'draft'
          }}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          儲存草稿
        </button>
        <button
          type="submit"
          onClick={() => {
            if (statusRef.current) statusRef.current.value = 'published'
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-colors"
        >
          儲存並發布
        </button>
      </div>
    </form>
  )
}

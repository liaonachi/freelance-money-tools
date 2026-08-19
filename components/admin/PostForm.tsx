'use client'

import { useRef, useState } from 'react'
import type { BlogPost } from '@/lib/types'

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
  const statusRef = useRef<HTMLInputElement>(null)

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

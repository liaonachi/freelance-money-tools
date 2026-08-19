import { describe, expect, it } from 'vitest'
import { getRelatedArticles, RELATED_ARTICLES } from '@/lib/related-articles'

describe('getRelatedArticles', () => {
  it('回傳空陣列，當工具路徑沒有對應的相關文章', () => {
    expect(getRelatedArticles('/tools/unknown-tool')).toEqual([])
  })

  it('回傳對應工具路徑設定的相關文章清單', () => {
    RELATED_ARTICLES['/tools/example'] = [{ slug: 'example-post', title: 'Example Post' }]

    expect(getRelatedArticles('/tools/example')).toEqual([
      { slug: 'example-post', title: 'Example Post' },
    ])

    delete RELATED_ARTICLES['/tools/example']
  })
})

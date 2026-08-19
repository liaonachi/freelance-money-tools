'use client'

import { useEffect, useRef } from 'react'
import { trackAffiliateClick, trackArticleToTool } from '@/lib/analytics'

interface Props {
  html: string
  className?: string
  slug: string
}

export function ArticleContent({ html, className, slug }: Props) {
  const containerRef = useRef<HTMLElement>(null)

  // 文章連結是 dangerouslySetInnerHTML 出來的純 <a>，單擊會讓整頁卸載，
  // 追蹤請求可能來不及送達。幫 /tools/* 站內連結跟外部連結加開新分頁，
  // 原分頁不會被卸載，事件才送得穩定。
  useEffect(() => {
    const links = containerRef.current?.querySelectorAll('a') ?? []
    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (!href) return

      const isToolLink = href.startsWith('/tools/')
      let isExternalLink = false
      if (!isToolLink) {
        try {
          const url = new URL(href, window.location.href)
          isExternalLink = url.hostname !== window.location.hostname
        } catch {
          isExternalLink = false
        }
      }

      if (isToolLink || isExternalLink) {
        link.setAttribute('target', '_blank')
        link.setAttribute('rel', 'noopener noreferrer')
      }
    })
  }, [html])

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    const link = (event.target as HTMLElement).closest('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (href && href.startsWith('/tools/')) {
      trackArticleToTool(slug, href)
      return
    }
    if (!href || href.startsWith('/') || href.startsWith('#')) return

    let url: URL
    try {
      url = new URL(href, window.location.href)
    } catch {
      return
    }
    if (url.hostname === window.location.hostname) return

    trackAffiliateClick('article_outbound', url.hostname)
  }

  return (
    <article
      ref={containerRef}
      className={className}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

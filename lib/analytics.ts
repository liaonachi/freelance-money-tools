// GA4 event 追蹤 helper（client-safe）

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export type AffiliateLinkType = 'affiliate' | 'article_outbound'

export function trackAffiliateClick(linkType: AffiliateLinkType, itemName: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'affiliate_click', {
    link_type: linkType,
    item_name: itemName,
    page_path: window.location.pathname,
  })
}

export function trackToolUse(toolName: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'tool_use', { tool_name: toolName })
}

export function trackToolToTool(fromTool: string, toTool: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'tool_to_tool', { from_tool: fromTool, to_tool: toTool })
}

export function trackArticleToTool(articleSlug: string, toolPath: string): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'article_to_tool', { from_article: articleSlug, to_tool: toolPath })
}

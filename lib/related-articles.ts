// 文章頁 → 工具頁的相關文章對照表。
// key 是工具頁路徑（/tools/<slug>），value 是要推薦的文章 slug/title。
// 客戶案子上文章、建工具後在此手動維護；母版不預帶任何業務資料。

export type RelatedArticle = {
  slug: string
  title: string
}

export const RELATED_ARTICLES: Record<string, RelatedArticle[]> = {}

export function getRelatedArticles(toolPath: string): RelatedArticle[] {
  return RELATED_ARTICLES[toolPath] ?? []
}

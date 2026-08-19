// 母版型別定義 — 目前只有 blog_posts 一張表
// 客戶 repo 若新增資料表（比較表類），在客戶 repo 自行擴充此檔案

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: BlogPost
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlogPost, 'id' | 'created_at'>>
        Relationships: never[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type FaqItem = {
  question: string
  answer: string
}

export type BlogPost = {
  id: number
  title: string
  slug: string
  content: string // Markdown
  excerpt: string | null
  cover_image: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  faq_jsonld: FaqItem[] | null
}

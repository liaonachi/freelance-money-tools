// 讀 content/articles/*.md（frontmatter: title/slug/excerpt/status/faq + Markdown 內文）
// upsert 進 blog_posts（用 service role，繞過 RLS）。這些檔案是文章的 source of truth，
// 之後改文章內容改這裡再重跑這支 script，不要只改 DB。
//
// 用法：npm run seed:articles
//
// 純 node 執行（沒裝 tsx/ts-node）：相對路徑 import 要帶明確 .ts 副檔名，
// @ path alias 在這裡完全無法解析，見 CLAUDE.md 已知陷阱第 8 條。

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ARTICLES_DIR = resolve(ROOT, 'content/articles')

type FaqItem = { question: string; answer: string }

type ArticleFrontmatter = {
  title: string
  slug: string
  excerpt?: string
  status: 'draft' | 'published'
  faq?: FaqItem[]
}

function loadEnvLocal(): Record<string, string> {
  const envPath = resolve(ROOT, '.env.local')
  const raw = readFileSync(envPath, 'utf8')
  const env: Record<string, string> = {}
  for (const line of raw.split('\n')) {
    if (!line.includes('=') || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return env
}

function loadArticles(): { frontmatter: ArticleFrontmatter; content: string; file: string }[] {
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'))
  return files.map((file) => {
    const raw = readFileSync(resolve(ARTICLES_DIR, file), 'utf8')
    const { data, content } = matter(raw)
    const frontmatter = data as ArticleFrontmatter
    if (!frontmatter.slug || !frontmatter.title || !frontmatter.status) {
      throw new Error(`${file}: frontmatter 缺 title/slug/status`)
    }
    if (`${frontmatter.slug}.md` !== file) {
      throw new Error(`${file}: 檔名跟 frontmatter.slug ("${frontmatter.slug}") 對不上`)
    }
    return { frontmatter, content: content.trim() + '\n', file }
  })
}

async function main() {
  const env = loadEnvLocal()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('.env.local 缺 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(url, serviceKey)
  const articles = loadArticles()

  for (const { frontmatter, content, file } of articles) {
    // published_at 只在「第一次真的發布」時設值，重跑這支 script 更新既有文章
    // 不能每次都把 published_at 蓋成現在——那樣文章的「發布日期」會一直往後跑。
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('published_at')
      .eq('slug', frontmatter.slug)
      .maybeSingle()

    const publishedAt =
      frontmatter.status !== 'published'
        ? null
        : (existing?.published_at ?? new Date().toISOString())

    const { error } = await supabase.from('blog_posts').upsert(
      {
        title: frontmatter.title,
        slug: frontmatter.slug,
        content,
        excerpt: frontmatter.excerpt ?? null,
        status: frontmatter.status,
        published_at: publishedAt,
        faq_jsonld: frontmatter.faq && frontmatter.faq.length > 0 ? frontmatter.faq : null,
      },
      { onConflict: 'slug' }
    )
    if (error) {
      console.error(`FAILED: ${file} (${frontmatter.slug}) — ${error.message}`)
      process.exitCode = 1
    } else {
      console.log(`OK: ${frontmatter.slug} (${frontmatter.status})`)
    }
  }
}

main()

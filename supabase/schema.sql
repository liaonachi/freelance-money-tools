-- SEO Tool Site Starter — Database Schema
-- Source of truth: 所有 DB 改動都改這個檔案（冪等：IF NOT EXISTS / ON CONFLICT DO NOTHING）
-- Apply: npm run db:apply（執行 scripts/db-apply.ts，直接連線套用整份檔案，不是 Supabase CLI migration 模式）

-- ============================================
-- blog_posts
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  content          TEXT NOT NULL DEFAULT '',         -- Markdown 格式
  excerpt          TEXT,                             -- 摘要（SEO meta description 用）
  cover_image      TEXT,                             -- 封面圖 URL
  status           TEXT NOT NULL DEFAULT 'draft'     -- 'draft' | 'published'
                     CHECK (status IN ('draft', 'published')),
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  faq_jsonld       JSONB                              -- [{question, answer}]，供文章頁 render FAQPage JSON-LD
);

-- 文章更新時自動更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- RLS（Row Level Security）
-- ============================================
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "公開讀取已發布文章" ON blog_posts;
CREATE POLICY "公開讀取已發布文章" ON blog_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Service role 完整存取 posts" ON blog_posts;
CREATE POLICY "Service role 完整存取 posts" ON blog_posts USING (auth.role() = 'service_role');

-- ============================================
-- ISR Revalidation Webhook（pg_net，客戶 repo 部署後套用）
-- ============================================
-- blog_posts INSERT/UPDATE → POST /api/revalidate → Vercel ISR 重生成
-- 前置條件：pg_net extension 已啟用（CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions）
-- 套用前先把 <VERCEL_DOMAIN> 與 <REVALIDATE_SECRET> 換成客戶案的實際值

-- body 帶 record／old_record（改 slug 時 route 端才能同時清舊路徑），
-- 不能送空 body：route.ts 是靠 body.record.slug 才知道要 revalidate 哪篇文章
CREATE OR REPLACE FUNCTION public.blog_posts_revalidate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url     := 'https://<VERCEL_DOMAIN>/api/revalidate?secret=<REVALIDATE_SECRET>',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS blog_posts_revalidate_trigger ON public.blog_posts;
CREATE TRIGGER blog_posts_revalidate_trigger
  AFTER INSERT OR UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.blog_posts_revalidate();

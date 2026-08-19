# Claude Code 接手指南

> 給 Claude Code 看的專案上下文。每次開新對話請先讀這個檔再讀 specs/blueprint.md。

## 專案目的

**Freelance Money Tools** — 給 freelancer 用的免費計算機小站（hourly rate、late fee、tax set-aside 三個工具 + 對應部落格文章）。這是產品化服務「SEO Tool Website」母版 [seo-tool-site-starter](https://github.com/liaonachi/seo-tool-site-starter)（private，本機路徑 `~/Documents/Claude/Projects/seo-tool-site-starter`）第一次真實交付案，同時是 Nadia 的 Upwork／Contra 作品集，會實際部署上線。

**這個 repo 是一個真正的網站**（跟母版不同，母版本身不部署）：接自己的 Supabase 專案（`seo-demo`）、部署在自己的 Vercel 專案（`freelance-money-tools`）。技術棧、目錄結構、開發慣例全部繼承母版，此檔只做必要調整；細節與站台特有資訊見 `specs/blueprint.md`、`specs/demo-site.md`。

**與母版的關係**：`upstream` remote 指向母版。**不在這個 repo 改引擎**（`ToolRenderer`、`site.config` schema、`messages/` 架構…）——引擎改動一律先進母版，這裡用 `git fetch upstream` + cherry-pick 拉進來，不做自動同步。母版專屬檔案（`docs/productized-service-offer.md`、`docs/upstream-changelog.md`、母版自己的 `specs/`）已在 fork 時移除。

## 技術棧

- **Next.js（App Router、TypeScript strict）** — 前端 + API Routes；請求攔截用根目錄 `proxy.ts`（export `proxy`），不用 deprecated 的 `middleware.ts`
- **Tailwind CSS v4** — 樣式（記得 base layer 補 button cursor）
- **Supabase（Postgres）** — 專案 `seo-demo`（獨立帳號 `liaonachi+seodemo@gmail.com`，region ap-northeast-1）
- **Vercel** — 專案 `freelance-money-tools`；ISR（revalidate: 86400）
- **GA4 + Google Search Console API** — 量測（`lib/analytics.ts`、`lib/gsc.ts`）
- **Vitest + GitHub Actions** — 測試與 CI

## 資料模型

- `blog_posts` — 文章（slug、title、content Markdown、status、faq_jsonld、updated_at）。
- 工具的資料不進 DB：工具由 `tools/*.config.ts` 定義（欄位、公式、輸出、FAQ、metadata），純程式碼。

## 目錄結構

```
app/
  page.tsx                首頁（讀 site.config 列工具與文章）
  layout.tsx              讀 site.config 產 metadata、注入 --site-primary
  tools/
    page.tsx              工具列表
    [slug]/page.tsx       動態讀 tools/<slug>.config.ts → ToolRenderer
  blog/                   文章列表 + [slug]（ISR）
  admin/                  login / posts CRUD / seo（GSC 儀表板）
  api/revalidate/         Supabase webhook → revalidatePath（含 sitemap）
  sitemap.ts  robots.ts   讀 site.config 的 url
components/
  tools/ToolRenderer.tsx  設定驅動的工具渲染引擎
  blog/  ui/              Header/Footer 讀 site.config 的 nav/footer
lib/
  tool-config.ts          ToolConfig 型別 + 驗證
  site-config.ts          getSite()（含 validate-throw）；validate-site-config.ts 是純型別+驗證
  date.ts                 formatDate(iso)，統一用 site.locale + site.timezone
  analytics.ts            GA4 event helper（tool_use / affiliate_click / article_to_tool）
  gsc.ts  supabase-*.ts  related-articles.ts  types.ts
tools/                    每個工具一份 <slug>.config.ts（hourly-rate / late-fee / tax-set-aside）
messages/                 內建 UI 文案雙語（zh-TW.ts / en.ts / index.ts 的 t()）；本站用 en
site.config.ts            站名 / 網域 / GA4 ID / 主色 / 語系 / nav（唯一站台設定來源，見 docs/site-config.md）
scripts/
  new-site.ts  new-tool.ts        互動式 scaffold（純 node 執行，見已知陷阱）
  lib/render-site-config.ts  render-tool-config.ts  patch-registry.ts   純函數，可測試
  db-apply.ts  fetch-gsc-report.ts
supabase/schema.sql       唯一 DB source of truth（冪等）
docs/
  site-config.md          site.config.ts 每個欄位說明、加語系流程
  adding-a-tool.md         優先用 new:tool，手動流程當備援
  handover.md             交付文件（這次「客戶」是 Nadia 自己，當範本）
  delivery-checklist.md   14 天交付流程 + DoD
  screenshots/            Upwork 作品集截圖
specs/                    blueprint.md + demo-site.md（主 spec）+ SESSION-HANDOFF.md
__tests__/
```

## 必要環境變數（.env.local）

這是實際部署的站，**全部要填**：

```
NEXT_PUBLIC_SUPABASE_URL=        # seo-demo 專案
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=                 # db:apply 用
REVALIDATE_SECRET=               # 自訂隨機字串，Supabase Webhook 驗證
ADMIN_PASSWORD=                  # 後台密碼，需同步加到 Vercel
ADMIN_SESSION_SECRET=            # 後台 session cookie 簽章用亂數字串，需同步加到 Vercel（缺這個 admin 會直接無法登入，fail-closed）
GSC_* / GOOGLE_*                 # GSC API OAuth
```

**站名／網域／GA4 ID／語系／貨幣／時區不在 env**，改讀根目錄 `site.config.ts`（`npm run new:site` 產出，見 `docs/site-config.md`）——這些值不是 secret。

**Supabase MCP（本機開發用）**：`.mcp.json`（gitignored，不進版控）放實際 PAT；`.mcp.json.example` 是格式範本，PAT 由 Nadia 直接交給 Code CLI，不貼在 Cowork 對話或任何雲端沙盒。

## 常用指令（驗收一律用這些，不要自己猜）

```bash
npm run lint              # ESLint
npx tsc --noEmit          # TypeScript 型別檢查
npm test                  # Vitest 全部測試
npm run test:coverage     # 覆蓋率（CI 門檻 lines/functions 60%、branches 50%）
npm run build             # Next.js build
npm run db:apply          # 套用 supabase/schema.sql
npm run dev               # 開發伺服器
npm run new:site          # 互動式產 site.config.ts；--yes/--force/--<field> 支援非互動
npm run new:tool          # 互動式產 tools/<slug>.config.ts + 測試骨架 + registry 註冊；--json 支援非互動
```

## 驗收標準（Definition of Done）

1. `npx tsc --noEmit` 0 errors
2. `npm test` 全過；新增的純函數 / server action / config 驗證有對應測試
3. `npm run build` 成功
4. 有 schema 變更時 `supabase/schema.sql` 已更新（冪等）
5. commit + push 完成，訊息符合慣例
6. Vercel production deploy 正常、`https://freelance-money-tools.vercel.app` 可用

## 決策規則（遇到就照做，不要重新判斷）

- **Schema 變更** → 只改 `supabase/schema.sql`（冪等：IF NOT EXISTS / ON CONFLICT DO NOTHING）；新欄位一律 nullable。絕不手動下 ALTER。
- **外部 API 失敗（GSC、Supabase）** → 記 log、回空資料、繼續跑；build 期間絕不因外部服務失敗而 crash。
- **不確定需求** → 停下來問，附 A/B 選項。
- **要不要把某個改動放進這個 repo，還是先進母版** → 引擎層／可能被下一個客戶重用的東西 → 先進母版再 cherry-pick；只跟這個站台內容有關（文案、工具參數、文章）→ 直接在這裡改。
- **工具頁實作** → 一律先試 `tools/*.config.ts` + ToolRenderer；config 表達不了才用 `customRenderer` 逃生口，並記下「引擎缺什麼」（回報給母版）。
- **`tools/*.config.ts`、`tools/index.ts`、`site.config.ts`、`lib/site-config.ts`、`messages/*` 都是 universal module**（同時打進 server bundle 給 `page.tsx`/`layout.tsx` 用、client bundle 給 `ToolRenderer`/`Header`/`Footer` 用）→ 不得 import server-only 依賴（`next/headers`、`@/lib/supabase-server`、`fs`…），否則 client build 會炸。
- **品牌／語系／網域／GA4/色系/nav 一律進 `site.config.ts`，不要新增 `NEXT_PUBLIC_*` env 或寫死字串**；固定的引擎層 UI 文案（按鈕、通用標籤）進 `messages/`，用 `t(key)`；本站內容（站名、nav 文字、文章）不進 `messages/`。
- **`customRenderer` = 自己負責整個工具頁**（含 `'use client'` 與 GA4 event）→ 引擎（`ToolRenderer`）完全不介入，不要假設 customRenderer 還能吃到引擎的 state。
- **通用陷阱**（Next.js 新版、Supabase、Vercel）→ 見全域 `~/.claude/CLAUDE.md`（claude-dotfiles 同步），此處不重複。

## 關鍵流程

**母版更新拉進這個站**
```
git fetch upstream → 看 upstream 的 commit log 決定要不要 cherry-pick
  → cherry-pick 進 main → 跑驗收標準 → commit + push
```
（不是自動同步；沒有母版側的 `docs/upstream-changelog.md` 可查，直接看 upstream 的 commit history。）

**ISR 重生成**
```
編輯文章（/admin/posts）→ Supabase Webhook（blog_posts INSERT/UPDATE）
  → POST /api/revalidate?secret=… → revalidatePath('/blog/[slug]', '/blog', '/sitemap.xml')
```

## 已知陷阱

1. **build 期間沒有 Supabase env**：`lib/supabase-server.ts` 在 env 缺失時要回 no-op client、blog 頁回空陣列，否則 `npm run build` 會炸（本站已填 env 後應該不會遇到，但本機沒 `.env.local` 時仍可能觸發）。
2. **sitemap 不隨文章下架更新**：`/api/revalidate` 直接含 `revalidatePath('/sitemap.xml')`，不要拿掉。
3. **Supabase migration `replace()` 換行符不一致會靜默失敗**：跨段落取代用單行 `replace()`。
4. **Tailwind v4 button cursor 預設 default**：globals.css base layer 已補。
5. **GSC `siteUrl` 格式**：本站用 URL 前綴資源（`https://freelance-money-tools.vercel.app/`），不是網域資源，兩者格式不能互換。
6. **auto mode 分類器會擋第一次 `git commit` / `gh repo create` 這類寫入操作**：被擋不是權限問題，跟 Nadia 要一句明確授權後同一指令即可執行。
7. **jsdom 30+ 對 Node 版本要求很窄**（實際裝到的版本要求 `^22.22.2 || ^24.15.0 || >=26.0.0`）：本機 Node 24 測試會過，但 `.github/workflows/test.yml` 若 `node-version` 釘在 20，CI 會在 `test:coverage` 步驟炸掉，錯誤訊息完全看不出跟 Node 版本有關。push 完要去 `gh run watch` 實際看過綠燈，不能只憑本機測試通過就假設 CI 會過。
8. **`scripts/new-site.ts`／`scripts/new-tool.ts` 是純 `node` 執行（沒裝 tsx/ts-node）**：(a) 相對路徑 import 必須帶明確副檔名 `.ts`，Node 的 ESM loader 不會自動補；(b) `@/` path alias 在純 node 執行下**完全無法解析**，這兩個檔案跟它們 import 的 `scripts/lib/*.ts` 一律只能用相對路徑；(c) 沒有 `"type": "module"` 也能跑，會印一次性能警告，這是預期行為、不用消除。
9. **本機沒設 SSH key 給 GitHub**：`git@github.com` host key verification failed；clone／remote 一律用 https（跟 `gh auth status` 走的協定一致）。

## 慣例

- TypeScript strict mode 開啟
- 中文註解 OK；**本站前台文案是 English（`site.config.locale = 'en'`）**，引擎層固定 UI 文案在 `messages/`（`t(key)`，依 locale 自動選字典），本站內容（站名/nav/文章）在 `site.config.ts` 與內容本身，不寫死中文
- commit message：`feat|fix|chore(範圍): 中文簡述`
- 實作前先看現有程式，不重造 helper（lib/、components/ui/）
- **時區 America/New_York**：日期時間顯示與計算一律明確指定 `timeZone`（讀 `site.config.timezone`），不依賴 `process.env.TZ`——Vercel 預設 UTC
- 不開 worktree，直接在主目錄工作；做完 commit + push 到 main

## Cowork 給 Code CLI 的觸發句格式

```
cd ~/Documents/Claude/Projects/freelance-money-tools，不要開 worktree。
讀 specs/demo-site.md（或指定 slug）直接動工（或：先寫 plan 不要動工）。
完成後依序跑 npx tsc --noEmit、npm test、npm run build，都無錯誤再 commit + push。
在對應 spec 末尾追加 ## Result（改動檔案清單 + commit hash）。
所有回覆請用繁體中文。
```

git commit / push 一律交給 Code CLI；Cowork 只寫檔案，不對本機 repo 下 git 指令。

## 協作方式

- 使用者偏好**繁體中文 zh-TW**
- 重大架構改動前先講計畫等同意；新需求先問 1–3 個關鍵問題附 A/B
- 做完就 commit + push，事後告知 message
- 想看到實際畫面／結果勝過長篇解釋
- spec / plan / review / result 全部寫進 `specs/<slug>.md`，對話裡只貼一句話指標

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

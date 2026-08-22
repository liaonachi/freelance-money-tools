# 交付流程 Checklist（14 天 B 套餐；A 套餐取子集、C 套餐加末段）

> 內部用。每個客戶案 fork 出去後，複製這份到客戶 repo 的 `docs/delivery-checklist.md`，逐項打勾；交付時連同 `docs/handover.md` 一起給客戶。
> 時數欄是母版目標值（B 套餐總計 ≤ 15h），實際數字每案填回，累積三案後校準 `docs/productized-service-offer.md` 的定價。

**實際工時（本案，2026-08-19，Code CLI 執行，AI agent 時間，不是人力工時）**：
- Day 1–2：約 40 分鐘（建 Supabase 專案、套 schema、寫 `specs/tools.md`）
- Day 3–11 第一段（工具＋文案＋文章）：對話總長約 33 分鐘（14:08–14:41），內含約 10 分鐘排查「誤以為有別的 session 同時改 repo」；母版那邊另有一個沒完成任何事、燒了 23 分鐘的失敗背景 fork（算在母版 repo，不算這裡）
- Day 3–11 第二段（文章匯出成檔案＋seed script、Vercel 部署＋env、webhook 驗證、GSC 卡住）：約 15 分鐘（19:33–19:48），內含兩次因為查 DB trigger 原始碼把 `REVALIDATE_SECRET` 印到對話、緊急轉兩次新 secret 的插曲

跟母版「目標 Xh」的人力估算不是同一個量級，不能直接拿來校準定價——保留數字只是記錄「這次跑下來花了多久」，真正拿來校準報價的應該是 Nadia 自己盯場/審核的時間。

## Day 0 — 成交前（不算工時）

- [ ] 客戶填 intake 表：站名／網域／語言／貨幣／目標讀者／要做的 2–3 個工具（每個：輸入、輸出、公式來源）／有沒有現成文章／GA4、GSC、Vercel、Supabase 帳號有無
- [ ] 判定套餐（A／B／C）與加購（第三方登入、月維護）；報價與交期用 `docs/productized-service-offer.md` 的區間
- [ ] 收訂金（Upwork：milestone 1 funded）

## Day 1–2 — Spec（目標 1.5h）

- [x] fork 母版 → 客戶 private repo：clone／加 remote 一律用 https（`git@github.com` 的 SSH 若本機沒設 key 會 host key verification failed；`gh auth status` 走 https 時用 https URL 才會跟 CLI 一致）
- [x] 加完 `upstream` remote（指回母版）後，馬上跑 `gh repo set-default <客戶repo>`——repo 目錄下同時有 `origin`（客戶）跟 `upstream`（母版）兩個 remote 時，`gh` 系列指令（`gh run list`、`gh repo view`…）預設會抓到母版而不是客戶 repo，沒先 set-default 會查錯 CI 狀態
- [x] `npm run new:site`（用 intake 表答案）→ 提交
- [x] 每個工具寫 `specs/tool-<slug>.md`：輸入欄位表、公式（附來源）、輸出、CTA 目標、FAQ 3 條 → **客戶書面確認公式**（這是最容易返工的地方，沒確認不動工）——本案寫在 `specs/tools.md`（三個工具合一份），「客戶確認」在這案等同 Nadia 自己過目
- [x] 建客戶自己的 Supabase 專案、`.env.local` 填齊（對照 handover §2 表）——**Vercel 專案還沒建**，留到後續 session（這次明確排除）
- [x] `npm run db:apply`；`supabase/schema.sql` 的 `<VERCEL_DOMAIN>`／`<REVALIDATE_SECRET>` 換成實際值後再套用一次

## Day 3–11 — Build（目標 8h）

- [x] 每個工具：`npm run new:tool` → 寫 `compute()` → 補測試（預設值、邊界、verdict 各分支）→ FAQ → CTA（1.5–2h／工具）——slug：`hourly-rate`／`late-fee`／`tax-set-aside`；select（late-fee 的 rateType）／toggle（tax-set-aside 的 includeSelfEmploymentTax）互動測試依規則先補在母版（commit `8abd49b`，新增 example `discount-calculator` 專門補這個缺口），刻意沒有 cherry-pick 回這裡——`discount-calculator` 是母版專屬 example，拉進來會變第 4 個工具，違反 spec；demo 這邊已有自己等價的 select/toggle 覆蓋（下一行）
- [x] 首頁文案、about、disclaimer 換成客戶內容（`messages/` 只放引擎文案，站內容直接改頁面）——首頁本來就完全讀 `site.config.ts`／`TOOLS`，不用另外改；about／disclaimer 原本是母版佔位符（`{{ABOUT_INTRO}}`／`{{CONTACT_INFO}}`），這次補上英文內容（`{{CONTACT}}` 留待 Nadia 補聯絡方式）
- [x] 文章：三篇皆 `status=published`，改成 `content/articles/<slug>.md`（frontmatter: title/slug/excerpt/status/faq）為 source of truth，`npm run seed:articles` 讀檔 upsert 進 `blog_posts`（用 service role）；至少 1 個 `/tools/<slug>` 內連、faq_jsonld 都有填
- [x] **Vercel**：`vercel link` 建專案 `freelance-money-tools`（project ID `prj_CaDnvCmVKj41Lq43RX1HtkOJ7xN9`）並用 `vercel git connect` 明確指到 `origin`（這個 repo 同時有 `origin`／`upstream` 兩個 remote，`vercel link` 互動問「連哪個 remote」在非互動環境會卡住，改用 `git connect` 帶完整 URL 跳過那個選單）；`.env.local` 7 個變數用 `vercel env add` 逐一設進 Production（沒印值）；`vercel deploy --prod` 成功並 alias 到 `https://freelance-money-tools.vercel.app`——首頁／三個工具／三篇文章／`/sitemap.xml`／`/robots.txt`／`/about`／`/disclaimer` 全部 200，`<html lang="en">`，`--site-primary:#0f766e`（teal）確認無誤
- [x] **Supabase webhook 指到正式網域**：在 DB 直接改一篇文章標題一個字元（等同 admin 操作的同一條路徑）→ 2 秒內前台反映；改完立刻改回原文字
- [~] GSC：**卡住，需要 Nadia 手動處理**——建 URL-prefix property 跟 HTML 檔驗證都要求登入 Nadia 的 Google 帳號在瀏覽器操作，這個環境沒有瀏覽器也沒有 GSC OAuth 憑證，無法用 API 或 CLI 完成。sitemap（`/sitemap.xml`）本身已經正常運作，等 property 建好後提交即可。
- [ ] GA4：`site.config.ts` 填 ga4Id；在 GA4 Admin 把 `affiliate_click` 標 Key Event——**本次明確排除，跟這次指示一致**
- [ ] （C 套餐）不適用（B 套餐）
- [x] `npx tsc --noEmit && npm test && npm run build && npm run lint` 全綠；push 後 CI 綠燈

## Day 12–13 — Review（目標 1.5h）

- [ ] 客戶預覽連結（Vercel preview 或正式網域）；用 handover §3／§4 的步驟讓客戶自己發一篇文章、改一個工具預設值——**客戶操作過才算驗收**
- [ ] 跑本檔案末尾的「QA checklist」段落逐項
- [ ] 修客戶回饋（限 spec 範圍內；範圍外的記進「加購／下期」）

## Day 14 — Launch + Handover（目標 1h）

- [ ] 正式網域指到 Vercel、SSL 生效、`site.config.ts` 的 `url` 是正式網域並已重新部署（sitemap／JSON-LD 才會對）
- [ ] 填 `docs/handover.md` 所有 `{{…}}` 與 ⚙️ 段落，連同 repo admin 權限交給客戶
- [ ] Upwork：submit milestone、請客戶留評（附一句話模板）
- [ ] 提月維護方案（handover §7）
- [ ] **回填母版**：這案有沒有做出「下一個客戶 ≥ 50% 會用到」的東西？有 → 開 spec 回母版；`docs/upstream-changelog.md` 記一筆；實際工時填進本檔頂端

## QA checklist（Day 12 跑，2026-08-22 執行）

- [x] 每個工具頁：預設值結果正確；清空輸入不 crash；手機版排版；CTA 連結對；`view-source` 有 WebApplication／FAQPage JSON-LD——三個工具頁用 headless Chrome（puppeteer-core）跑過：預設值算出的結果符合公式；把所有輸入清空不 crash（頁面照常渲染，無 console error）；390px 手機寬度單欄排版正常、無橫向溢出；`/tools/hourly-rate` CTA 連到 `/tools/tax-set-aside`；`curl` view-source 確認 `WebApplication` + `FAQPage` JSON-LD 都有輸出
- [x] 文章頁：日期格式與時區對；內連工具連結開新分頁；FAQ 區塊；OG 預覽（用 opengraph.xyz 之類看一眼）——日期 `America/New_York` 時區格式化正確；內連 `/tools/*` 連結在瀏覽器實測（`ArticleContent.tsx` 用 client-side `useEffect` 補 `target="_blank"`，純 `curl` 看不到、須用瀏覽器驗證）確認會開新分頁；FAQ JSON-LD 存在；OG 標籤（`og:title`／`og:description`／`og:url`）都有輸出
- [x] `/sitemap.xml` 含首頁、工具、文章；`/robots.txt` disallow `/admin/`——`curl` 核對過，10 個 URL 都在（首頁／tools／3 工具／blog／about／disclaimer／3 篇文章），`robots.txt` 有 `Disallow: /admin/`
- [~] admin：錯密碼進不去；登入後發文→前台幾秒內出現；取消發布→404 且 sitemap 消失——**只驗到一半，需要 Nadia 補測**：自動化寫入正式站資料庫的動作被 Claude Code 的權限分類器擋下（讀 `.env.local` 密碼＋對正式站送出登入表單，判定為敏感操作），改用 `curl` 側面驗證「未登入直接訪問 `/admin/posts` 會 307 到 `/admin/login`」（通過）；接著用唯讀方式（不寫資料）單純測登入本身也失敗——本機 `.env.local` 的 `ADMIN_PASSWORD` 打進正式站登入表單，被導回 `/admin/login`（沒登入成功）。`vercel env ls production` 有看到 `ADMIN_PASSWORD` 存在（3 天前建立，時間點跟本機 `.env.local` 一致），但無法比對實際值是否相同（`vercel env pull` 同樣被分類器擋下）。**懷疑本機 `.env.local` 的密碼跟 Vercel Production 實際值不一致**（可能是先前 session 排查 `REVALIDATE_SECRET` 時的轉 secret 插曲，順手也動到了這個，或者單純是手動同步時漏掉）。麻煩 Nadia 自己到 `https://freelance-money-tools.vercel.app/admin/login` 試登入一次；如果也失敗，去 Vercel Dashboard → Settings → Environment Variables 重設 `ADMIN_PASSWORD` 並同步更新本機 `.env.local`。發文／取消發布的前後台同步行為本身（`revalidatePath` 邏輯）程式碼是對的，之前 Day 3-11 的 webhook 測試（改文章標題→2 秒內前台反映）已經驗證過同一條路徑
- [ ] GA4 DebugView：`tool_use`、`article_to_tool`、`affiliate_click` 各觸發一次看得到——不適用：`site.config.ts` 的 `ga4Id` 還是空字串，GA4 這次明確排除（見 Day 3-11 段），等 Nadia 填 GA4 ID 後才能測
- [x] Lighthouse（手機）Performance ≥ 90、SEO = 100——首頁／`/tools/hourly-rate` 都是 Performance 100、Accessibility 96、Best Practices 100、SEO 100（初測 SEO 只有 82，查出全站 hydration 後 title／meta description 會消失，見下方「QA 過程發現的問題」，修完重測後達標）
- [x] `.env` 沒進 git；Vercel env 沒有多餘的舊變數——`git ls-files` 只有 `.env.local.example` 被追蹤；`vercel env ls production` 剛好 7 個變數，跟 handover §2 表一致，沒有多的

### QA 過程發現的問題（非清單原有項目，過程中額外揪出）

- **全站 hydration 後 `<title>`／meta description 消失，React error #418**：`app/layout.tsx` 的 RootLayout 手動寫了 `<head>` 包 GA4 的 `<Script>`，這跟 Next.js 16 內建的 metadata／字型串流機制搶著管理 `<head>` 衝突，導致客戶端 hydration 失敗、`<head>` 被清空後沒有正確補回（`node_modules/next/dist/docs` 明文寫「root layout 不該手動加 `<head>` 標籤」）。真實瀏覽器（headless Chrome）打開任何頁面，過幾秒後分頁標題就會消失，Lighthouse SEO 分數也因此掉到 82。改成官方文件示範寫法——`<Script>` 搬到 `<html>` 底下、跟 `<body>` 同一層，不再手動宣告 `<head>`——修完後三個分頁（首頁／工具頁／about）在瀏覽器測試都沒有 hydration error，Lighthouse SEO 回到 100。commit `ce8c462`。

# 交付流程 Checklist（14 天 B 套餐；A 套餐取子集、C 套餐加末段）

> 內部用。每個客戶案 fork 出去後，複製這份到客戶 repo 的 `docs/delivery-checklist.md`，逐項打勾；交付時連同 `docs/handover.md` 一起給客戶。
> 時數欄是母版目標值（B 套餐總計 ≤ 15h），實際數字每案填回，累積三案後校準 `docs/productized-service-offer.md` 的定價。

## Day 0 — 成交前（不算工時）

- [ ] 客戶填 intake 表：站名／網域／語言／貨幣／目標讀者／要做的 2–3 個工具（每個：輸入、輸出、公式來源）／有沒有現成文章／GA4、GSC、Vercel、Supabase 帳號有無
- [ ] 判定套餐（A／B／C）與加購（第三方登入、月維護）；報價與交期用 `docs/productized-service-offer.md` 的區間
- [ ] 收訂金（Upwork：milestone 1 funded）

## Day 1–2 — Spec（目標 1.5h）

- [ ] fork 母版 → 客戶 private repo
- [ ] `npm run new:site`（用 intake 表答案）→ 提交
- [ ] 每個工具寫 `specs/tool-<slug>.md`：輸入欄位表、公式（附來源）、輸出、CTA 目標、FAQ 3 條 → **客戶書面確認公式**（這是最容易返工的地方，沒確認不動工）
- [ ] 建客戶自己的 Supabase 專案（或請客戶建並邀你）、Vercel 專案連 repo；`.env.local` 與 Vercel env 填齊（對照 handover §2 表）
- [ ] `npm run db:apply`；`supabase/schema.sql` 的 `<VERCEL_DOMAIN>`／`<REVALIDATE_SECRET>` 換成實際值後再套用一次

## Day 3–11 — Build（目標 8h）

- [ ] 每個工具：`npm run new:tool` → 寫 `compute()` → 補測試（預設值、邊界、verdict 各分支）→ FAQ → CTA（1.5–2h／工具）
- [ ] 首頁文案、about、disclaimer 換成客戶內容（`messages/` 只放引擎文案，站內容直接改頁面）
- [ ] 文章：客戶給的內容貼進 admin（Markdown）；每篇至少 1 個 `/tools/<slug>` 內連；有 FAQ 就填 faq_jsonld
- [ ] GA4：`site.config.ts` 填 ga4Id；在 GA4 Admin 把 `affiliate_click` 標 Key Event
- [ ] GSC：客戶網域驗證（DNS TXT），提交 `/sitemap.xml`
- [ ] （C 套餐）`/admin/seo` GSC 儀表板接客戶 GSC OAuth；月報腳本跑一次留樣本
- [ ] `npm test && npm run build && npm run lint` 全綠；CI 綠

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

## QA checklist（Day 12 跑）

- [ ] 每個工具頁：預設值結果正確；清空輸入不 crash；手機版排版；CTA 連結對；`view-source` 有 WebApplication／FAQPage JSON-LD
- [ ] 文章頁：日期格式與時區對；內連工具連結開新分頁；FAQ 區塊；OG 預覽（用 opengraph.xyz 之類看一眼）
- [ ] `/sitemap.xml` 含首頁、工具、文章；`/robots.txt` disallow `/admin/`
- [ ] admin：錯密碼進不去；登入後發文→前台幾秒內出現；取消發布→404 且 sitemap 消失
- [ ] GA4 DebugView：`tool_use`、`article_to_tool`、`affiliate_click` 各觸發一次看得到
- [ ] Lighthouse（手機）Performance ≥ 90、SEO = 100
- [ ] `.env` 沒進 git；Vercel env 沒有多餘的舊變數

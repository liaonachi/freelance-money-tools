# 交付流程 Checklist（14 天 B 套餐；A 套餐取子集、C 套餐加末段）

> 內部用。每個客戶案 fork 出去後，複製這份到客戶 repo 的 `docs/delivery-checklist.md`，逐項打勾；交付時連同 `docs/handover.md` 一起給客戶。
> 時數欄是母版目標值（B 套餐總計 ≤ 15h），實際數字每案填回，累積三案後校準 `docs/productized-service-offer.md` 的定價。

**實際工時（本案，2026-08-19，Code CLI 執行）**：Day 1–2 約 40 分鐘（含建 Supabase 專案、套 schema、寫 `specs/tools.md`）；Day 3–11（本段，僅工具＋文案＋文章，不含 Vercel／GA4／GSC）對話總長約 33 分鐘（14:08–14:41），其中包含一段排查「是否有別的 session 同時改這個 repo」的誤判耗時（約 10 分鐘，含發訊息給 peer session 確認、`lsof` 排查）跟母版那邊一個沒完成任何事、燒了 23 分鐘的失敗背景 fork（該 23 分鐘不算在這段裡，是母版 repo 那邊單獨的時間）。**這是 AI agent 執行時間，不是人力工時**，跟母版「目標 Xh」的人力估算不是同一個量級，不能直接拿來校準定價——保留數字只是記錄「這次跑下來花了多久」，真正拿來校準報價的應該是 Nadia 自己盯場/審核的時間。

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
- [x] 文章：客戶給的內容貼進 admin（Markdown）；每篇至少 1 個 `/tools/<slug>` 內連；有 FAQ 就填 faq_jsonld——三篇皆 `status=published`，用 service role 直接寫進 `blog_posts`（不是透過 admin UI 手動貼，效果相同）
- [ ] GA4：`site.config.ts` 填 ga4Id；在 GA4 Admin 把 `affiliate_click` 標 Key Event——**本次明確排除，留到後續 session**
- [ ] GSC：客戶網域驗證（DNS TXT），提交 `/sitemap.xml`——**本次明確排除，留到後續 session**（且還沒有正式網域，目前只有 vercel.app）
- [ ] （C 套餐）不適用（B 套餐）
- [x] `npm test && npm run build && npm run lint` 全綠（含 `npx tsc --noEmit`）；push 後待確認 CI 綠燈

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

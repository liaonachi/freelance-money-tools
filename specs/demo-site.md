# demo-site — Freelance Money Tools（MVP 7）

> 建立：2026-08-18（Cowork）。選題決定：A（Nadia 2026-08-18）
> 對應藍圖：MVP 7。**這是母版第一次真實交付**——照 `docs/delivery-checklist.md` 逐項打勾、記實際工時，交付物是一個公開的 vercel.app 網址 + 公開的 GitHub repo，給 Upwork／Contra 當作品。
> 前置：`specs/admin-faq-field.md` 先做完（demo 文章要用 FAQ）。

## 產出物

| 項目 | 值 |
|---|---|
| 站名 | Freelance Money Tools |
| 一句話 | Free calculators for freelancers: hourly rate, late fees, tax set-aside. |
| 本機路徑 | `~/Documents/Claude/Projects/freelance-money-tools/` |
| GitHub | `liaonachi/freelance-money-tools`，**public** |
| Vercel | 專案名 `freelance-money-tools` → `https://freelance-money-tools.vercel.app`（Nadia 自己的 Vercel 帳號） |
| Supabase | 獨立帳號 `liaonachi+seodemo@gmail.com`，專案 `seo-demo`，region ap-northeast-1；用 PAT 走專案級 `.mcp.json`（方式二，見下） |
| locale / currency / timezone | en / USD / America/New_York |
| 主色 | `#0f766e`（teal，跟母版預設藍區隔，證明主題色真的會換） |
| GA4 | 選填：Nadia 若建了 GA4 property 就填 `ga4Id`，沒有先空著（`site.config.ts` 空字串＝不載入） |

## 步驟（照 delivery-checklist 的 Day 分段，記每段實際工時）

### Day 1–2：建 repo + Supabase + Spec

1. **從母版產生 demo repo**（不用 GitHub template 功能，母版是 private）：
   ```bash
   cd ~/Documents/Claude/Projects
   git clone git@github.com:liaonachi/seo-tool-site-starter.git freelance-money-tools
   cd freelance-money-tools && rm -rf .git && git init -b main
   git remote add upstream git@github.com:liaonachi/seo-tool-site-starter.git   # 之後 cherry-pick 母版更新用
   gh repo create freelance-money-tools --public --source=. --remote=origin --description "Free calculators for freelancers: hourly rate, late fees, tax set-aside. Built with Next.js + Supabase."
   ```
   刪掉母版專屬檔案：`specs/`（整個換成 demo 自己的 `specs/`：blueprint 一頁 + 本檔副本 + SESSION-HANDOFF）、`docs/productized-service-offer.md`、`docs/upstream-changelog.md`（客戶 repo 不需要）；`CLAUDE.md` 改寫成 demo 站版本（專案目的、上游母版連結、其餘規則沿用）。
2. `npm run new:site -- --name "Freelance Money Tools" --url https://freelance-money-tools.vercel.app --locale en --currency USD --timezone America/New_York --primary "#0f766e" --force`（參數名以腳本實際為準）；nav：Tools / Blog；footer：About / Disclaimer。
3. **Supabase**：Nadia 提供 `liaonachi+seodemo` 帳號的 PAT → 寫 `.mcp.json`（已 gitignore）→ 用 Supabase MCP 建專案 `seo-demo`（ap-northeast-1）→ 拿 URL／anon／service role／DB URL 填 `.env.local` → 產 `REVALIDATE_SECRET`、`ADMIN_PASSWORD`、`ADMIN_SESSION_SECRET`（`openssl rand -hex 32`）→ `supabase/schema.sql` 的 `<VERCEL_DOMAIN>`／`<REVALIDATE_SECRET>` 換實際值 → `npm run db:apply`（或用 MCP `apply_migration`）→ 確認 `blog_posts` 表與 trigger 存在。若 Nadia 選方式一（手動建），跳過 MCP 那步，其餘相同。
4. 三個工具的 spec 各寫一段在 demo repo 的 `specs/tools.md`（公式與來源），照下方定義。

### Day 3–11：Build

**工具 1 `hourly-rate` — Freelance Hourly Rate Calculator**
- inputs：`targetIncome`（number, USD, default 80000）、`billableHoursPerWeek`（default 25, min 1, max 80）、`weeksOffPerYear`（default 6, min 0, max 30）、`annualExpenses`（USD, default 8000）、`taxSetAsidePct`（percent, default 25, min 0, max 60）
- compute：`billableHours = billableHoursPerWeek × (52 − weeksOff)`；`grossNeeded = (targetIncome + annualExpenses) / (1 − tax/100)`；`hourlyRate = grossNeeded / billableHours`；`dayRate = hourlyRate × 8`
- outputs：stat hourlyRate（currency, 0 位）、stat dayRate、stat billableHours（number）、stat grossNeeded；note「Estimates only. Adjust tax % to your situation.」
- cta → `/tools/tax-set-aside`「Not sure what % to set aside for tax? →」
- faq 3 條（rate 為什麼比受雇時薪高很多／billable hours 抓多少合理／要不要含退休金）

**工具 2 `late-fee` — Invoice Late Fee Calculator**（覆蓋 `select` 欄位）
- inputs：`invoiceAmount`（USD, default 2500）、`daysLate`（default 30, min 0）、`rateType`（**select**：`monthly` = "% per month"（default）、`annual` = "% per year"）、`ratePct`（default 1.5, step 0.1）、`flatFee`（USD, default 0）
- compute：`dailyRate = rateType === 'monthly' ? ratePct/100/30 : ratePct/100/365`；`interest = invoiceAmount × dailyRate × daysLate`；`total = invoiceAmount + interest + flatFee`；`effectiveAnnualPct = dailyRate × 365 × 100`
- outputs：stat interest、stat total、stat effectiveAnnualPct（percent, 1 位）；note「Check your contract and local law for maximum allowed rates. Not legal advice.」
- cta → `/tools/hourly-rate`
- faq 3 條

**工具 3 `tax-set-aside` — Self-Employment Tax Set-Aside Calculator**（覆蓋 `toggle` + `table`）
- inputs：`monthlyIncome`（USD, default 6000）、`federalPct`（default 12, min 0, max 37, hint "Your marginal federal bracket"）、`statePct`（default 5, min 0, max 15）、`includeSelfEmploymentTax`（**toggle**, default true, label "Include self-employment tax (15.3%)"）
- compute：`seTaxable = monthlyIncome × 0.9235`；`seTax = includeSE ? seTaxable × 0.153 : 0`；`federal = monthlyIncome × federalPct/100`；`state = monthlyIncome × statePct/100`；`total = seTax + federal + state`；`totalPct = total / monthlyIncome × 100`；`rows = [{item:'Self-employment tax', amount: seTax}, {item:'Federal income tax (est.)', amount: federal}, {item:'State income tax (est.)', amount: state}, {item:'Total to set aside', amount: total}]`
- outputs：stat total（currency）、stat totalPct（percent）、**table** rows（columns item/text、amount/currency）；verdict：`totalPct > 40 → 'bad'`「Over 40% — double-check your brackets」、`< 20 → 'neutral'`「Looks low — did you include self-employment tax?」、else `'good'`「Reasonable range for most US freelancers」；note「Simplified estimate for US sole proprietors. Not tax advice.」
- cta → `/tools/hourly-rate`
- faq 3 條
- **順便補 ToolRenderer 測試**：select 與 toggle 的互動測試（tool-engine Result 待辦 8）在這裡用 late-fee／tax-set-aside 補上——寫在**母版**（先在母版加測試 → commit → demo cherry-pick），不要只留在 demo。

**文章 3 篇**（英文，各 800–1,200 字，Markdown，每篇 FAQ 3 條、至少 1 個 `/tools/<slug>` 內連、結尾 CTA）：
1. `how-to-set-your-freelance-hourly-rate` — 公式拆解 + 範例算一次 + 常見錯誤 → 連 hourly-rate
2. `late-payment-fees-for-freelancers` — 合約條款怎麼寫、常見費率（1–1.5%/月）、怎麼算 → 連 late-fee
3. `how-much-should-freelancers-set-aside-for-taxes` — SE tax 是什麼、季繳、粗估法 → 連 tax-set-aside
內容由 Code CLI 起草，**發布前 Cowork 會 review 文字**（Result 段附三篇 slug，Cowork 直接看正式站）。數字類陳述要保守並加「estimate／check current IRS figures」，不要寫死年度稅率表。

**首頁／about／disclaimer**：英文文案換成 demo 內容；disclaimer 加「not financial, tax, or legal advice」；about 一段介紹「built on the SEO Tool Site Starter by Nadia」+ 連到你的 Upwork／聯絡方式（Nadia 提供，先留 `{{CONTACT}}`）。

**Vercel**：`vercel link` → 建專案 `freelance-money-tools` 連 GitHub repo → env 全部填（對照 `.env.local.example`）→ production deploy → 確認 `https://freelance-money-tools.vercel.app` 正常。Supabase webhook 的 `<VERCEL_DOMAIN>` 若在建 Vercel 前先套了 schema，這時再套一次。

**GSC**：URL-prefix property `https://freelance-money-tools.vercel.app/`，用 HTML 檔驗證（放 `public/google*.html`）；提交 sitemap。GA4 若有 property 就填 `ga4Id` 並在 GA4 標 `affiliate_click` 為 key event。

### Day 12–13：Review

- 跑 `docs/delivery-checklist.md` 的 QA checklist 逐項（三個工具預設值結果、清空輸入、手機版、JSON-LD、sitemap、admin 發文→前台出現、Lighthouse 手機 Performance ≥ 90 / SEO 100）
- Cowork review：三篇文章文字、三個工具文案、about 頁

### Day 14：Handover

- 填 `docs/handover.md`（這次「客戶」是 Nadia 自己，照填，當範本）
- 截圖 5 張放 demo repo `docs/screenshots/`：首頁、一個工具頁（含結果）、文章頁、admin 文章列表、GA4/GSC 其一——Upwork 作品集用
- **回填母版**：`docs/upstream-changelog.md`；delivery-checklist 頂端填實際工時（Day 1–2／3–11／12–13／14 各段 + 總計）；SESSION-HANDOFF 記「第一次真實交付的時數 vs 目標 15h」

## 不要做的

- 不買網域（先 vercel.app）；不做 email 訂閱；不做第 4 個工具
- 不在 demo repo 裡改引擎——引擎的改動一律先進母版再 cherry-pick

## 驗收

1. `https://freelance-money-tools.vercel.app` 可用：3 工具 + 3 文章 + about/disclaimer；`<html lang="en">`；主色是 teal；sitemap 含全部頁面
2. demo repo public、CI 綠；母版有 select/toggle 測試 commit
3. Result（寫在 demo repo `specs/demo-site.md` 並把摘要回填母版本檔）：實際工時分段、遇到的坑（尤其「母版→客戶 repo」流程哪裡卡）、三篇文章 slug、截圖路徑、Vercel／Supabase 專案 ID
4. 母版 `specs/blueprint.md` MVP 7 打勾；兩邊 SESSION-HANDOFF 更新

## 需要 Nadia 提供（動工前）

- `liaonachi+seodemo` Supabase 帳號的 PAT（方式二）或已建好專案的 URL／keys（方式一）——**交給 Code CLI，不要貼在 Cowork 對話**
- Vercel 帳號已登入 CLI（`vercel whoami`）
- 聯絡方式／Upwork profile 連結（about 頁用；可後補）
- GA4 property（選填）

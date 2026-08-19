# tools — 三個工具的公式與來源

> Day 1–2 第 4 步。公式定義來源見母版 `specs/demo-site.md`「Day 3–11：Build」段落；這裡補「為什麼這樣算」跟參考來源，給 Day 3 寫 `tools/<slug>.config.ts` 時直接照抄，也給文章引用。三個工具都是「粗估／教育用途」，不是精確稅務或法律建議——這件事會在每個工具的 note 跟 disclaimer 頁重複強調。

## 1. `hourly-rate` — Freelance Hourly Rate Calculator

**核心問題**：freelancer 常見誤區是直接拿「受雇年薪 ÷ 全年工時」當時薪報價，忽略了（a）freelancer 沒有 100% 的工時是「可計費」的（要花時間找案源、行政、學習），（b）freelancer 要自己吸收原本雇主負擔的部分（自雇稅、保險、退休金、設備），（c）沒有固定的帶薪休假。這個工具把這三件事都算進去。

**inputs → compute**：
- `billableHours = billableHoursPerWeek × (52 − weeksOffPerYear)`
  - 來源：標準「可計費工時」估算法——業界常見經驗值是 freelancer 一週工作 40 小時裡，實際「可計費」的只有 20–30 小時（其餘花在業務開發、行政、學習），這也是 `billableHoursPerWeek` 預設值定在 25 的原因。`weeksOffPerYear` 預設 6（约等於 2 週假期 + 4 週彈性，比全職雇員的 10–15 天有薪假保守，因為 freelancer 休假沒有收入）。
- `grossNeeded = (targetIncome + annualExpenses) / (1 − taxSetAsidePct/100)`
  - 邏輯：先把「稅後想拿到的淨收入」與「營運費用」加總，再除以 `(1 − 稅率)` 反推「稅前要開出的發票總額」——這是标准的「gross-up」算法，跟 `tax-set-aside` 工具用同一個概念（互相呼應，可以互連）。
  - `taxSetAsidePct` 預設 25%：介於「只算聯邦所得稅單身者常見邊際稅率」與「聯邦+州+自雇稅」的粗估中間值，具體數字請使用者自己在 `tax-set-aside` 工具算一次再回填。
- `hourlyRate = grossNeeded / billableHours`
- `dayRate = hourlyRate × 8`（8 小時工作日換算，US freelance 市場最常見的日費率基準）

**outputs**：stat `hourlyRate`（currency, 0 位）、stat `dayRate`、stat `billableHours`（number）、stat `grossNeeded`；note「Estimates only. Adjust tax % to your situation.」

**cta**：`/tools/tax-set-aside`「Not sure what % to set aside for tax? →」

**faq（3 條，草案，Day 3 定稿）**：
1. Why is my freelance rate so much higher than my old salary ÷ hours? — 因為要蓋掉不可計費工時、自付稅金與福利，這些原本都是雇主吸收的成本。
2. How many billable hours per week is realistic? — 大多數全職 freelancer 落在 20–30 小時／週；新手或案源不穩定時建議抓保守值（20 以下）。
3. Should I include retirement savings in annual expenses? — 建議算進去（例如 SEP-IRA 提撥），這個工具的 `annualExpenses` 欄位可以直接拿來放退休金提撥目標。

## 2. `late-fee` — Invoice Late Fee Calculator

**核心問題**：freelancer 合約裡常見「逾期利息」條款寫的是月利率或年利率，但客戶實際逾期天數要換算成利息金額時很容易算錯，這個工具做單利（simple interest）逐日累計。

**inputs → compute**：
- `dailyRate = rateType === 'monthly' ? ratePct/100/30 : ratePct/100/365`
  - 來源：月利率換日利率用 30 天／月（曆法近似值，US 商業合約常見慣例，不用實際天數避免月份長度造成的複雜度）；年利率換日利率用 365 天。
- `interest = invoiceAmount × dailyRate × daysLate`（單利，不複利——逾期利息條款絕大多數是單利，複利在多數州對消費/商業合約有額外法律限制，這個工具刻意只做單利避免誤導）
- `total = invoiceAmount + interest + flatFee`
- `effectiveAnnualPct = dailyRate × 365 × 100`（把使用者輸入的利率統一換算成「有效年利率」，方便跟其他合約條款比較，也方便對照「常見上限」的說法）

**inputs 預設值來源**：`ratePct` 預設 1.5%／月——這是美國 freelance／小型企業發票最常見的逾期利率（等於年化 18%），來源是業界慣例（Invoice/契約範本、bookkeeping 社群常見引用值），不是任何單一法規規定的數字。**note 裡明確提醒使用者要對照自己合約與所在州法規**，因為部分州對「未約定逾期利率的法定上限」或「利率上限（usury law）」有規定，各州不同，這個工具不做法規判斷。

**outputs**：stat `interest`、stat `total`、stat `effectiveAnnualPct`（percent, 1 位）；note「Check your contract and local law for maximum allowed rates. Not legal advice.」

**cta**：`/tools/hourly-rate`

**faq（3 條，草案）**：
1. What late fee rate should I put in my contract? — 1–1.5%／月（年化 12–18%）是常見範圍，但要先確認你所在州對逾期利率有沒有上限。
2. Can I charge both a flat fee and interest? — 可以，只要合約裡有明確約定；這個工具的 `flatFee` 欄位可以跟利率同時算。
3. Is this compound or simple interest? — 單利（simple interest），逐日按本金計算，不會利滾利。

## 3. `tax-set-aside` — Self-Employment Tax Set-Aside Calculator

**核心問題**：US freelancer／sole proprietor 沒有雇主幫忙代扣代繳所得稅與社會保險/健保稅（FICA），必須自己每季預繳（quarterly estimated tax），這個工具算「這個月收入要留多少錢繳稅」。

**inputs → compute**：
- `seTaxable = monthlyIncome × 0.9235`
  - 來源：IRS 規定自雇稅（SE tax）的計稅基礎是淨自雇所得的 92.35%（等於先扣除「雇主端」那一半 FICA 稅的概念），這是 IRS Schedule SE 的標準算法，不是這個工具自創的估算。
- `seTax = includeSelfEmploymentTax ? seTaxable × 0.153 : 0`
  - `0.153` = 15.3%，是 2024–2026 年 SE tax 稅率（Social Security 12.4% + Medicare 2.9%），這是目前有效稅率；工具的 note 會提醒使用者「check current IRS figures」，不寫死「這個稅率永遠不變」的說法，避免年度稅率若調整時文案跟著過時（目前 SE tax 稅率結構已維持多年不變，但 Social Security 的應稅所得上限每年會調整，這個工具的簡化版本沒有處理應稅上限，見下方「不做的」）。
- `federal = monthlyIncome × federalPct/100`、`state = monthlyIncome × statePct/100`——使用者自己輸入邊際稅率估算值（`federalPct` hint 提示「你的聯邦邊際稅率級距」），工具不內建任何年度稅率表（demo-site.md 已明確要求不要寫死年度稅率表，避免每年都要更新)。
- `total = seTax + federal + state`；`totalPct = total / monthlyIncome × 100`

**outputs**：stat `total`（currency）、stat `totalPct`（percent）、table `rows`（item/amount 兩欄）；verdict：`totalPct > 40 → 'bad'`「Over 40% — double-check your brackets」、`< 20 → 'neutral'`「Looks low — did you include self-employment tax?」、else `'good'`「Reasonable range for most US freelancers」——40%/20% 這兩個門檻是「US freelancer 常見總稅負落在 25–35% 這個區間」的經驗值（SE tax 15.3% + 聯邦邊際稅率 12–24% 是最常見組合），超過 40% 通常代表稅率級距抓太高或重複計算，低於 20% 通常代表漏算 SE tax。

**note**：「Simplified estimate for US sole proprietors. Not tax advice.」

**cta**：`/tools/hourly-rate`

**faq（3 條，草案）**：
1. What is self-employment tax? — Social Security + Medicare 稅（15.3%），受雇者這筆稅由雇主與員工各付一半，freelancer 兩邊都要自己付。
2. How often do I need to pay estimated taxes? — 美國 IRS 通常要求按季（quarterly）預繳，這個工具算的是「每月」金額，方便你按月存錢、季繳時領出來用。
3. Does this account for tax brackets or deductions? — 不會，這是簡化的粗估工具，`federalPct`／`statePct` 要你自己填當前邊際稅率；實際申報請找報稅軟體或會計師。

## 不做的（跟母版 demo-site.md 一致）

- 不寫死任何年度稅率表（federal bracket、SE tax 應稅所得上限），全部由使用者輸入或用固定不常變的稅率結構（如 92.35%、15.3%）
- 不做州別法規判斷（late fee 上限、州稅率表）
- 三個工具的 `compute()` 實作與精確測試斷言留到 Day 3 `npm run new:tool` 之後補齊；本檔只鎖公式與來源，不是最終程式碼

## Result

- 2026-08-19：三個工具公式與來源寫定（本檔），對應母版 `specs/demo-site.md` Day 1–2 第 4 步。尚未經過 Nadia 書面確認（demo-site.md 要求的「客戶書面確認公式」在這個案子等同於 Nadia 自己過目）——下次對話請先過一眼這份 spec 再進 Day 3 `npm run new:tool`。

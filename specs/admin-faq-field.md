# admin-faq-field — 後台文章表單加 FAQ 欄位（MVP 7 前置小修）

> 建立：2026-08-18（Cowork）
> 起因：MVP 6 核對發現 `blog_posts.faq_jsonld` 有欄位、文章頁會 render FAQPage JSON-LD，但 `components/admin/PostForm.tsx` 沒有 UI，只能改 DB。demo 站的文章要用 FAQ rich result，先補上。估 1 小時。

## 要做的

1. `components/admin/PostForm.tsx`：在「內容」下方加「FAQ（選填）」區塊——動態列，每列 question（input）+ answer（textarea 2 行）+ 刪除鈕；底部「＋ 新增一題」。用 hidden input `faq_jsonld` 存 JSON 字串（client 端 `JSON.stringify` 陣列，空陣列存 `''`）。編輯既有文章時從 `initialValues.faq_jsonld` 帶入。
2. `app/admin/posts/actions.ts` 的 `createPost`／`updatePost`：解析 `faq_jsonld`（空字串→`null`；解析失敗→`null` 並忽略，不要 500）；過濾掉 question 或 answer 為空的列；存進 `faq_jsonld`。
3. `lib/faq.ts` 純函數 `parseFaqField(raw: string | null): FaqItem[] | null`，給 action 用並可測試（合法 JSON、空字串、壞 JSON、過濾空列）。
4. `docs/handover.md` §3 把「optional FAQ」那句改回正面描述（現在真的有了）；`messages/` 補對應文案（zh-TW／en 兩邊 key 一致，測試會擋）。

## 不要做的

- 不做 Markdown 內嵌 FAQ 語法解析；不做拖曳排序

## 驗收

- tsc／test（新增 `__tests__/faq.test.ts`）／build／lint 全綠；手動：新增文章填 2 題 FAQ → 前台 view-source 有 FAQPage JSON-LD → 編輯頁能看到並修改 → 清空後存檔 `faq_jsonld` 為 null
- 本檔末尾追加 `## Result`；SESSION-HANDOFF 待辦 1 關閉；`docs/upstream-changelog.md` 記一筆（客戶站建議：選跟）

## Result

- `lib/faq.ts`：`parseFaqField(raw)` 純函數——`null`／空字串→`null`；壞 JSON→`null`（不丟例外）；非陣列→`null`；過濾掉 question 或 answer 為空（含全空白）的列；過濾後空陣列也回 `null`。`__tests__/faq.test.ts` 7 個案例全過。
- `components/admin/PostForm.tsx`：內容欄位下方加「FAQ（選填）」區塊，動態列（question input + answer textarea 2 行 + 刪除鈕）、底部「＋ 新增一題」；`faqItems` state 初始值讀 `initialValues?.faq_jsonld`；hidden input `name="faq_jsonld"`，有資料時存 `JSON.stringify(faqItems)`，空陣列存 `''`。這個區塊的文案（heading／按鈕／label／placeholder）用 `t()`，是這個表單目前唯一走 i18n 的部分（其餘欄位沿用既有的寫死中文，不在這次範圍內一併修）。
- `app/admin/posts/actions.ts`：`createPost`／`updatePost` 都改用 `parseFaqField(formData.get('faq_jsonld'))` 寫入 `faq_jsonld`（原本 `createPost` 是寫死 `null`，`updatePost` 完全沒處理這個欄位）。
- `messages/zh-TW.ts`／`messages/en.ts`：各補 7 個 `admin.faq*` key，`__tests__/messages.test.ts` 的 key 集合對等測試照過。
- `docs/handover.md` §3：FAQ 那句改回正面描述（有 UI、會 render FAQPage 結構化資料），拿掉「no admin UI yet」。
- 手動驗收：`npm run dev` 起本機（無 Supabase env，`/admin` 是唯讀 demo 模式，仍可操作表單 UI）確認新增/刪除 FAQ 列、清空後 hidden input 變回 `''`；因為母版沒接 DB，「發布後 view-source 看 JSON-LD」這步留給 demo 站（`freelance-money-tools`）實際發文章時驗證。
- 驗收：`npx tsc --noEmit` 0 errors、`npm test` 102 passed（新增 12：`faq.test.ts` 7 + `should-skip-prompt.test.ts` 5，見下方 `scripts/new-site.ts` 修正的 Result）、`npm run build` 成功、`npm run lint` 0 errors（3 個既有 warning 與本次改動無關）。
- commit：見對話回報的 hash（跟 `scripts/new-site.ts` 非互動修正、checklist/CLAUDE.md 補坑同一個 commit）。

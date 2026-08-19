# 怎麼加一個新工具

母版的工具是「設定驅動」的：新工具 = 一份 `tools/<slug>.config.ts` + `tools/index.ts` 加一行，不用寫元件。

## 優先用 `npm run new:tool`

```bash
npm run new:tool
```

問答式輸入 slug／name／description／category，再逐一輸入 inputs（key／label／type／default，number 還會問 min/max/step/unit，select 會問 options）。留空 key 結束輸入。跑完會自動：

1. 產出 `tools/<slug>.config.ts`（`compute` 先放一個 `placeholder` 佔位，`// TODO` 標好要補公式）
2. 產出 `__tests__/tools/<slug>.test.ts`（先測 `compute(defaults)` 不丟例外，斷言留 TODO）
3. 改寫 `tools/index.ts`，加 import 跟 registry 項目（用 `// @new-tool:imports` / `// @new-tool:registry` 兩個錨點註解插入，重複跑同一個 slug 不會插兩次）

非互動模式（CI／測試用）：

```bash
npm run new:tool -- --json '{"slug":"bmi","name":"BMI Calculator","description":"...","inputs":[...]}'
```

**公式一定要人寫**——`new:tool` 不會、也不該幫你猜計算邏輯，問答只收集欄位定義，`compute` 產出後永遠是個佔位 TODO。跑完之後：

1. 編輯 `tools/<slug>.config.ts` 的 `compute`，在 `outputs` 補 `verdict`／`table`（不只是佔位的 `stat`）
2. 補 `__tests__/tools/<slug>.test.ts` 的實際斷言（預設值結果、邊界值、`verdict` 三個分支都要測）
3. `npx tsc --noEmit && npm test && npm run build` 全過

## 手動流程（`new:tool` 表達不了的情況，或想照抄範本）

1. **複製範本**

   ```bash
   cp tools/_template.config.ts tools/<slug>.config.ts
   ```

   `_template.config.ts` 帶完整註解，說明每個欄位怎麼填。`<slug>` 用 kebab-case（例如 `unit-converter`）。

2. **改內容**：至少填 `slug`／`name`／`description`／`inputs`／`compute`／`outputs`。`compute` 必須是純函數，對任何輸入（含邊界值、0）都不能丟例外。

3. **註冊進 registry**：編輯 `tools/index.ts`，在 `// @new-tool:imports` 前加 import、`// @new-tool:registry` 前加陣列項目。

4. **寫 compute 的測試**：`__tests__/tools/<slug>.test.ts`。

5. **驗收**：`npx tsc --noEmit && npm test && npm run build`（確認 `/tools/<slug>` 有被靜態產出）。

## 注意事項

- **universal module 規則**：`tools/*.config.ts` 跟 `tools/index.ts` 會同時被打進 server bundle（`app/tools/[slug]/page.tsx` 拿去產 metadata/JSON-LD）跟 client bundle（`ToolRenderer` 拿去渲染）。config 檔案**不能** import `next/headers`、`@/lib/supabase-server`、`fs` 之類的 server-only 依賴，否則 client build 會炸。`site.config.ts` 也是同一條規則。
- **`registry` 啟動時會驗證全部 config**：`tools/index.ts` 在 module 載入時跑一次 `validateToolConfig`，任何一個工具設定有問題整個 build 都會失敗——這是刻意的，寧可 build 失敗也不要壞掉的工具上線。`new:tool` 產出的骨架本身一定會通過驗證（`placeholder` stat 對得上 `compute` 回傳）。
- **`customRenderer` 逃生口**：config 表達不了的複雜工具（例如要吃資料表、要有多步驟精靈）才用；用了就等於自己重新實作整個工具頁，包括自己標 `'use client'`、自己呼叫 GA4 的 `trackToolUse`——引擎（`ToolRenderer`）完全不介入。用到這個逃生口時，順手在對應的 spec 記一筆「引擎缺什麼」。

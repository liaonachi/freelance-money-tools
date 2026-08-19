import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// 新工具範本。使用方式：
//   cp tools/_template.config.ts tools/<slug>.config.ts
//   改下面的內容，再到 tools/index.ts 的 TOOLS 陣列加一行 import + 註冊
//   （不要直接改這個檔案——它不進 registry，不會被驗證，也不會上線）
//
// 【universal module 規則】這個檔案跟 tools/index.ts 會同時被打進：
//   1. server bundle（app/tools/[slug]/page.tsx 用來產 metadata / JSON-LD / generateStaticParams）
//   2. client bundle（components/tools/ToolRenderer.tsx 用來拿 config 渲染互動介面）
// 所以這個檔案「不能」import 任何 server-only 依賴，例如 next/headers、
// @/lib/supabase-server、fs 之類——會在 client build 直接炸掉。
// config 只能是純資料 + 純函數（compute 本身也必須是無副作用的純函數，可以單元測試）。

function compute(values: Values): Result {
  // 從 values 讀輸入（key 對應 inputs[].key），算出要顯示的所有值，
  // 回傳一個 Result：key 對應純量（stat / verdict 用）或 ResultRow[]（table 用）。
  // 範例：
  const exampleInput = Number(values.exampleNumber)
  return {
    exampleOutput: exampleInput * 2,
  }
}

const config: ToolConfig = {
  slug: 'example-tool', // kebab-case，改成實際 slug
  name: '範例工具',
  description: 'H1 下方一句話，也是預設的 meta description。',
  category: 'UtilityApplication', // JSON-LD applicationCategory，可不填

  inputs: [
    {
      key: 'exampleNumber',
      label: '範例輸入',
      type: 'number',
      default: 10,
      min: 0, // 沒給 min 就允許負數，數字類輸入通常都要給 min: 0
      // max, step, unit, hint, span（1 或 2，預設 1）都可選填
    },
    // select 範例：
    // { key: 'exampleSelect', label: '範例下拉', type: 'select', default: 'a',
    //   options: [{ value: 'a', label: '選項 A' }, { value: 'b', label: '選項 B' }] },
    // toggle 範例：
    // { key: 'exampleToggle', label: '範例開關', type: 'toggle', default: false },
  ],

  compute,

  outputs: [
    { type: 'stat', key: 'exampleOutput', label: '範例輸出', format: 'number', decimals: 0 },
    // verdict 範例（result[key] 必須是 'good' | 'bad' | 'neutral' | null）：
    // { type: 'verdict', key: 'verdict', variants: {
    //     good: { label: '結果不錯' }, bad: { label: '結果不好' }, neutral: { label: '普通' } } },
    // table 範例（result[rowsKey] 必須是 ResultRow[]）：
    // { type: 'table', rowsKey: 'rows', columns: [{ key: 'name', label: '名稱', format: 'text' }] },
    { type: 'note', text: '這是一段補充說明文字，會顯示在結果下方。' },
  ],

  // showOutputsWhen: (r) => r.exampleOutput !== null,  // 預設一律顯示

  // cta: {
  //   href: '/tools/another-tool',
  //   label: '看看另一個工具 →',
  //   urgent: (r) => false,
  // },

  // footnote: '一行小字註腳。',
  // faq: [{ question: '常見問題？', answer: '答案。' }],
  // seo: { title: '自訂 title', description: '自訂 description' },

  // customRenderer 逃生口：config 表達不了的複雜工具才用，用了就等於自己重新
  // 實作整個工具頁（含 'use client'、GA4 event），引擎完全不介入。
  // customRenderer: MyCustomComponent,
}

export default config

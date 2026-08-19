import type { Result, ResultRow, ToolConfig, Values } from '@/lib/tool-config'

// 移植自 miles-tools 的「哩程價值計算機」，把「四家航司」改成 config 內寫死的
// 3 個示範 program（名稱／每點估值都是 placeholder，客戶案請替換為真實資料）。
// 涵蓋特性：table 型輸出。

const DEMO_PROGRAMS = [
  { name: 'Program A', perPoint: 0.85 },
  { name: 'Program B', perPoint: 0.6 },
  { name: 'Program C', perPoint: 1.1 },
] as const

function compute(values: Values): Result {
  const points = Number(values.points)

  const rows: ResultRow[] = DEMO_PROGRAMS.map((p) => ({
    program: p.name,
    perPoint: p.perPoint,
    total: Math.round(points * p.perPoint * 100) / 100,
  }))

  return { rows }
}

const config: ToolConfig = {
  slug: 'points-value',
  name: '點數價值計算機',
  description: '輸入點數數量，立即看懂不同計畫換算成台幣大約值多少。',
  category: 'FinanceApplication',
  inputs: [{ key: 'points', label: '點數數量', type: 'number', default: 10000, min: 0 }],
  compute,
  outputs: [
    {
      type: 'table',
      rowsKey: 'rows',
      columns: [
        { key: 'program', label: '計畫', format: 'text' },
        { key: 'perPoint', label: '每點估值', format: 'currency', decimals: 2 },
        { key: 'total', label: '總價值', format: 'currency', decimals: 2 },
      ],
    },
    { type: 'note', text: '示範資料，換算比例僅供參考，客戶案請替換為真實計畫與估值。' },
  ],
}

export default config

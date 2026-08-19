import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// 移植自 miles-tools 的「現金 vs 哩程」，去掉航空公司 select（那是 DB 資料，母版不預帶），
// 改成通用「現金價 / 所需點數 / 現金補貼 / 每點市場估值」四個 number 輸入。
// 涵蓋特性：verdict、函數型 label、showOutputsWhen、動態 CTA。

function compute(values: Values): Result {
  const cashPrice = Number(values.cashPrice)
  const pointsRequired = Number(values.pointsRequired)
  const cashSurcharge = Number(values.cashSurcharge)
  const marketValuePerPoint = Number(values.marketValuePerPoint)

  const actualCostPerPoint = pointsRequired > 0 ? (cashPrice - cashSurcharge) / pointsRequired : 0
  const diffPct =
    marketValuePerPoint > 0 ? ((actualCostPerPoint - marketValuePerPoint) / marketValuePerPoint) * 100 : 0

  const verdict: 'good' | 'bad' | 'neutral' | null =
    pointsRequired <= 0
      ? null
      : Math.abs(diffPct) < 10
      ? 'neutral'
      : actualCostPerPoint > marketValuePerPoint
      ? 'good'
      : 'bad'

  return {
    verdict,
    actualCostPerPoint,
    marketValuePerPoint,
    diffPct,
  }
}

function verdictLabel(prefix: string, r: Result): string {
  const diffPct = typeof r.diffPct === 'number' ? r.diffPct : 0
  return `${prefix} ${Math.abs(diffPct).toFixed(1)}%`
}

const config: ToolConfig = {
  slug: 'cash-vs-points',
  name: '現金 vs 點數比較計算機',
  description: '輸入現金價格與兌換所需點數，立即計算用點數兌換是否划算。',
  category: 'FinanceApplication',
  inputs: [
    { key: 'cashPrice', label: '現金價格', type: 'number', default: 15000, min: 0, unit: '元', span: 1 },
    { key: 'pointsRequired', label: '兌換所需點數', type: 'number', default: 20000, min: 0, span: 1 },
    { key: 'cashSurcharge', label: '現金補貼（稅費等）', type: 'number', default: 3500, min: 0, unit: '元', span: 1 },
    {
      key: 'marketValuePerPoint',
      label: '每點市場估值',
      type: 'number',
      default: 0.85,
      min: 0,
      step: 0.01,
      unit: '元/點',
      span: 1,
    },
  ],
  compute,
  outputs: [
    {
      type: 'verdict',
      key: 'verdict',
      variants: {
        good: { label: (r) => verdictLabel('划算！高於市場估值', r) },
        bad: { label: (r) => verdictLabel('不划算，低於市場估值', r) },
        neutral: { label: '差不多，可以考慮' },
      },
    },
    { type: 'stat', key: 'actualCostPerPoint', label: '每點實際花費', format: 'currency', decimals: 2 },
    { type: 'stat', key: 'marketValuePerPoint', label: '市場估值', format: 'currency', decimals: 2 },
    { type: 'note', text: '示範用比較邏輯，實際門檻與文案請依客戶案調整。' },
  ],
  showOutputsWhen: (r) => r.verdict !== null,
  cta: {
    href: '/tools/points-value',
    label: (r) => (r.verdict === 'bad' ? '不划算？先看看其他方案 →' : '想知道你的點數值多少？→'),
    urgent: (r) => r.verdict === 'bad',
  },
  faq: [
    {
      question: '這個計算機的估值門檻怎麼定義？',
      answer: '每點實際花費跟市場估值相差在 10% 以內視為「差不多」，超過 10% 才判定為划算或不划算，門檻可依產品需求調整。',
    },
  ],
}

export default config

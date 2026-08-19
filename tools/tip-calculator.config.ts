import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// 表達力驗證用的第三個 example：從 tools/_template.config.ts 複製出來，
// 記錄實際花費時間見 specs/tool-engine.md ## Result。

function compute(values: Values): Result {
  const billAmount = Number(values.billAmount)
  const tipPercent = Number(values.tipPercent)
  const splitCount = Math.max(1, Number(values.splitCount))

  const tipAmount = (billAmount * tipPercent) / 100
  const totalAmount = billAmount + tipAmount
  const perPersonAmount = totalAmount / splitCount

  return { tipAmount, totalAmount, perPersonAmount }
}

const config: ToolConfig = {
  slug: 'tip-calculator',
  name: '小費計算機',
  description: '輸入帳單金額與小費比例，立即算出小費與每人應付金額。',
  category: 'UtilityApplication',
  inputs: [
    { key: 'billAmount', label: '帳單金額', type: 'number', default: 1000, min: 0, unit: '元' },
    { key: 'tipPercent', label: '小費比例', type: 'number', default: 15, min: 0, max: 100, unit: '%' },
    { key: 'splitCount', label: '分攤人數', type: 'number', default: 1, min: 1, step: 1 },
  ],
  compute,
  outputs: [
    { type: 'stat', key: 'tipAmount', label: '小費金額', format: 'currency', decimals: 0 },
    { type: 'stat', key: 'totalAmount', label: '總金額', format: 'currency', decimals: 0 },
    { type: 'stat', key: 'perPersonAmount', label: '每人應付', format: 'currency', decimals: 0 },
    { type: 'note', text: '示範用小工具，驗證「新工具 = 一份 config」的表達力與所需時間。' },
  ],
}

export default config

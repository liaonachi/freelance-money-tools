import cashVsPoints from './cash-vs-points.config'
import pointsValue from './points-value.config'
import tipCalculator from './tip-calculator.config'
// @new-tool:imports
import { validateToolConfig, type ToolConfig } from '@/lib/tool-config'

export const TOOLS: ToolConfig[] = [
  cashVsPoints,
  pointsValue,
  tipCalculator,
  // @new-tool:registry
]

// 啟動時（module top-level）跑一次全部 config 的驗證，有錯就 throw——
// 寧可 build 失敗也不要壞的工具上線。
for (const tool of TOOLS) {
  const errors = validateToolConfig(tool)
  if (errors.length > 0) {
    throw new Error(`工具設定 "${tool.slug}" 驗證失敗：\n${errors.join('\n')}`)
  }
}

export function getTool(slug: string): ToolConfig | undefined {
  return TOOLS.find((t) => t.slug === slug)
}

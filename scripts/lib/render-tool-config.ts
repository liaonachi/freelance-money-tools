// 純函數：answers → tools/<slug>.config.ts 檔案內容字串 + registry patch 用的
// import/entry 名稱。同 render-site-config.ts，不 import 任何 side-effect 模組。

export type NewToolInputAnswer =
  | {
      key: string
      label: string
      type: 'number'
      default: number
      min?: number
      max?: number
      step?: number
      unit?: string
    }
  | { key: string; label: string; type: 'select'; default: string; options: { value: string; label: string }[] }
  | { key: string; label: string; type: 'toggle'; default: boolean }

export type NewToolAnswer = {
  slug: string
  name: string
  description: string
  category?: string
  inputs: NewToolInputAnswer[]
}

/** slug（kebab-case）→ camelCase import 名稱，例如 'cash-vs-points' → 'cashVsPoints' */
export function slugToImportName(slug: string): string {
  return slug.replace(/-([a-z0-9])/g, (_match, c: string) => c.toUpperCase())
}

function renderInputLiteral(input: NewToolInputAnswer): string {
  if (input.type === 'number') {
    const parts = [
      `key: ${JSON.stringify(input.key)}`,
      `label: ${JSON.stringify(input.label)}`,
      `type: 'number'`,
      `default: ${JSON.stringify(input.default)}`,
    ]
    if (input.min !== undefined) parts.push(`min: ${JSON.stringify(input.min)}`)
    if (input.max !== undefined) parts.push(`max: ${JSON.stringify(input.max)}`)
    if (input.step !== undefined) parts.push(`step: ${JSON.stringify(input.step)}`)
    if (input.unit) parts.push(`unit: ${JSON.stringify(input.unit)}`)
    return `    { ${parts.join(', ')} },`
  }

  if (input.type === 'select') {
    const options = input.options
      .map((o) => `{ value: ${JSON.stringify(o.value)}, label: ${JSON.stringify(o.label)} }`)
      .join(', ')
    return `    { key: ${JSON.stringify(input.key)}, label: ${JSON.stringify(input.label)}, type: 'select', default: ${JSON.stringify(input.default)}, options: [${options}] },`
  }

  return `    { key: ${JSON.stringify(input.key)}, label: ${JSON.stringify(input.label)}, type: 'toggle', default: ${JSON.stringify(input.default)} },`
}

export function renderToolConfig(answer: NewToolAnswer): string {
  const inputsLiteral = answer.inputs.length > 0 ? answer.inputs.map(renderInputLiteral).join('\n') : '    // TODO: 加輸入欄位'

  return `import type { Result, ToolConfig, Values } from '@/lib/tool-config'

// npm run new:tool 產出的骨架——公式一定要人寫，這裡先放一個 stat 佔位。
// TODO: 在 compute 寫公式、在 outputs 補 verdict/table（參考 tools/_template.config.ts 的註解範例）

function compute(values: Values): Result {
  // TODO: 讀 values（key 對應 inputs[].key），算出要顯示的所有值，不可丟例外
  return {
    placeholder: 0,
  }
}

const config: ToolConfig = {
  slug: ${JSON.stringify(answer.slug)},
  name: ${JSON.stringify(answer.name)},
  description: ${JSON.stringify(answer.description)},
  category: ${JSON.stringify(answer.category ?? 'UtilityApplication')},

  inputs: [
${inputsLiteral}
  ],

  compute,

  outputs: [
    { type: 'stat', key: 'placeholder', label: '結果', format: 'number', decimals: 0 },
    // TODO: 補 verdict/table
  ],
}

export default config
`
}

export function renderRegistryPatch(slug: string): { importLine: string; registryEntry: string } {
  const importName = slugToImportName(slug)
  return {
    importLine: `import ${importName} from './${slug}.config'`,
    registryEntry: importName,
  }
}

export function renderToolTest(slug: string): string {
  const importName = slugToImportName(slug)
  return `import { describe, expect, it } from 'vitest'
import config from '@/tools/${slug}.config'
import { getTool } from '@/tools'

const compute = config.compute!

describe(${JSON.stringify(`${importName} compute`)}, () => {
  it('compute(defaults) 不丟例外', () => {
    const defaults: Record<string, number | string | boolean> = {}
    for (const field of config.inputs ?? []) defaults[field.key] = field.default
    expect(() => compute(defaults)).not.toThrow()
  })

  // TODO: 補實際公式的斷言（預設值結果、邊界值、verdict 分支等）
})

describe('registry', () => {
  it(${JSON.stringify(`getTool('${slug}') 找得到這個工具`)}, () => {
    expect(getTool(${JSON.stringify(slug)})?.slug).toBe(${JSON.stringify(slug)})
  })
})
`
}

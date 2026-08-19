import type { ComponentType } from 'react'

export type Primitive = number | string | boolean | null
export type ResultRow = Record<string, Primitive>
export type Values = Record<string, number | string | boolean>
// table 輸出的 rowsKey 對應值是 ResultRow[]，其餘 key 對應純量——
// 跟 tool-engine.md spec 草案的 `Record<string, number|string|boolean|null>` 不同，
// 那個型別放不下 table 需要的陣列，見 specs/tool-engine.md Plan 1-1。
export type Result = Record<string, Primitive | ResultRow[]>

type BaseField = { key: string; label: string; hint?: string; span?: 1 | 2 }

export type NumberField = BaseField & {
  type: 'number'
  default: number
  min?: number
  max?: number
  step?: number
  unit?: string
}
export type SelectField = BaseField & {
  type: 'select'
  default: string
  options: { value: string; label: string }[]
}
export type ToggleField = BaseField & { type: 'toggle'; default: boolean }

export type InputField = NumberField | SelectField | ToggleField

export type OutputFormat = 'number' | 'currency' | 'percent' | 'text'

export type OutputBlock =
  | { type: 'stat'; key: string; label: string; format: 'number' | 'currency' | 'percent'; decimals?: number }
  | {
      type: 'verdict'
      key: string // result[key] 必須是 'good' | 'bad' | 'neutral' | null
      variants: Record<'good' | 'bad' | 'neutral', { label: string | ((r: Result) => string) }>
    }
  | {
      type: 'table'
      rowsKey: string // result[rowsKey] 是 ResultRow[]（compute 產出）
      columns: { key: string; label: string; format?: OutputFormat; decimals?: number }[]
    }
  | { type: 'note'; text: string }

export type ToolConfig = {
  slug: string
  name: string
  description: string // H1 下方一句話 + meta description 預設值
  category?: string // JSON-LD applicationCategory，預設 'UtilityApplication'
  // 三者皆 optional：有 customRenderer 時不需要填標準三件套（見 isStandardTool）
  inputs?: InputField[]
  compute?: (values: Values) => Result // 純函數，不可有副作用，必須可單元測試
  outputs?: OutputBlock[]
  showOutputsWhen?: (r: Result) => boolean // 預設視同 () => true
  cta?: {
    href: string
    label: string | ((r: Result) => string)
    urgent?: (r: Result) => boolean // true → 實心按鈕，false/未給 → 外框按鈕
  }
  footnote?: string
  faq?: { question: string; answer: string }[] // 有值就 render FAQPage JSON-LD + 頁面 FAQ 區塊
  seo?: { title?: string; description?: string } // title 有值時整段覆寫（不套 site.seo.titleTemplate），沒有就用 name 走 template
  customRenderer?: ComponentType<{ config: ToolConfig }> // 逃生口；有值時 ToolRenderer 直接交給它，引擎不介入
}

/** 沒有 customRenderer 的「標準工具」：inputs/compute/outputs 保證存在，ToolRenderer 用這個型別避免到處 `!`。 */
export type StandardTool = ToolConfig & Required<Pick<ToolConfig, 'inputs' | 'compute' | 'outputs'>>

export function isStandardTool(c: ToolConfig): c is StandardTool {
  return !c.customRenderer
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function buildDefaultValues(inputs: InputField[]): Values {
  const values: Values = {}
  for (const field of inputs) values[field.key] = field.default
  return values
}

/**
 * 回錯誤訊息陣列，空陣列 = 合法。只檢查單一 config 內部一致性，
 * slug 跨 config 的唯一性在 registry 層檢查（tools/index.ts）。
 */
export function validateToolConfig(c: ToolConfig): string[] {
  const errors: string[] = []

  if (!KEBAB_CASE.test(c.slug)) {
    errors.push(`slug "${c.slug}" 不是 kebab-case`)
  }

  if (!isStandardTool(c)) {
    // customRenderer 逃生口：不驗標準三件套
    return errors
  }

  if (!c.inputs || !c.compute || !c.outputs) {
    errors.push(`"${c.slug}" 沒有 customRenderer，必須提供 inputs/compute/outputs`)
    return errors
  }

  const { inputs, compute, outputs } = c

  const seenKeys = new Set<string>()
  for (const field of inputs) {
    if (seenKeys.has(field.key)) {
      errors.push(`input key "${field.key}" 重複`)
    }
    seenKeys.add(field.key)

    if (field.type === 'select') {
      if (!field.options || field.options.length === 0) {
        errors.push(`select 欄位 "${field.key}" 沒有 options`)
      } else if (!field.options.some((o) => o.value === field.default)) {
        errors.push(`select 欄位 "${field.key}" 的 default "${field.default}" 不在 options 裡`)
      }
    }

    if (field.type === 'number') {
      if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
        errors.push(`number 欄位 "${field.key}" 的 min 大於 max`)
      }
      if (field.min !== undefined && field.default < field.min) {
        errors.push(`number 欄位 "${field.key}" 的 default 小於 min`)
      }
      if (field.max !== undefined && field.default > field.max) {
        errors.push(`number 欄位 "${field.key}" 的 default 大於 max`)
      }
    }

    if (field.type === 'toggle') {
      // field.default 在型別上保證是 boolean，但這條檢查是為了擋「config 不是經過 tsc
      // 檢查產生」的情境（例如未來 new:tool 腳本吐出有 bug 的資料）——用 unknown 繞過
      // TS 對 ToggleField.default 已經是 boolean 的過度收斂（否則這個分支會被判定為
      // unreachable，field narrow 成 never）。
      const rawDefault: unknown = field.default
      if (typeof rawDefault !== 'boolean') {
        errors.push(`toggle 欄位 "${field.key}" 的 default 必須是 boolean`)
      }
    }
  }

  let result: Result | undefined
  try {
    result = compute(buildDefaultValues(inputs))
  } catch (err) {
    errors.push(`compute(defaults) 丟出例外：${err instanceof Error ? err.message : String(err)}`)
  }

  if (result) {
    for (const output of outputs) {
      if (output.type === 'stat' || output.type === 'verdict') {
        if (!(output.key in result)) {
          errors.push(`${output.type} 輸出的 key "${output.key}" 不在 compute(defaults) 的回傳裡`)
        }
      }

      if (output.type === 'table') {
        if (!(output.rowsKey in result)) {
          errors.push(`table 輸出的 rowsKey "${output.rowsKey}" 不在 compute(defaults) 的回傳裡`)
        } else {
          const rows = result[output.rowsKey]
          if (!Array.isArray(rows)) {
            errors.push(`table 輸出的 rowsKey "${output.rowsKey}" 對應的值不是陣列`)
          } else if (rows.length > 0) {
            const rowKeys = Object.keys(rows[0])
            for (const col of output.columns) {
              if (!rowKeys.includes(col.key)) {
                errors.push(`table 欄位 "${col.key}" 不在 "${output.rowsKey}" 的第一筆 row 裡`)
              }
            }
          }
          // rows 為空陣列時無法推斷 shape，跳過欄位檢查，author 自行負責（已知限制）
        }
      }
    }
  }

  return errors
}

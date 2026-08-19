import { describe, expect, it } from 'vitest'
import { validateToolConfig } from '@/lib/tool-config'
import type { ToolConfig } from '@/lib/tool-config'

function baseConfig(overrides: Partial<ToolConfig> = {}): ToolConfig {
  return {
    slug: 'valid-tool',
    name: '合法工具',
    description: '描述',
    inputs: [{ key: 'amount', label: '金額', type: 'number', default: 100, min: 0, max: 1000 }],
    compute: (values) => ({ total: Number(values.amount) * 2 }),
    outputs: [{ type: 'stat', key: 'total', label: '總計', format: 'number' }],
    ...overrides,
  }
}

describe('validateToolConfig', () => {
  it('合法 config 回傳空陣列', () => {
    expect(validateToolConfig(baseConfig())).toEqual([])
  })

  it('slug 非 kebab-case', () => {
    const errors = validateToolConfig(baseConfig({ slug: 'Not_Kebab' }))
    expect(errors.some((e) => e.includes('kebab-case'))).toBe(true)
  })

  it('input key 重複', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [
          { key: 'amount', label: 'A', type: 'number', default: 1 },
          { key: 'amount', label: 'B', type: 'number', default: 2 },
        ],
      })
    )
    expect(errors.some((e) => e.includes('重複'))).toBe(true)
  })

  it('select 缺 options', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [{ key: 'choice', label: '選擇', type: 'select', default: 'a', options: [] }],
      })
    )
    expect(errors.some((e) => e.includes('沒有 options'))).toBe(true)
  })

  it('select default 不在 options 裡', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [
          {
            key: 'choice',
            label: '選擇',
            type: 'select',
            default: 'c',
            options: [
              { value: 'a', label: 'A' },
              { value: 'b', label: 'B' },
            ],
          },
        ],
      })
    )
    expect(errors.some((e) => e.includes('不在 options 裡'))).toBe(true)
  })

  it('toggle default 不是 boolean（跑過型別繞過）', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [
          { key: 'flag', label: '開關', type: 'toggle', default: 'yes' as unknown as boolean },
        ],
      })
    )
    expect(errors.some((e) => e.includes('必須是 boolean'))).toBe(true)
  })

  it('number default 超出 min/max 範圍', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [{ key: 'amount', label: '金額', type: 'number', default: -5, min: 0, max: 100 }],
      })
    )
    expect(errors.some((e) => e.includes('小於 min'))).toBe(true)
  })

  it('number min 大於 max', () => {
    const errors = validateToolConfig(
      baseConfig({
        inputs: [{ key: 'amount', label: '金額', type: 'number', default: 5, min: 10, max: 0 }],
      })
    )
    expect(errors.some((e) => e.includes('min 大於 max'))).toBe(true)
  })

  it('compute(defaults) 丟出例外', () => {
    const errors = validateToolConfig(
      baseConfig({
        compute: () => {
          throw new Error('boom')
        },
      })
    )
    expect(errors.some((e) => e.includes('丟出例外'))).toBe(true)
  })

  it('stat/verdict 的 key 不在 compute(defaults) 回傳裡', () => {
    const errors = validateToolConfig(
      baseConfig({
        outputs: [{ type: 'stat', key: 'missing', label: '缺欄位', format: 'number' }],
      })
    )
    expect(errors.some((e) => e.includes('missing'))).toBe(true)
  })

  it('table rowsKey 不在回傳裡', () => {
    const errors = validateToolConfig(
      baseConfig({
        outputs: [{ type: 'table', rowsKey: 'rows', columns: [{ key: 'name', label: '名稱' }] }],
      })
    )
    expect(errors.some((e) => e.includes('rowsKey'))).toBe(true)
  })

  it('table columns[].key 不在第一筆 row 裡', () => {
    const errors = validateToolConfig(
      baseConfig({
        compute: () => ({ rows: [{ name: 'A' }] }),
        outputs: [
          {
            type: 'table',
            rowsKey: 'rows',
            columns: [
              { key: 'name', label: '名稱' },
              { key: 'missing', label: '缺欄位' },
            ],
          },
        ],
      })
    )
    expect(errors.some((e) => e.includes('missing'))).toBe(true)
  })

  it('table rows 為空陣列時跳過欄位檢查，不視為錯誤', () => {
    const errors = validateToolConfig(
      baseConfig({
        compute: () => ({ rows: [] }),
        outputs: [{ type: 'table', rowsKey: 'rows', columns: [{ key: 'name', label: '名稱' }] }],
      })
    )
    expect(errors).toEqual([])
  })

  it('沒有 customRenderer 又缺 inputs/compute/outputs', () => {
    const errors = validateToolConfig({
      slug: 'incomplete',
      name: '不完整',
      description: '描述',
    })
    expect(errors.some((e) => e.includes('必須提供 inputs/compute/outputs'))).toBe(true)
  })

  it('有 customRenderer 時跳過標準三件套檢查', () => {
    const errors = validateToolConfig({
      slug: 'custom-tool',
      name: '自訂工具',
      description: '描述',
      customRenderer: () => null,
    })
    expect(errors).toEqual([])
  })
})

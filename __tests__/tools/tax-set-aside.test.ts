import { describe, expect, it } from 'vitest'
import config from '@/tools/tax-set-aside.config'
import { getTool } from '@/tools'
import type { ResultRow } from '@/lib/tool-config'

const compute = config.compute!

const DEFAULTS = {
  monthlyIncome: 6000,
  federalPct: 12,
  statePct: 5,
  includeSelfEmploymentTax: true,
}

describe('taxSetAside compute', () => {
  it('預設值計算結果正確，verdict 為 good', () => {
    const result = compute(DEFAULTS)
    // seTaxable = 6000*0.9235=5541, seTax = 5541*0.153=847.773
    expect(result.total).toBeCloseTo(1867.773, 2) // 847.773 + 720 + 300
    expect(result.totalPct).toBeCloseTo(31.1295, 2)
    expect(result.verdict).toBe('good')
  })

  it('rows 依序列出四項且金額對得上 total', () => {
    const result = compute(DEFAULTS)
    const rows = result.rows as ResultRow[]
    expect(rows.map((r) => r.item)).toEqual([
      'Self-employment tax',
      'Federal income tax (est.)',
      'State income tax (est.)',
      'Total to set aside',
    ])
    expect(rows[3].amount).toBeCloseTo(result.total as number, 6)
  })

  it('totalPct > 40 時 verdict 為 bad', () => {
    const result = compute({ monthlyIncome: 6000, federalPct: 37, statePct: 15, includeSelfEmploymentTax: true })
    expect(result.totalPct as number).toBeGreaterThan(40)
    expect(result.verdict).toBe('bad')
  })

  it('totalPct < 20 時 verdict 為 neutral（常見於漏勾自雇稅）', () => {
    const result = compute({ monthlyIncome: 6000, federalPct: 10, statePct: 5, includeSelfEmploymentTax: false })
    expect(result.totalPct as number).toBeLessThan(20)
    expect(result.verdict).toBe('neutral')
  })

  it('includeSelfEmploymentTax = false 時 seTax 那列金額為 0', () => {
    const result = compute({ ...DEFAULTS, includeSelfEmploymentTax: false })
    const rows = result.rows as ResultRow[]
    expect(rows[0].amount).toBe(0)
  })

  it('monthlyIncome = 0 不會除以零丟例外', () => {
    const result = compute({ monthlyIncome: 0, federalPct: 12, statePct: 5, includeSelfEmploymentTax: true })
    expect(result.total).toBe(0)
    expect(result.totalPct).toBe(0)
    expect(result.verdict).toBe('neutral')
  })
})

describe('registry', () => {
  it("getTool('tax-set-aside') 找得到這個工具", () => {
    expect(getTool('tax-set-aside')?.slug).toBe('tax-set-aside')
  })
})

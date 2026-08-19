import { describe, expect, it } from 'vitest'
import config from '@/tools/hourly-rate.config'
import { getTool } from '@/tools'

const compute = config.compute!

const DEFAULTS = {
  targetIncome: 80000,
  billableHoursPerWeek: 25,
  weeksOffPerYear: 6,
  annualExpenses: 8000,
  taxSetAsidePct: 25,
}

describe('hourlyRate compute', () => {
  it('預設值計算結果正確', () => {
    const result = compute(DEFAULTS)
    expect(result.billableHours).toBe(1150) // 25 * (52 - 6)
    expect(result.grossNeeded).toBeCloseTo(117333.33, 2) // (80000+8000) / 0.75
    expect(result.hourlyRate).toBeCloseTo(102.03, 2)
    expect(result.dayRate).toBeCloseTo(816.23, 2)
  })

  it('weeksOffPerYear 拉到 52（billableHours 歸零）不會除以零丟例外', () => {
    const result = compute({ ...DEFAULTS, weeksOffPerYear: 52 })
    expect(result.billableHours).toBe(0)
    expect(result.hourlyRate).toBe(0)
  })

  it('taxSetAsidePct 拉到 100（稅率 100%）不會除以零丟例外', () => {
    const result = compute({ ...DEFAULTS, taxSetAsidePct: 100 })
    expect(result.grossNeeded).toBe(0)
    expect(result.hourlyRate).toBe(0)
  })

  it('taxSetAsidePct 為 0 時 grossNeeded 等於 targetIncome + annualExpenses', () => {
    const result = compute({ ...DEFAULTS, taxSetAsidePct: 0 })
    expect(result.grossNeeded).toBe(88000)
  })

  it('dayRate 永遠是 hourlyRate 的 8 倍', () => {
    const result = compute(DEFAULTS)
    expect(result.dayRate).toBeCloseTo((result.hourlyRate as number) * 8, 6)
  })
})

describe('registry', () => {
  it("getTool('hourly-rate') 找得到這個工具", () => {
    expect(getTool('hourly-rate')?.slug).toBe('hourly-rate')
  })
})

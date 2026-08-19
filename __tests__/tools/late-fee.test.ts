import { describe, expect, it } from 'vitest'
import config from '@/tools/late-fee.config'
import { getTool } from '@/tools'

const compute = config.compute!

const DEFAULTS = {
  invoiceAmount: 2500,
  daysLate: 30,
  rateType: 'monthly',
  ratePct: 1.5,
  flatFee: 0,
}

describe('lateFee compute', () => {
  it('預設值（monthly 1.5%）計算結果正確', () => {
    const result = compute(DEFAULTS)
    expect(result.interest).toBeCloseTo(37.5, 2) // 2500 * (1.5/100/30) * 30
    expect(result.total).toBeCloseTo(2537.5, 2)
    expect(result.effectiveAnnualPct).toBeCloseTo(18.25, 2)
  })

  it('rateType = annual 時用年利率換算日利率', () => {
    const result = compute({ invoiceAmount: 1000, daysLate: 10, rateType: 'annual', ratePct: 36.5, flatFee: 0 })
    expect(result.interest).toBeCloseTo(10, 6) // 1000 * (36.5/100/365) * 10
    expect(result.total).toBeCloseTo(1010, 6)
    expect(result.effectiveAnnualPct).toBeCloseTo(36.5, 6) // 年利率輸入應等於年化輸出
  })

  it('daysLate = 0 時沒有利息，只剩 flatFee', () => {
    const result = compute({ ...DEFAULTS, daysLate: 0, flatFee: 50 })
    expect(result.interest).toBe(0)
    expect(result.total).toBe(2550)
  })

  it('flatFee 會直接加進 total', () => {
    const result = compute({ ...DEFAULTS, flatFee: 100 })
    expect(result.total).toBeCloseTo(2637.5, 2)
  })

  it('ratePct = 0 時沒有利息也沒有年化利率', () => {
    const result = compute({ ...DEFAULTS, ratePct: 0 })
    expect(result.interest).toBe(0)
    expect(result.effectiveAnnualPct).toBe(0)
  })
})

describe('registry', () => {
  it("getTool('late-fee') 找得到這個工具", () => {
    expect(getTool('late-fee')?.slug).toBe('late-fee')
  })
})

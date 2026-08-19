import { describe, expect, it } from 'vitest'
import config from '@/tools/tip-calculator.config'

const compute = config.compute!

describe('tip-calculator compute', () => {
  it('預設值計算結果正確', () => {
    const result = compute({ billAmount: 1000, tipPercent: 15, splitCount: 1 })
    expect(result.tipAmount).toBe(150)
    expect(result.totalAmount).toBe(1150)
    expect(result.perPersonAmount).toBe(1150)
  })

  it('分攤人數 > 1 時平均分攤', () => {
    const result = compute({ billAmount: 1000, tipPercent: 10, splitCount: 4 })
    expect(result.totalAmount).toBe(1100)
    expect(result.perPersonAmount).toBe(275)
  })

  it('splitCount 給 0 或負數會被 clamp 到 1，不除以零', () => {
    const result = compute({ billAmount: 1000, tipPercent: 10, splitCount: 0 })
    expect(result.perPersonAmount).toBe(1100)
  })

  it('tipPercent = 0 時小費為 0', () => {
    const result = compute({ billAmount: 500, tipPercent: 0, splitCount: 1 })
    expect(result.tipAmount).toBe(0)
    expect(result.totalAmount).toBe(500)
  })
})

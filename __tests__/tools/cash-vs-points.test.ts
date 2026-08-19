import { describe, expect, it } from 'vitest'
import config from '@/tools/cash-vs-points.config'

const compute = config.compute!

describe('cash-vs-points compute', () => {
  it('預設值計算結果正確', () => {
    const result = compute({
      cashPrice: 15000,
      pointsRequired: 20000,
      cashSurcharge: 3500,
      marketValuePerPoint: 0.85,
    })
    // (15000 - 3500) / 20000 = 0.575
    expect(result.actualCostPerPoint).toBeCloseTo(0.575, 5)
    expect(result.verdict).toBe('bad') // 0.575 比 0.85 低超過 10%
  })

  it('pointsRequired = 0 不丟例外，verdict 為 null', () => {
    const result = compute({
      cashPrice: 15000,
      pointsRequired: 0,
      cashSurcharge: 3500,
      marketValuePerPoint: 0.85,
    })
    expect(result.actualCostPerPoint).toBe(0)
    expect(result.verdict).toBeNull()
  })

  it('marketValuePerPoint = 0 不除以零', () => {
    const result = compute({
      cashPrice: 15000,
      pointsRequired: 20000,
      cashSurcharge: 3500,
      marketValuePerPoint: 0,
    })
    expect(result.diffPct).toBe(0)
  })

  it('verdict 三分支：good（實際花費明顯高於市場估值）', () => {
    const result = compute({
      cashPrice: 20000,
      pointsRequired: 10000,
      cashSurcharge: 0,
      marketValuePerPoint: 1,
    })
    // actualCostPerPoint = 2，市場估值 1，高 100%
    expect(result.verdict).toBe('good')
  })

  it('verdict 三分支：bad（實際花費明顯低於市場估值）', () => {
    const result = compute({
      cashPrice: 5000,
      pointsRequired: 10000,
      cashSurcharge: 0,
      marketValuePerPoint: 1,
    })
    // actualCostPerPoint = 0.5，市場估值 1，低 50%
    expect(result.verdict).toBe('bad')
  })

  it('verdict 三分支：neutral（差距在 10% 以內）', () => {
    const result = compute({
      cashPrice: 10500,
      pointsRequired: 10000,
      cashSurcharge: 0,
      marketValuePerPoint: 1,
    })
    // actualCostPerPoint = 1.05，市場估值 1，差 5%
    expect(result.verdict).toBe('neutral')
  })
})

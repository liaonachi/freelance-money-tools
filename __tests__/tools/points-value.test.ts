import { describe, expect, it } from 'vitest'
import config from '@/tools/points-value.config'
import type { ResultRow } from '@/lib/tool-config'

const compute = config.compute!

describe('points-value compute', () => {
  it('預設值回傳 3 筆示範 program，欄位正確', () => {
    const result = compute({ points: 10000 })
    const rows = result.rows as ResultRow[]
    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ program: 'Program A', perPoint: 0.85, total: 8500 })
    expect(rows[1]).toMatchObject({ program: 'Program B', perPoint: 0.6, total: 6000 })
    expect(rows[2]).toMatchObject({ program: 'Program C', perPoint: 1.1, total: 11000 })
  })

  it('points = 0 時每筆 total 是 0 且不丟例外', () => {
    const result = compute({ points: 0 })
    const rows = result.rows as ResultRow[]
    expect(rows.every((row) => row.total === 0)).toBe(true)
  })
})

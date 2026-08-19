import { describe, expect, it } from 'vitest'
import { TOOLS, getTool } from '@/tools'
import { validateToolConfig } from '@/lib/tool-config'

describe('tools registry', () => {
  it('每一筆工具設定都通過驗證', () => {
    for (const tool of TOOLS) {
      expect(validateToolConfig(tool)).toEqual([])
    }
  })

  it('slug 不重複', () => {
    const slugs = TOOLS.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('getTool 找得到已註冊的工具', () => {
    expect(getTool('cash-vs-points')?.slug).toBe('cash-vs-points')
    expect(getTool('points-value')?.slug).toBe('points-value')
  })

  it('getTool 找不到不存在的 slug 時回傳 undefined', () => {
    expect(getTool('does-not-exist')).toBeUndefined()
  })
})

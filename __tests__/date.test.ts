import { describe, expect, it } from 'vitest'
import { formatDate } from '@/lib/date'
import { getSite } from '@/lib/site-config'

describe('formatDate', () => {
  it('用 site.config 目前的 locale/timezone 格式化日期（不寫死特定語系字串，客戶案切 locale 也要過）', () => {
    const { locale, timezone } = getSite()
    const iso = '2026-01-15T20:00:00Z'
    const expected = new Date(iso).toLocaleDateString(locale, { timeZone: timezone })
    expect(formatDate(iso)).toBe(expected)
  })

  it('回傳非空字串，不丟例外', () => {
    expect(() => formatDate('2026-06-01T00:00:00Z')).not.toThrow()
    expect(formatDate('2026-06-01T00:00:00Z').length).toBeGreaterThan(0)
  })
})

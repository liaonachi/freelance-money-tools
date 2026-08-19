import { describe, expect, it } from 'vitest'
import { formatValue } from '@/lib/format'

describe('formatValue', () => {
  it('null 一律格式化成 em dash', () => {
    expect(formatValue(null, 'number', 0, 'zh-TW', 'TWD')).toBe('—')
    expect(formatValue(null, 'currency', 0, 'zh-TW', 'TWD')).toBe('—')
  })

  it('number 格式套用 decimals', () => {
    expect(formatValue(1234.5, 'number', 0, 'zh-TW', 'TWD')).toBe('1,235')
    expect(formatValue(1234.5, 'number', 2, 'zh-TW', 'TWD')).toBe('1,234.50')
  })

  it('currency 格式帶幣別符號', () => {
    const result = formatValue(1000, 'currency', 0, 'zh-TW', 'TWD')
    expect(result).toContain('1,000')
  })

  it('percent 格式假設輸入已經是百分比數值', () => {
    expect(formatValue(12.345, 'percent', 1, 'zh-TW', 'TWD')).toBe('12.3%')
    expect(formatValue(-5, 'percent', 0, 'zh-TW', 'TWD')).toBe('-5%')
  })

  it('text 格式直接轉字串', () => {
    expect(formatValue('Program A', 'text', 0, 'zh-TW', 'TWD')).toBe('Program A')
    expect(formatValue(true, 'text', 0, 'zh-TW', 'TWD')).toBe('true')
  })

  it('負數也能正確格式化', () => {
    expect(formatValue(-1234, 'number', 0, 'zh-TW', 'TWD')).toBe('-1,234')
  })
})

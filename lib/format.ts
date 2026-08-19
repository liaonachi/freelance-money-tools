import type { OutputFormat, Primitive } from './tool-config'

/**
 * 純函數，不讀 process.env——locale/currency 由呼叫端（ToolRenderer）決定並傳入，
 * 方便單元測試與未來 MVP 3 改讀 site.config 時只換呼叫端。
 */
export function formatValue(
  value: Primitive,
  format: OutputFormat,
  decimals: number = 0,
  locale: string,
  currency: string
): string {
  if (value === null || value === undefined) return '—'

  if (format === 'text') return String(value)

  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)

  if (format === 'percent') {
    // value 視為「已經是百分比數值」（12.5 代表 12.5%），不套用 Intl 的 0–1 小數 percent style
    return `${n.toFixed(decimals)}%`
  }

  if (format === 'currency') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(n)
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

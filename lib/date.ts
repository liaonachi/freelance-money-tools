import { getSite } from './site-config'

/** 統一用 site.locale + site.timezone 格式化日期，取代四處寫死的 toLocaleDateString('zh-TW', {...}) */
export function formatDate(iso: string): string {
  const { locale, timezone } = getSite()
  return new Date(iso).toLocaleDateString(locale, { timeZone: timezone })
}

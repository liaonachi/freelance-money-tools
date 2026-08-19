import site from '@/site.config'
import { validateSiteConfig } from './validate-site-config'
import type { SiteConfig } from './validate-site-config'

export type { SiteConfig, SupportedLocale, NavLink } from './validate-site-config'
export { validateSiteConfig, ogLocale, SUPPORTED_LOCALES } from './validate-site-config'

// 啟動時（module top-level）驗證一次，有錯就 throw——跟 tools/index.ts 同一套哲學，
// 寧可 build 失敗也不要壞掉的 site.config 上線。
const siteConfigErrors = validateSiteConfig(site)
if (siteConfigErrors.length > 0) {
  throw new Error(`site.config.ts 驗證失敗：\n${siteConfigErrors.join('\n')}`)
}

export function getSite(): SiteConfig {
  return site
}

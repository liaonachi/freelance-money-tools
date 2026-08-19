// 純型別 + 驗證，刻意不 import 根目錄 site.config.ts（scripts/new-site.ts 寫檔前
// 要能在「新的 site.config.ts 還沒寫入」的狀態下就驗證答案，不能觸發 getSite() 那個
// 「import 目前的 site.config.ts 並 throw」的 side effect）。

export type SupportedLocale = 'zh-TW' | 'en'

export type NavLink = { label: string; href: string }

export type SiteConfig = {
  name: string
  description: string
  url: string // 無尾斜線，必須是 https
  locale: SupportedLocale
  currency: string // Intl 貨幣代碼，例如 'TWD' / 'USD'
  timezone: string // 日期顯示用，例如 'Asia/Taipei'
  ga4Id: string // 空字串 = 不載入 gtag
  theme: { primary: string } // hex 色碼
  nav: NavLink[]
  footer: { links: NavLink[]; copyright: string }
  seo: { titleTemplate: string; defaultOgImage: string }
}

export const SUPPORTED_LOCALES: SupportedLocale[] = ['zh-TW', 'en']

const OG_LOCALE_MAP: Record<SupportedLocale, string> = {
  'zh-TW': 'zh_TW',
  en: 'en_US',
}

export function ogLocale(locale: SupportedLocale): string {
  return OG_LOCALE_MAP[locale]
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function isValidHref(href: string): boolean {
  return href.startsWith('/') || href.startsWith('http://') || href.startsWith('https://')
}

export function validateSiteConfig(c: SiteConfig): string[] {
  const errors: string[] = []

  if (!c.name.trim()) errors.push('name 不可為空')
  if (!c.url.startsWith('https://')) errors.push('url 必須以 https:// 開頭')
  if (c.url.endsWith('/')) errors.push('url 不可有尾斜線')
  if (!(SUPPORTED_LOCALES as string[]).includes(c.locale)) {
    errors.push(`locale "${c.locale}" 不在支援清單（${SUPPORTED_LOCALES.join(', ')}）`)
  }
  if (!HEX_COLOR.test(c.theme.primary)) {
    errors.push(`theme.primary "${c.theme.primary}" 不是合法 hex 色碼（例如 #2563eb）`)
  }
  for (const link of c.nav) {
    if (!isValidHref(link.href)) errors.push(`nav 連結 "${link.href}" 必須以 / 或 http 開頭`)
  }
  for (const link of c.footer.links) {
    if (!isValidHref(link.href)) errors.push(`footer 連結 "${link.href}" 必須以 / 或 http 開頭`)
  }

  return errors
}

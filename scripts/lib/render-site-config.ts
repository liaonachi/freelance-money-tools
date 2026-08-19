// 純函數：answers → site.config.ts 檔案內容字串。不 import 任何 server-only 或
// side-effect 模組，方便 scripts/new-site.ts（純 node 執行）與 vitest 兩邊共用。

export type NewSiteLocale = 'zh-TW' | 'en'

export type NavLinkAnswer = { label: string; href: string }

export type NewSiteAnswer = {
  name: string
  description: string
  url: string
  locale: NewSiteLocale
  currency: string
  timezone: string
  ga4Id: string
  primary: string
  nav?: NavLinkAnswer[]
  footerLinks?: NavLinkAnswer[]
}

const DEFAULT_NAV: Record<NewSiteLocale, NavLinkAnswer[]> = {
  'zh-TW': [
    { label: '工具', href: '/tools' },
    { label: '文章', href: '/blog' },
  ],
  en: [
    { label: 'Tools', href: '/tools' },
    { label: 'Blog', href: '/blog' },
  ],
}

const DEFAULT_FOOTER_LINKS: Record<NewSiteLocale, NavLinkAnswer[]> = {
  'zh-TW': [
    { label: '關於我們', href: '/about' },
    { label: '免責聲明', href: '/disclaimer' },
  ],
  en: [
    { label: 'About', href: '/about' },
    { label: 'Disclaimer', href: '/disclaimer' },
  ],
}

function renderNavLiteral(links: NavLinkAnswer[], indent: string): string {
  return links.map((l) => `${indent}{ label: ${JSON.stringify(l.label)}, href: ${JSON.stringify(l.href)} },`).join('\n')
}

export function renderSiteConfig(answer: NewSiteAnswer): string {
  const nav = answer.nav ?? DEFAULT_NAV[answer.locale]
  const footerLinks = answer.footerLinks ?? DEFAULT_FOOTER_LINKS[answer.locale]

  return `import type { SiteConfig } from '@/lib/site-config'

const site: SiteConfig = {
  name: ${JSON.stringify(answer.name)},
  description: ${JSON.stringify(answer.description)},
  url: ${JSON.stringify(answer.url)},
  locale: ${JSON.stringify(answer.locale)},
  currency: ${JSON.stringify(answer.currency)},
  timezone: ${JSON.stringify(answer.timezone)},
  ga4Id: ${JSON.stringify(answer.ga4Id)},
  theme: { primary: ${JSON.stringify(answer.primary)} },
  nav: [
${renderNavLiteral(nav, '    ')}
  ],
  footer: {
    links: [
${renderNavLiteral(footerLinks, '      ')}
    ],
    copyright: ${JSON.stringify(answer.name)},
  },
  seo: {
    titleTemplate: ${JSON.stringify(`%s | ${answer.name}`)},
    defaultOgImage: '',
  },
}

export default site
`
}

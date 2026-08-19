import { describe, expect, it } from 'vitest'
import { validateSiteConfig, ogLocale } from '@/lib/validate-site-config'
import type { SiteConfig } from '@/lib/validate-site-config'

function baseConfig(overrides: Partial<SiteConfig> = {}): SiteConfig {
  return {
    name: 'My Site',
    description: 'desc',
    url: 'https://example.com',
    locale: 'zh-TW',
    currency: 'TWD',
    timezone: 'Asia/Taipei',
    ga4Id: '',
    theme: { primary: '#2563eb' },
    nav: [{ label: 'Tools', href: '/tools' }],
    footer: { links: [{ label: 'About', href: '/about' }], copyright: 'My Site' },
    seo: { titleTemplate: '%s | My Site', defaultOgImage: '' },
    ...overrides,
  }
}

describe('validateSiteConfig', () => {
  it('合法 config 回傳空陣列', () => {
    expect(validateSiteConfig(baseConfig())).toEqual([])
  })

  it('name 空白', () => {
    expect(validateSiteConfig(baseConfig({ name: '  ' })).some((e) => e.includes('name'))).toBe(true)
  })

  it('url 不是 https', () => {
    expect(validateSiteConfig(baseConfig({ url: 'http://example.com' })).some((e) => e.includes('https'))).toBe(
      true
    )
  })

  it('url 有尾斜線', () => {
    expect(validateSiteConfig(baseConfig({ url: 'https://example.com/' })).some((e) => e.includes('尾斜線'))).toBe(
      true
    )
  })

  it('locale 不在支援清單', () => {
    const errors = validateSiteConfig(baseConfig({ locale: 'fr' as SiteConfig['locale'] }))
    expect(errors.some((e) => e.includes('locale'))).toBe(true)
  })

  it('theme.primary 不是合法 hex', () => {
    const errors = validateSiteConfig(baseConfig({ theme: { primary: 'blue' } }))
    expect(errors.some((e) => e.includes('hex'))).toBe(true)
  })

  it('nav 連結格式不對', () => {
    const errors = validateSiteConfig(baseConfig({ nav: [{ label: 'X', href: 'javascript:alert(1)' }] }))
    expect(errors.some((e) => e.includes('nav'))).toBe(true)
  })

  it('footer 連結格式不對', () => {
    const errors = validateSiteConfig(
      baseConfig({ footer: { links: [{ label: 'X', href: 'ftp://bad' }], copyright: 'x' } })
    )
    expect(errors.some((e) => e.includes('footer'))).toBe(true)
  })
})

describe('ogLocale', () => {
  it('zh-TW 對應 zh_TW', () => {
    expect(ogLocale('zh-TW')).toBe('zh_TW')
  })

  it('en 對應 en_US', () => {
    expect(ogLocale('en')).toBe('en_US')
  })
})

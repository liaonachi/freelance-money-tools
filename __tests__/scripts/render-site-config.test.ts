import { describe, expect, it } from 'vitest'
import { renderSiteConfig } from '../../scripts/lib/render-site-config'

const ANSWER = {
  name: 'Demo Calc',
  description: 'Free calculators.',
  url: 'https://demo.example.com',
  locale: 'en' as const,
  currency: 'USD',
  timezone: 'America/New_York',
  ga4Id: '',
  primary: '#2563eb',
}

describe('renderSiteConfig', () => {
  it('產出的內容含所有欄位、export default site', () => {
    const content = renderSiteConfig(ANSWER)
    expect(content).toContain('export default site')
    expect(content).toContain(JSON.stringify(ANSWER.name))
    expect(content).toContain(JSON.stringify(ANSWER.url))
    expect(content).toContain(JSON.stringify(ANSWER.locale))
    expect(content).toContain(JSON.stringify(ANSWER.primary))
  })

  it('en locale 預設 nav 是英文', () => {
    const content = renderSiteConfig(ANSWER)
    expect(content).toContain(`label: ${JSON.stringify('Tools')}`)
    expect(content).toContain(`label: ${JSON.stringify('Blog')}`)
  })

  it('zh-TW locale 預設 nav 是中文', () => {
    const content = renderSiteConfig({ ...ANSWER, locale: 'zh-TW', currency: 'TWD', timezone: 'Asia/Taipei' })
    expect(content).toContain(`label: ${JSON.stringify('工具')}`)
    expect(content).toContain(`label: ${JSON.stringify('文章')}`)
  })

  it('字串值用 JSON.stringify 逸出，內含單引號不會弄壞語法', () => {
    const content = renderSiteConfig({ ...ANSWER, name: "Nadia's Tools" })
    expect(content).toContain(JSON.stringify("Nadia's Tools"))
  })

  it('titleTemplate 帶入站名', () => {
    const content = renderSiteConfig(ANSWER)
    expect(content).toContain(JSON.stringify('%s | Demo Calc'))
  })

  it('可以自訂 nav／footerLinks 覆寫預設值', () => {
    const content = renderSiteConfig({
      ...ANSWER,
      nav: [{ label: 'Custom', href: '/custom' }],
      footerLinks: [{ label: 'Custom Footer', href: '/cf' }],
    })
    expect(content).toContain(`label: ${JSON.stringify('Custom')}`)
    expect(content).toContain(`label: ${JSON.stringify('Custom Footer')}`)
    expect(content).not.toContain(`label: ${JSON.stringify('Tools')}`)
  })
})

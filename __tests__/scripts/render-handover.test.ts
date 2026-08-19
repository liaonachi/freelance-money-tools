import { describe, expect, it } from 'vitest'
import { renderHandover } from '../../scripts/lib/render-handover'

describe('renderHandover', () => {
  it('把 {{SITE_NAME}}／{{SITE_URL}} 換成答案，其餘 {{…}} 保留原樣', () => {
    const template = '# Handover — {{SITE_NAME}}\n\nSite: {{SITE_URL}}\nDelivered: {{DELIVERY_DATE}}\n'
    const result = renderHandover(template, { name: 'Demo Calc', url: 'https://demo.example.com' })
    expect(result).toContain('# Handover — Demo Calc')
    expect(result).toContain('Site: https://demo.example.com')
    expect(result).toContain('Delivered: {{DELIVERY_DATE}}') // 沒填的欄位保留原樣
  })

  it('多次出現的 {{SITE_NAME}}／{{SITE_URL}} 全部替換', () => {
    const template = '{{SITE_NAME}} at {{SITE_URL}}. Visit {{SITE_URL}}/admin for {{SITE_NAME}} admin.'
    const result = renderHandover(template, { name: 'X', url: 'https://x.com' })
    expect(result).toBe('X at https://x.com. Visit https://x.com/admin for X admin.')
  })

  it('重複執行（已經替換過的模板）不會出錯，是 no-op', () => {
    const template = renderHandover('{{SITE_NAME}} / {{SITE_URL}}', { name: 'X', url: 'https://x.com' })
    const again = renderHandover(template, { name: 'Y', url: 'https://y.com' })
    expect(again).toBe('X / https://x.com') // 已經沒有 {{SITE_NAME}}/{{SITE_URL}} 可換了
  })
})

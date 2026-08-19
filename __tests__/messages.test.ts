import { describe, expect, it } from 'vitest'
import zhTW from '@/messages/zh-TW'
import en from '@/messages/en'
import { t } from '@/messages'
import { getSite } from '@/lib/site-config'

describe('messages key parity', () => {
  it('zh-TW 與 en 的 key 集合完全相等', () => {
    const zhKeys = Object.keys(zhTW).sort()
    const enKeys = Object.keys(en).sort()
    expect(enKeys).toEqual(zhKeys)
  })

  it('兩個字典的每個值都是非空字串', () => {
    for (const dict of [zhTW, en]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(typeof value, `${key} 應該是字串`).toBe('string')
        expect((value as string).length > 0, `${key} 不應該是空字串`).toBe(true)
      }
    }
  })
})

describe('t()', () => {
  // 不寫死特定語系的期望字串——母版預設 zh-TW，但客戶案 new:site 可以切 en，
  // 這裡動態依 site.config 目前的 locale 選對照字典，兩種 locale 都要過。
  function currentDict(): Record<string, string> {
    return getSite().locale === 'en' ? en : zhTW
  }

  it('回傳目前 site.locale 對應字典的文案', () => {
    expect(t('home.toolsHeading')).toBe(currentDict()['home.toolsHeading'])
  })

  it('支援 {key} 字串內插', () => {
    const expected = currentDict()['about.heading'].replace('{siteName}', 'Foo')
    expect(t('about.heading', { siteName: 'Foo' })).toBe(expected)
  })
})

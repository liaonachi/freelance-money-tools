import zhTW from './zh-TW'
import en from './en'
import { getSite } from '@/lib/site-config'
import type { SupportedLocale } from '@/lib/site-config'

export type MessageKey = keyof typeof zhTW

const dictionaries: Record<SupportedLocale, Record<MessageKey, string>> = {
  'zh-TW': zhTW,
  en,
}

/** 讀 site.locale 選字典；params 做簡單的 {key} 字串內插，不引入 i18n 套件。 */
export function t(key: MessageKey, params?: Record<string, string>): string {
  const { locale } = getSite()
  let str: string = dictionaries[locale][key]
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      str = str.replaceAll(`{${name}}`, value)
    }
  }
  return str
}

import type { FaqItem } from '@/lib/types'

/** raw 是 PostForm 的 hidden input `faq_jsonld` 內容：JSON 字串化的 FaqItem[] 或空字串。 */
export function parseFaqField(raw: string | null): FaqItem[] | null {
  if (raw === null) return null

  const trimmed = raw.trim()
  if (trimmed === '') return null

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    return null
  }

  if (!Array.isArray(parsed)) return null

  const items = parsed.filter((item): item is FaqItem => {
    if (typeof item !== 'object' || item === null) return false
    const { question, answer } = item as Record<string, unknown>
    return (
      typeof question === 'string' &&
      question.trim() !== '' &&
      typeof answer === 'string' &&
      answer.trim() !== ''
    )
  })

  return items.length > 0 ? items : null
}

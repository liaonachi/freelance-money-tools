import { describe, expect, it } from 'vitest'
import { parseFaqField } from '@/lib/faq'

describe('parseFaqField', () => {
  it('合法 JSON 陣列直接回傳', () => {
    const raw = JSON.stringify([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ])
    expect(parseFaqField(raw)).toEqual([
      { question: 'Q1', answer: 'A1' },
      { question: 'Q2', answer: 'A2' },
    ])
  })

  it('空字串回傳 null', () => {
    expect(parseFaqField('')).toBeNull()
    expect(parseFaqField('   ')).toBeNull()
  })

  it('null 回傳 null', () => {
    expect(parseFaqField(null)).toBeNull()
  })

  it('壞 JSON 回傳 null，不丟例外', () => {
    expect(parseFaqField('{not valid json')).toBeNull()
  })

  it('不是陣列的 JSON 回傳 null', () => {
    expect(parseFaqField(JSON.stringify({ question: 'Q', answer: 'A' }))).toBeNull()
  })

  it('過濾掉 question 或 answer 為空的列', () => {
    const raw = JSON.stringify([
      { question: 'Q1', answer: 'A1' },
      { question: '', answer: 'A2' },
      { question: 'Q3', answer: '' },
      { question: '  ', answer: '  ' },
    ])
    expect(parseFaqField(raw)).toEqual([{ question: 'Q1', answer: 'A1' }])
  })

  it('過濾後空陣列回傳 null', () => {
    const raw = JSON.stringify([{ question: '', answer: '' }])
    expect(parseFaqField(raw)).toBeNull()
  })
})

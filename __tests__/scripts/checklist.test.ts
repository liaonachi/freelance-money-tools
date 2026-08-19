import { describe, expect, it } from 'vitest'
import { extractChecklistSection } from '../../scripts/lib/checklist'

const FIXTURE = `# 交付流程 Checklist

## Day 0 — 成交前（不算工時）

- [ ] 客戶填 intake 表
- [ ] 判定套餐

## Day 1–2 — Spec（目標 1.5h）

- [ ] fork 母版 → 客戶 private repo
- [ ] npm run new:site（用 intake 表答案）→ 提交
- [ ] 每個工具寫 specs/tool-<slug>.md
- [ ] 建客戶自己的 Supabase 專案
- [ ] npm run db:apply
- [ ] 這條不該出現在前 5 條裡

## Day 3–11 — Build（目標 8h）

- [ ] 每個工具：npm run new:tool
`

describe('extractChecklistSection', () => {
  it('抽出指定 heading 底下的 checklist 項目，限制數量', () => {
    const items = extractChecklistSection(FIXTURE, 'Day 1', 5)
    expect(items).toHaveLength(5)
    expect(items[0]).toBe('fork 母版 → 客戶 private repo')
    expect(items[4]).toBe('npm run db:apply')
  })

  it('不會抽到下一個 heading 底下的項目', () => {
    const items = extractChecklistSection(FIXTURE, 'Day 1', 10)
    expect(items.every((item) => !item.includes('npm run new:tool'))).toBe(true)
  })

  it('找不到 heading 時回傳空陣列', () => {
    expect(extractChecklistSection(FIXTURE, 'Day 99', 5)).toEqual([])
  })

  it('limit 大於實際項目數時回傳全部', () => {
    const items = extractChecklistSection(FIXTURE, 'Day 0', 10)
    expect(items).toEqual(['客戶填 intake 表', '判定套餐'])
  })
})

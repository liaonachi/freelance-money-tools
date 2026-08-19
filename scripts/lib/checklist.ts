// 純函數：從 docs/delivery-checklist.md 這種 markdown 抽出某個 `## ` 段落底下的
// `- [ ] ...` 項目文字，給 new-site.ts 的「下一步」輸出用——不要另外維護一份清單，
// checklist 改了，new:site 印出來的東西自動跟著改。

export function extractChecklistSection(markdown: string, headingMatch: string, limit: number): string[] {
  const lines = markdown.split('\n')
  const startIndex = lines.findIndex((line) => line.startsWith('## ') && line.includes(headingMatch))
  if (startIndex === -1) return []

  const items: string[] = []
  for (let i = startIndex + 1; i < lines.length && items.length < limit; i++) {
    const line = lines[i]
    if (line.startsWith('## ')) break
    const match = line.match(/^- \[ \] (.+)$/)
    if (match) items.push(match[1])
  }
  return items
}

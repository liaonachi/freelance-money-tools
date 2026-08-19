// 純函數：把 docs/handover.md 模板裡的 {{SITE_NAME}}／{{SITE_URL}} 換成 new:site 答案，
// 其餘 {{…}} 逐案填的欄位（{{DELIVERY_DATE}}、{{PACKAGE}}…）保留原樣。

export type HandoverAnswer = { name: string; url: string }

export function renderHandover(template: string, answer: HandoverAnswer): string {
  return template.replaceAll('{{SITE_NAME}}', answer.name).replaceAll('{{SITE_URL}}', answer.url)
}

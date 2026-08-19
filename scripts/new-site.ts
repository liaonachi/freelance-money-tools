import { createInterface } from 'node:readline/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { renderSiteConfig } from './lib/render-site-config.ts'
import { validateSiteConfig } from '../lib/validate-site-config.ts'
import { renderHandover } from './lib/render-handover.ts'
import { extractChecklistSection } from './lib/checklist.ts'
import type { NewSiteLocale } from './lib/render-site-config.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PLACEHOLDER_MARKER = "name: 'Starter Site'"

function parseArgs(argv: string[]): { flags: Set<string>; options: Record<string, string> } {
  const flags = new Set<string>()
  const options: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith('--')) {
      options[key] = next
      i++
    } else {
      flags.add(key)
    }
  }
  return { flags, options }
}

async function main() {
  const { flags, options } = parseArgs(process.argv.slice(2))
  const yes = flags.has('yes')

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  async function resolveAnswer(key: string, question: string, fallback: string): Promise<string> {
    if (options[key] !== undefined) return options[key]
    if (yes) return fallback
    const raw = (await rl.question(`${question}${fallback ? ` [${fallback}]` : ''}: `)).trim()
    return raw || fallback
  }

  const name = await resolveAnswer('name', '站名', 'My Site')
  const description = await resolveAnswer('description', '一句話描述', 'Free calculators and guides.')
  const url = await resolveAnswer('url', '網域（https://開頭，無尾斜線）', 'https://example.com')
  const locale = (await resolveAnswer('locale', '語系 (zh-TW/en)', 'zh-TW')) as NewSiteLocale
  const currency = await resolveAnswer('currency', '貨幣代碼', locale === 'en' ? 'USD' : 'TWD')
  const timezone = await resolveAnswer('timezone', '時區', locale === 'en' ? 'America/New_York' : 'Asia/Taipei')
  const ga4Id = await resolveAnswer('ga4Id', 'GA4 ID（可留空）', '')
  const primary = await resolveAnswer('primary', '主色 hex', '#2563eb')

  rl.close()

  const answer = { name, description, url, locale, currency, timezone, ga4Id, primary }
  const errors = validateSiteConfig({
    ...answer,
    theme: { primary },
    nav: [],
    footer: { links: [], copyright: name },
    seo: { titleTemplate: '', defaultOgImage: '' },
  })
  if (errors.length > 0) {
    console.error('✗ 答案沒通過驗證：')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  const configPath = resolve(ROOT, 'site.config.ts')
  const existing = existsSync(configPath) ? readFileSync(configPath, 'utf8') : ''
  const isPlaceholder = existing === '' || existing.includes(PLACEHOLDER_MARKER)
  if (!isPlaceholder && !flags.has('force')) {
    console.error('✗ site.config.ts 已存在且不是母版 placeholder，加 --force 才會覆寫。')
    process.exit(1)
  }

  writeFileSync(configPath, renderSiteConfig(answer))

  const pkgPath = resolve(ROOT, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkg.name =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'site'
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  const readmePath = resolve(ROOT, 'README.md')
  if (existsSync(readmePath)) {
    const lines = readFileSync(readmePath, 'utf8').split('\n')
    lines[0] = `# ${name}`
    writeFileSync(readmePath, lines.join('\n'))
  }

  const handoverPath = resolve(ROOT, 'docs', 'handover.md')
  if (existsSync(handoverPath)) {
    const template = readFileSync(handoverPath, 'utf8')
    writeFileSync(handoverPath, renderHandover(template, { name, url }))
  }

  console.log(`✓ site.config.ts 已產出：${name}（${locale}, ${url}）`)
  console.log('')

  const checklistPath = resolve(ROOT, 'docs', 'delivery-checklist.md')
  const checklistItems = existsSync(checklistPath)
    ? extractChecklistSection(readFileSync(checklistPath, 'utf8'), 'Day 1', 5)
    : []

  if (checklistItems.length > 0) {
    console.log('下一步（docs/delivery-checklist.md 的 Day 1–2）：')
    checklistItems.forEach((item, i) => console.log(`  ${i + 1}. ${item}`))
    console.log('')
    console.log('完整流程見 docs/delivery-checklist.md；交付文件模板見 docs/handover.md（已帶入站名／網域）')
  } else {
    console.log('下一步：見 docs/delivery-checklist.md')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

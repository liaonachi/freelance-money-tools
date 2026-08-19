import { createInterface } from 'node:readline/promises'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { renderToolConfig, renderRegistryPatch, renderToolTest } from './lib/render-tool-config.ts'
import { patchRegistry } from './lib/patch-registry.ts'
import type { NewToolAnswer, NewToolInputAnswer } from './lib/render-tool-config.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

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

async function promptInputs(rl: ReturnType<typeof createInterface>): Promise<NewToolInputAnswer[]> {
  const inputs: NewToolInputAnswer[] = []

  while (true) {
    const key = (await rl.question('欄位 key（留空結束輸入欄位）: ')).trim()
    if (!key) break
    const label = (await rl.question('欄位 label: ')).trim()
    const type = ((await rl.question('欄位型別 (number/select/toggle) [number]: ')).trim() || 'number') as
      | 'number'
      | 'select'
      | 'toggle'

    if (type === 'select') {
      const defaultValue = (await rl.question('預設值（須等於某個 option 的 value）: ')).trim()
      const options: { value: string; label: string }[] = []
      while (true) {
        const value = (await rl.question('  option value（留空結束）: ')).trim()
        if (!value) break
        const optionLabel = (await rl.question('  option label: ')).trim()
        options.push({ value, label: optionLabel })
      }
      inputs.push({ key, label, type: 'select', default: defaultValue, options })
      continue
    }

    if (type === 'toggle') {
      const defaultStr = (await rl.question('預設值 (true/false) [false]: ')).trim() || 'false'
      inputs.push({ key, label, type: 'toggle', default: defaultStr === 'true' })
      continue
    }

    const defaultStr = (await rl.question('預設值 [0]: ')).trim() || '0'
    const minStr = (await rl.question('min（可留空）: ')).trim()
    const maxStr = (await rl.question('max（可留空）: ')).trim()
    const stepStr = (await rl.question('step（可留空）: ')).trim()
    const unit = (await rl.question('unit（可留空）: ')).trim()
    inputs.push({
      key,
      label,
      type: 'number',
      default: Number(defaultStr),
      ...(minStr && { min: Number(minStr) }),
      ...(maxStr && { max: Number(maxStr) }),
      ...(stepStr && { step: Number(stepStr) }),
      ...(unit && { unit }),
    })
  }

  return inputs
}

async function resolveAnswer(options: Record<string, string>): Promise<NewToolAnswer> {
  if (options.json) {
    return JSON.parse(options.json) as NewToolAnswer
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const slug = (await rl.question('工具 slug（kebab-case）: ')).trim()
  const name = (await rl.question('工具名稱: ')).trim()
  const description = (await rl.question('一句話描述: ')).trim()
  const category = (await rl.question('category [UtilityApplication]: ')).trim() || 'UtilityApplication'
  console.log('接下來輸入 inputs：')
  const inputs = await promptInputs(rl)
  rl.close()

  return { slug, name, description, category, inputs }
}

async function main() {
  const { flags, options } = parseArgs(process.argv.slice(2))
  const answer = await resolveAnswer(options)

  if (!KEBAB_CASE.test(answer.slug)) {
    console.error(`✗ slug "${answer.slug}" 不是 kebab-case`)
    process.exit(1)
  }

  const registryPath = resolve(ROOT, 'tools', 'index.ts')
  const registrySource = readFileSync(registryPath, 'utf8')
  if (registrySource.includes(`from './${answer.slug}.config'`)) {
    console.error(`✗ slug "${answer.slug}" 已經在 tools/index.ts 裡，換一個 slug 或手動處理`)
    process.exit(1)
  }

  const configPath = resolve(ROOT, 'tools', `${answer.slug}.config.ts`)
  if (existsSync(configPath) && !flags.has('force')) {
    console.error(`✗ tools/${answer.slug}.config.ts 已存在，加 --force 才會覆寫。`)
    process.exit(1)
  }

  writeFileSync(configPath, renderToolConfig(answer))

  const testPath = resolve(ROOT, '__tests__', 'tools', `${answer.slug}.test.ts`)
  writeFileSync(testPath, renderToolTest(answer.slug))

  const { importLine, registryEntry } = renderRegistryPatch(answer.slug)
  writeFileSync(registryPath, patchRegistry(registrySource, importLine, registryEntry))

  console.log(`✓ tools/${answer.slug}.config.ts 已產出，registry 已註冊`)
  console.log('')
  console.log('下一步：')
  console.log(`  1. 編輯 tools/${answer.slug}.config.ts 的 compute（TODO 都標好了，公式要人寫）`)
  console.log(`  2. 補 __tests__/tools/${answer.slug}.test.ts 的斷言`)
  console.log('  3. npm test && npm run build 確認都過')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

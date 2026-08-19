import { describe, expect, it } from 'vitest'
import { patchRegistry } from '../../scripts/lib/patch-registry'

const FIXTURE = `import cashVsPoints from './cash-vs-points.config'
// @new-tool:imports
import { validateToolConfig, type ToolConfig } from '@/lib/tool-config'

export const TOOLS: ToolConfig[] = [
  cashVsPoints,
  // @new-tool:registry
]
`

describe('patchRegistry', () => {
  it('把 import 插在錨點前、registry 項目插在錨點前', () => {
    const result = patchRegistry(FIXTURE, "import bmi from './bmi.config'", 'bmi')
    expect(result).toContain("import bmi from './bmi.config'\n// @new-tool:imports")
    expect(result).toContain('  bmi,\n  // @new-tool:registry')
  })

  it('冪等：同一個 (importLine, registryEntry) 重複執行不會插兩次', () => {
    const once = patchRegistry(FIXTURE, "import bmi from './bmi.config'", 'bmi')
    const twice = patchRegistry(once, "import bmi from './bmi.config'", 'bmi')
    expect(twice).toBe(once)
    expect(twice.match(/import bmi from/g)).toHaveLength(1)
    expect(twice.match(/^\s*bmi,$/m)).toHaveLength(1)
  })

  it('沒有錨點時丟出明確錯誤', () => {
    expect(() => patchRegistry('const x = 1', "import bmi from './bmi.config'", 'bmi')).toThrow(/錨點/)
  })

  it('插入後原本已有的項目不受影響', () => {
    const result = patchRegistry(FIXTURE, "import bmi from './bmi.config'", 'bmi')
    expect(result).toContain('cashVsPoints,')
  })
})

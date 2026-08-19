import { describe, expect, it } from 'vitest'
import {
  renderToolConfig,
  renderRegistryPatch,
  renderToolTest,
  slugToImportName,
} from '../../scripts/lib/render-tool-config'

describe('slugToImportName', () => {
  it('kebab-case 轉 camelCase', () => {
    expect(slugToImportName('cash-vs-points')).toBe('cashVsPoints')
    expect(slugToImportName('bmi')).toBe('bmi')
    expect(slugToImportName('a-b-c')).toBe('aBC')
  })
})

describe('renderToolConfig', () => {
  it('產出的內容含 slug/name/description，且 compute 回傳的 placeholder 跟 outputs 的 stat key 對得上', () => {
    const content = renderToolConfig({
      slug: 'bmi',
      name: 'BMI Calculator',
      description: 'desc',
      inputs: [{ key: 'heightCm', label: 'Height', type: 'number', default: 170, min: 50, max: 250 }],
    })
    expect(content).toContain(JSON.stringify('bmi'))
    expect(content).toContain(JSON.stringify('BMI Calculator'))
    expect(content).toContain("placeholder: 0")
    expect(content).toContain("key: 'placeholder'")
  })

  it('沒有 inputs 時留 TODO 註解，不會產出空陣列語法錯誤', () => {
    const content = renderToolConfig({ slug: 'empty', name: 'Empty', description: 'd', inputs: [] })
    expect(content).toContain('TODO: 加輸入欄位')
  })

  it('select 型別欄位會展開 options', () => {
    const content = renderToolConfig({
      slug: 'pick',
      name: 'Pick',
      description: 'd',
      inputs: [
        {
          key: 'choice',
          label: 'Choice',
          type: 'select',
          default: 'a',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B' },
          ],
        },
      ],
    })
    expect(content).toContain("type: 'select'")
    expect(content).toContain(JSON.stringify('a'))
    expect(content).toContain(JSON.stringify('b'))
  })

  it('字串內含單引號用 JSON.stringify 逸出，不會弄壞語法', () => {
    const content = renderToolConfig({ slug: 'x', name: "Nadia's Tool", description: 'd', inputs: [] })
    expect(content).toContain(JSON.stringify("Nadia's Tool"))
  })
})

describe('renderRegistryPatch', () => {
  it('回傳正確的 import line 與 registry entry', () => {
    expect(renderRegistryPatch('bmi')).toEqual({
      importLine: "import bmi from './bmi.config'",
      registryEntry: 'bmi',
    })
    expect(renderRegistryPatch('cash-vs-points')).toEqual({
      importLine: "import cashVsPoints from './cash-vs-points.config'",
      registryEntry: 'cashVsPoints',
    })
  })
})

describe('renderToolTest', () => {
  it('產出的測試檔含 import 與 getTool 斷言', () => {
    const content = renderToolTest('bmi')
    expect(content).toContain("import config from '@/tools/bmi.config'")
    expect(content).toContain("getTool(\"bmi\")")
  })
})

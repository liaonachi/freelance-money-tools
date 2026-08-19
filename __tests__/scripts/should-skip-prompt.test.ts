import { describe, expect, it } from 'vitest'
import { shouldSkipPrompt } from '../../scripts/lib/should-skip-prompt'

describe('shouldSkipPrompt', () => {
  it('非 TTY 一律跳過，即使沒有任何 flag/option', () => {
    expect(shouldSkipPrompt(new Set(), {}, false)).toBe(true)
  })

  it('TTY 但完全沒有 flag/option 時要互動詢問', () => {
    expect(shouldSkipPrompt(new Set(), {}, true)).toBe(false)
  })

  it('TTY 但有 --yes 這個 flag 時跳過', () => {
    expect(shouldSkipPrompt(new Set(['yes']), {}, true)).toBe(true)
  })

  it('TTY 但有任何其他 flag（非 --yes）也跳過', () => {
    expect(shouldSkipPrompt(new Set(['force']), {}, true)).toBe(true)
  })

  it('TTY 但有任何 option（例如 --name）也跳過', () => {
    expect(shouldSkipPrompt(new Set(), { name: 'Foo' }, true)).toBe(true)
  })
})

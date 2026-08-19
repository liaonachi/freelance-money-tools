import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { constantTimeEqual, getSessionToken, validateSession } from '@/lib/admin-auth'

describe('admin-auth', () => {
  const originalPassword = process.env.ADMIN_PASSWORD
  const originalSecret = process.env.ADMIN_SESSION_SECRET

  beforeEach(() => {
    process.env.ADMIN_PASSWORD = 'correct-horse-battery-staple'
    process.env.ADMIN_SESSION_SECRET = 'test-only-secret'
  })

  afterEach(() => {
    process.env.ADMIN_PASSWORD = originalPassword
    process.env.ADMIN_SESSION_SECRET = originalSecret
  })

  it('env 缺失時 getSessionToken／validateSession 一律回 false/空字串（fail-closed）', async () => {
    delete process.env.ADMIN_SESSION_SECRET
    expect(await getSessionToken(Date.now())).toBe('')

    delete process.env.ADMIN_PASSWORD
    expect(await validateSession('123.abc')).toBe(false)
  })

  it('偽造或格式錯誤的 cookie 值一律回 false', async () => {
    expect(await validateSession(undefined)).toBe(false)
    expect(await validateSession('')).toBe(false)
    expect(await validateSession('not-a-valid-token')).toBe(false)
    expect(await validateSession('123456.deadbeef')).toBe(false)
  })

  it('合法簽章的 token 通過驗證', async () => {
    const token = await getSessionToken(Date.now())
    expect(token).not.toBe('')
    expect(await validateSession(token)).toBe(true)
  })

  it('過期的 token（超過 7 天）驗證失敗', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000
    const token = await getSessionToken(eightDaysAgo)
    expect(await validateSession(token)).toBe(false)
  })

  it('constantTimeEqual 正確比對字串', () => {
    expect(constantTimeEqual('abc', 'abc')).toBe(true)
    expect(constantTimeEqual('abc', 'abd')).toBe(false)
    expect(constantTimeEqual('abc', 'ab')).toBe(false)
  })
})

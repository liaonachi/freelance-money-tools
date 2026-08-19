export const ADMIN_COOKIE = 'site_admin_session'

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 7 * 1000 // 7 天，跟 cookie maxAge 對齊

function hasAuthEnv(): boolean {
  return !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_SESSION_SECRET
}

/** 邊界安全（timing-safe）字串比對，避免密碼／簽章比對洩漏長度以外的時間資訊 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * cookie 值 = `<issuedAt>.<HMAC-SHA256 簽章>`，簽章對象是 `admin:<issuedAt>`。
 * 不放明文密碼進 cookie（舊版 btoa(password) 拿到 cookie 就等於拿到密碼），
 * 且驗證端可無狀態重算簽章比對，不需要伺服器端 session store。
 */
export async function getSessionToken(issuedAt: number): Promise<string> {
  if (!hasAuthEnv()) return ''
  const signature = await hmacHex(process.env.ADMIN_SESSION_SECRET!, `admin:${issuedAt}`)
  return `${issuedAt}.${signature}`
}

export async function validateSession(value: string | undefined): Promise<boolean> {
  if (!hasAuthEnv() || !value) return false

  const [issuedAtStr, signature] = value.split('.')
  if (!issuedAtStr || !signature) return false

  const issuedAt = Number(issuedAtStr)
  if (!Number.isFinite(issuedAt)) return false
  if (issuedAt > Date.now() || Date.now() - issuedAt > SESSION_MAX_AGE_MS) return false

  const expected = await hmacHex(process.env.ADMIN_SESSION_SECRET!, `admin:${issuedAt}`)
  return constantTimeEqual(signature, expected)
}

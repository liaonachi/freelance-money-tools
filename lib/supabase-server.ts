import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

export function hasSupabaseEnv(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

/**
 * 母版沒有自己的 Supabase 專案，env 缺失時回傳 no-op client，
 * 讓 blog 頁在 build / 沒接資料庫的情況下優雅回空陣列而不是 crash。
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient<Database>> {
  if (!hasSupabaseEnv()) {
    return createNoopClient()
  }

  const cookieStore = await cookies()

  // createServerClient<Database> 在 @supabase/ssr v0.5 與 supabase-js v2.108 泛型不相容，
  // 改為不傳泛型再 cast，讓 SupabaseClient<Database> 正確解析 Schema
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中無法設定 cookie，忽略
          }
        },
      },
    }
  )
  return client as unknown as SupabaseClient<Database>
}

/** Service Role Client — 僅用於 Server Actions 和 API Routes */
export function createSupabaseServiceClient(): SupabaseClient<Database> {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createNoopClient()
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function createNoopClient(): SupabaseClient<Database> {
  const builder: Record<string, unknown> = {}
  const chain = (): typeof builder => builder

  Object.assign(builder, {
    select: chain,
    insert: chain,
    update: chain,
    delete: chain,
    eq: chain,
    order: chain,
    single: async () => ({ data: null, error: null }),
    then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
      resolve({ data: [], error: null }),
  })

  return {
    from: () => builder,
  } as unknown as SupabaseClient<Database>
}

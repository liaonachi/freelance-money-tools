import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'pg'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SCHEMA_PATH = resolve(ROOT, 'supabase/schema.sql')

async function main(): Promise<void> {
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString) {
    console.error('缺少 SUPABASE_DB_URL 環境變數，請先在 .env.local 設定後再執行 npm run db:apply')
    process.exit(1)
  }

  const schemaSql = readFileSync(SCHEMA_PATH, 'utf-8')

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
    const result = await client.query(schemaSql)
    const statementCount = Array.isArray(result) ? result.length : 1
    console.log(`已套用 supabase/schema.sql（${statementCount} 個語句），連線資料庫成功`)
  } catch (error) {
    console.error('套用 supabase/schema.sql 失敗:')
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()

# Cherry-pick 母版 db:apply 修正(從 seo-tool-site-starter)

> 類型:工程/工具鏈修正,影響範圍:`package.json`(`db:apply` script + 新增 `pg`/`@types/pg` devDependency)、新增 `scripts/db-apply.ts`、`supabase/schema.sql` 檔頭註解、`CLAUDE.md` 已知陷阱,不改動:`supabase/schema.sql` 本身的表格定義、其他 scripts

## 背景

母版 `seo-tool-site-starter` 的 `db:apply` 一直沒真的套用 `supabase/schema.sql`(`package.json` 裡是 `npx supabase db push` 這個沒接上的捷徑,只會推不存在的 `supabase/migrations/*.sql`)這個問題,已經在母版修好並驗證過(commit `b1c9063`,見 `seo-tool-site-starter/specs/fix-db-apply.md` 的 `## 結果`:新增 `scripts/db-apply.ts`、用真實 Supabase 測試專案驗證套用+冪等都成功)。

這個專案(fork 自 `seo-tool-site-starter`)當初建立 Supabase 專案跟後續 `communities` 表都是繞過(Supabase MCP `apply_migration`)完成的,`db:apply` 本身還是壞的沒修。現在把母版這個修正原樣搬過來,補齊工具鏈,以後這個專案要套用 schema 變更時 `npm run db:apply` 才會真的動作。

## 要做的

1. 把 `seo-tool-site-starter/scripts/db-apply.ts` 原樣複製過來(這個專案沒有的檔案,直接抄,不用重寫邏輯)
2. `package.json`:
   - `db:apply` script 改成 `"node --env-file-if-exists=.env.local scripts/db-apply.ts"`(注意不是單純 `node scripts/db-apply.ts`——母版第一次跑的時候踩過純 `node` 不會自動讀 `.env.local` 這個坑,已經修過,這次直接抄修好之後的版本)
   - 新增 devDependency `pg`、`@types/pg`(版本抄母版目前 `package.json`/`package-lock.json` 裡實際安裝的版本,不用自己另外挑版本)
3. `supabase/schema.sql` 檔頭註解:如果這個專案的版本也還寫著「Apply: `npm run db:apply`(= `npx supabase db push`)」這種舊描述,比照母版改成準確反映新行為的說法
4. `CLAUDE.md`:比照母版「已知陷阱」補上同一條(`node --env-file-if-exists` 那個踩坑紀錄),用這個專案已有的陷阱編號接續往下編,不要照抄母版的編號

## 不做的

- 不改 `supabase/schema.sql` 的表格/欄位定義內容
- 不引入 Supabase CLI 的 migration 檔案模式,維持「單一 schema.sql 檔案是 source of truth」
- 不重新設計 `db-apply.ts` 的邏輯,母版驗證過的版本原樣抄就好,除非這個專案有母版沒有的特殊狀況(例如已經有同名檔案衝突),遇到才回報

## 驗收方式

- [ ] `scripts/db-apply.ts` 存在,內容跟母版一致(或有差異要說明為什麼)
- [ ] `npm run db:apply` 對這個專案現有(已經在跑的)Supabase 專案執行一次,確認能正常連線套用、exit code 0——**這是對正式環境的 DB 操作,執行前務必先確認**:因為 `schema.sql` 已經是冪等寫法,理論上重複套用安全,但這是第一次在這個專案真正跑這支腳本,動手前列出風險評估,等我回覆再執行
- [ ] 執行後用 Supabase MCP `list_tables`/`execute_sql`(唯讀)交叉驗證,確認沒有任何表被意外改動或清空
- [ ] `npx tsc --noEmit`、`npm test`、`npm run build` 全過
- [ ] `CLAUDE.md`、`supabase/schema.sql` 檔頭註解已同步更新
- [ ] commit + push,commit message 例如 `chore(tooling): cherry-pick 母版 db:apply 修正(scripts/db-apply.ts)`
- [ ] 把實際執行結果、有沒有跟母版不一樣的地方,追加到本 spec 末尾的 `## 結果`

## 結果

### Plan(尚未動工,等回覆後才執行)

**調查結果(已做,唯讀操作)**

- 母版 `seo-tool-site-starter`(本機路徑 `~/Documents/Claude/Projects/seo-tool-site-starter`)commit `b1c9063` 已確認存在,`scripts/db-apply.ts`(37 行)、`package.json` `db:apply` script、`supabase/schema.sql` 檔頭註解、`CLAUDE.md` 已知陷阱第 13 條都已核對過內容,可直接原樣抄。
- 這個專案目前 `db:apply` 還是舊的 `"npx supabase db push"`,`package.json` 沒有 `pg`/`@types/pg`。
- 用 Supabase MCP `list_tables`(唯讀)查過這個專案現有正式環境:**只有 `blog_posts` 一張表**(RLS 已開,3 筆資料),跟 `supabase/schema.sql` 內容完全一致。
- **發現 spec 背景描述有誤**:第 9 行寫「後續 `communities` 表都是繞過…完成的」,但這個專案(freelance-money-tools)實際上沒有 `communities` 表,`schema.sql` 裡也沒有這張表的定義——這句話應該是套用共用 spec 模板時沒改到、殘留自其他專案的文字。不影響這次任務本身(這次不動表格定義),但先在這裡標記出來,執行完後 commit message / spec 不要延續這個錯誤描述。
- `.env.local` 已有 `SUPABASE_DB_URL`(唯讀確認長度,沒印出內容)。

**實作步驟**

1. `scripts/db-apply.ts`:從母版原樣複製(讀 `SUPABASE_DB_URL`、`pg` 的 `Client` 連線、`client.query(schemaSql)` 套用整份 `supabase/schema.sql`、`ssl: { rejectUnauthorized: false }`、錯誤時 `process.exitCode = 1`)。
2. `package.json`:
   - `db:apply` 改成 `"node --env-file-if-exists=.env.local scripts/db-apply.ts"`
   - 新增 devDependency `"pg": "^8.23.0"`、`"@types/pg": "^8.23.1"`(抄母版目前鎖定的版本),接著跑 `npm install` 讓 `package-lock.json` 同步更新
3. `supabase/schema.sql` 檔頭第 3 行,把「Apply: `npm run db:apply`(= `npx supabase db push`)」改成母版現用的說法:「Apply: `npm run db:apply`(執行 `scripts/db-apply.ts`,直接連線套用整份檔案,不是 Supabase CLI migration 模式)」
4. `CLAUDE.md` 已知陷阱:接續現有編號到第 12 條(母版是第 13 條,編號不同,內容比照抄),文字比照母版「純 `node` 執行 `.ts` 腳本不會自動讀 `.env.local`…」那條,把腳本路徑換成這個專案的
5. 跑驗收:`npx tsc --noEmit`、`npm test`、`npm run build` 全過
6. **在這裡停下來,等使用者回覆確認後才執行 `npm run db:apply`**(見下方風險評估)
7. 執行 `npm run db:apply` 後,用 Supabase MCP `list_tables` + `execute_sql`(唯讀,例如 `SELECT count(*) FROM blog_posts`)交叉驗證,確認表結構與列數(基準值:1 張表 `blog_posts`、3 筆)跟執行前一致
8. commit + push,message:`chore(tooling): cherry-pick 母版 db:apply 修正(scripts/db-apply.ts)`
9. 把實際執行結果追加回這個區塊

**`npm run db:apply` 對正式環境執行 — 風險評估**

- **目標環境**:這個指令會用 `.env.local` 的 `SUPABASE_DB_URL` 直連這個站台正式在用的 Supabase 專案(`seo-demo`),不是 local/測試環境——**這個專案沒有 Supabase CLI local stack**,沒有「先在本機驗證再上正式」這條路可走,母版當初也是直接對它自己的測試專案跑的。
- **會執行什麼**:`client.query(schemaSql)` 把整份 `supabase/schema.sql`(80 行)當一段字串送出。pg 套件在沒有帶 parameterized values 時走 simple query protocol,同一段字串裡的多條語句會被 Postgres 視為**單一隱含 transaction**執行(除非字串裡自己寫了 `BEGIN`/`COMMIT`,這份 schema.sql 沒有)——也就是說如果中途有語句失敗,前面已執行的語句會一起 rollback,不會留下「套用一半」的狀態。
- **語句本身的破壞性**:逐條看過 `schema.sql`,只有 `CREATE TABLE IF NOT EXISTS`、`CREATE OR REPLACE FUNCTION`、`DROP TRIGGER IF EXISTS`(接著重建同名 trigger)、`ALTER TABLE … ENABLE ROW LEVEL SECURITY`、`DROP POLICY IF EXISTS`(接著重建同名 policy)——**沒有 `DROP TABLE`、`TRUNCATE`、`DELETE`、破壞性 `ALTER COLUMN`**,理論上對既有資料無害。
- **現況核對**:已用唯讀 `list_tables` 確認正式環境現在就是「只有 `blog_posts`,結構跟 `schema.sql` 一致」,代表這次執行預期是**完全冪等的重複套用**(等同 no-op),不是第一次建表。這降低了風險,但仍是第一次讓這支新腳本連線寫入,按 spec 要求還是要先問過再動手。
- **殘留風險**:
  1. 連線字串指向錯誤專案的可能性——沒辦法在不印出 secret 的前提下完全排除,只能確認 `.env.local` 裡的 key 是 `SUPABASE_DB_URL`(格式正確、長度合理)。
  2. `ssl: { rejectUnauthorized: false }` 關掉憑證驗證(母版原本就這樣寫,這次照抄不改)——連線仍是加密的,只是不驗證憑證鏈,存在中間人風險的理論可能性,但這是母版已驗證過的既有寫法,不在這次修正範圍內。
  3. 執行當下若剛好有 admin 後台在寫入 `blog_posts`(例如編輯文章觸發 `updated_at` trigger 或 revalidate webhook trigger),`schema.sql` 重建 trigger 的瞬間(`DROP TRIGGER` → `CREATE TRIGGER` 在同一個隱含 transaction 內)理論上有極短暫的鎖等待,但因為在同一 transaction 內完成,不會有 trigger 缺失的窗口期。
- **執行後如何確認沒有意外**:`list_tables` 表列表不變(仍只有 `blog_posts`)+ `execute_sql` 唯讀查 `SELECT count(*) FROM blog_posts` 應該還是 3 筆 + 隨手用 admin 後台或 `/blog` 頁面確認文章還在(非必要,但可作為人工雙重確認)。

**建議**:風險偏低(冪等 schema、無破壞性語句、隱含 transaction、現況已核對過跟 schema.sql 一致),但仍需使用者明確回覆「可以執行」後才會跑 `npm run db:apply` 這一步,其餘步驟(複製檔案、改 package.json/CLAUDE.md/schema.sql 註解、跑 tsc/test/build)會先進行。

### 執行結果(2026-08-24)

風險評估經使用者確認 OK,照上面 plan 依序動工,全部完成,跟母版沒有差異(原樣抄):

1. **`scripts/db-apply.ts`**:從母版 `seo-tool-site-starter`(commit `b1c9063`)原樣複製,37 行,內容一致。
2. **`package.json`**:
   - `db:apply` 改成 `"node --env-file-if-exists=.env.local scripts/db-apply.ts"`
   - 新增 devDependency `"pg": "^8.23.0"`、`"@types/pg": "^8.23.1"`(抄母版版本)
   - `npm install` 完成,`package-lock.json` 同步更新,新增 15 個套件,0 vulnerabilities
3. **`supabase/schema.sql`** 檔頭第 3 行:改成「Apply: `npm run db:apply`(執行 `scripts/db-apply.ts`,直接連線套用整份檔案,不是 Supabase CLI migration 模式)」,只動註解,表格定義完全沒改。
4. **`CLAUDE.md`** 已知陷阱新增第 12 條(母版是第 13 條,這個專案接續自己的編號,內容比照抄,腳本路徑換成本專案的)。

**驗收 checklist 結果**:

- [x] `scripts/db-apply.ts` 存在,內容跟母版一致
- [x] `npm run db:apply` 對這個專案正式環境執行一次:**exit code 0**,輸出「已套用 supabase/schema.sql（12 個語句），連線資料庫成功」(有一條 Node `MODULE_TYPELESS_PACKAGE_JSON` 效能警告,母版也有,預期行為不用處理)
- [x] 執行後用 Supabase MCP `list_tables`/`execute_sql`(唯讀)交叉驗證:表列表仍只有 `public.blog_posts`(RLS 開啟),`SELECT count(*) FROM blog_posts` 仍是 3 筆——跟執行前基準值完全一致,確認是完全冪等的 no-op,沒有任何表被意外改動或清空
- [x] `npx tsc --noEmit`:0 errors
- [x] `npm test`:19 個測試檔、108 個測試全過
- [x] `npm run build`:成功(22 個路由全部產出)
- [x] `CLAUDE.md`、`supabase/schema.sql` 檔頭註解已同步更新
- [x] commit + push(見下方 commit hash)

**跟母版的差異**:除了「已知陷阱」編號(這個專案是第 12 條,母版是第 13 條,因為兩邊既有陷阱數量不同)之外,`scripts/db-apply.ts`、`package.json` 的 `db:apply` script 與 `pg`/`@types/pg` 版本、`schema.sql` 檔頭註解文字,全部跟母版一致,沒有其他差異。

**補充發現**(不在這次任務範圍,僅記錄):`## 背景` 第 9 行提到「communities 表」是這個專案沒有的東西(用 `list_tables` 唯讀查證過,正式環境只有 `blog_posts`),應為套用共用 spec 模板時殘留的錯誤描述,之後寫這類 spec 時留意別延續。

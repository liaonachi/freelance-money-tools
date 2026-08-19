# SESSION-HANDOFF — Freelance Money Tools

> 給下一個接手對話看的現況快照。詳細步驟見 `specs/demo-site.md`。

## 目前進度

**Day 1–2 第 1、2 步完成（2026-08-19）：**

1. 從母版 `seo-tool-site-starter` clone → 重設 git history → 加 `upstream` remote → `gh repo create` 開 public repo（`liaonachi/freelance-money-tools`）
2. 刪母版專屬檔案（`specs/` 全換新、`docs/productized-service-offer.md`、`docs/upstream-changelog.md`），改寫 `CLAUDE.md` 成 demo 站版本
3. 跑 `npm run new:site`，站名／網域／locale／currency／timezone／主色皆已套用
4. 放 `.mcp.json.example`（Supabase CLI + `--access-token` 格式），確認 `.mcp.json` 在 `.gitignore`
5. commit `ba7c778`，push，CI 綠燈

**前置解除、cherry-pick 完成（同日）：**

- 母版補完 `specs/admin-faq-field.md`（admin FAQ 欄位，commit `01b08cc`）後，`git fetch upstream` + `git cherry-pick 01b08cc` 拉進這個 repo（commit `4c08e53`）。
- `CLAUDE.md`、`docs/handover.md` 兩個檔案有衝突（母版跟 demo 站各自都改了同一段），手動合併：`docs/handover.md` 保留 demo 站實際網址、套用母版新的 FAQ 文字；`CLAUDE.md` 保留 demo 站版本為主幹，把母版新增的兩條陷阱（gh 多 remote 抓錯 repo、`new:site` 非互動修正）改寫成 demo 站語氣後加回去。
- `npx tsc --noEmit` / `npm test`（102 passed）/ `npm run build` 全綠，push，CI 綠燈。
- 現在 admin 後台文章表單已經有 FAQ UI（`components/admin/PostForm.tsx`），可以進 Day 3 寫三個工具跟三篇文章了。

## 待辦（下一步）

- **Day 1–2 第 4 步完成（2026-08-19）**：`specs/tools.md` 寫定三個工具的公式、來源、faq 草案（hourly-rate／late-fee／tax-set-aside）。Day 3 `npm run new:tool` 直接照抄這份 spec 的 compute 邏輯，faq 草案定稿後填進 config。
- **Day 1–2 第 3 步（Supabase）完成（2026-08-19）**：重開 Code CLI 後 `mcp__supabase__*` 系列工具可見，帳號確認是 `liaonachi+seodemo@gmail.com's Org`（乾淨帳號，無 auto-publisher-dev/finhub-dev），建了專案 `seo-demo`（region `ap-northeast-1`，project ref `zogebhjbueuwqgebbzxc`，免費方案 $0/月）。`.env.local` 已填齊（URL／anon key／service role key／DB URL／`REVALIDATE_SECRET`／`ADMIN_PASSWORD`／`ADMIN_SESSION_SECRET`，皆亂數產生，未印在任何對話紀錄）。`.mcp.json` 補回 `--project-ref=zogebhjbueuwqgebbzxc`。`supabase/schema.sql`（含 `<VERCEL_DOMAIN>`→`freelance-money-tools.vercel.app`、`<REVALIDATE_SECRET>` 代入實際值）已套用到遠端 DB——**注意：套用時把佔位符換成實際值後直接送進 DB，`supabase/schema.sql` 這個被 commit 的檔案本身維持佔位符原樣**（避免把 REVALIDATE_SECRET 明碼寫進 public repo；下次要重套時用同樣的替換手法，不要直接改這個檔案）。`blog_posts` 表、`blog_posts_updated_at`／`blog_posts_revalidate_trigger` 兩個 trigger 都已確認存在且 enabled。
- Day 3 之後（Build／Review／Handover）：全部未開始，`.env.local` 已就緒，可以開始寫 `tools/*.config.ts` 跟文章（admin 可接 DB 發文章）。下一步是 Day 3 `npm run new:tool` 依 `specs/tools.md` 產三個工具。
- **Day 3–11 Build 完成（2026-08-19，本次只做工具＋文案＋文章，Vercel／GA4／GSC 明確排除留待下次）**：
  - 三個工具 `hourly-rate`／`late-fee`／`tax-set-aside` 用 `npm run new:tool --json` 起手，`compute()` 照 `specs/tools.md` 公式手寫，faq/cta/note 補齊，`__tests__/tools/*.test.ts` 各補了預設值、邊界值（除以零防護）、verdict 三分支的斷言。
  - **順手清掉母版帶來的 3 個範例工具**（`tip-calculator`／`cash-vs-points`／`points-value`，來自最初 `ba7c778` fork 時母版自帶的示範內容，不是這個站的東西）：連同它們的測試一起刪，`tools/index.ts` 手動清乾淨（`new:tool` 只會插入新項目，不會清舊的）。連帶修掉兩個吃這些範例 slug 的測試（`__tests__/tools-registry.test.ts`、`components/tools/ToolRenderer.test.tsx`），改用新工具當 fixture（select／toggle 互動也在這裡測到了，跟母版那份是分開的兩件事）。
  - 首頁不用改（本來就完全讀 `site.config.ts`／`TOOLS` 陣列渲染）；about／disclaimer **這次開工前發現已經是填好的英文內容**（`{{CONTACT}}` 留白），git blame 只到 `ba7c778`，但工作樹早就被改過還沒 commit——判斷是前一輪 Cowork 已經寫好檔案、等 Code CLI commit，這次一併收進同一批 commit。**下次开工前務必先 `git status`/`git diff` 看有沒有 Cowork 留下的未 commit 內容，不要預設乾淨**（這次差點漏看，是巧合先讀了檔案才發現內容跟預期的佔位符不一樣）。
  - 三篇文章（slug：`how-to-set-your-freelance-hourly-rate`／`late-payment-fees-for-freelancers`／`how-much-should-freelancers-set-aside-for-taxes`）直接用 service role + `@supabase/supabase-js` 寫進 `blog_posts`，`status='published'`，各帶 3 條 `faq_jsonld`、至少 1 個 `/tools/<slug>` 內連。沒有透過 admin UI 手動貼，效果等價（同一張表，同一組欄位）。
  - select／toggle 的 ToolRenderer 互動測試依規則寫在**母版** `seo-tool-site-starter`（另開 fork agent 處理，commit hash 見下次更新或直接查母版 `git log`），完成後要 `git fetch upstream` + cherry-pick 回這個 repo。

## 已知坑

- 本機沒設 SSH key 給 GitHub（`git@github.com` host key verification failed），母版 spec 裡的 clone/remote 指令改用 https 完成，跟母版 origin 的協定一致。`gh auth status` 顯示 CLI 走 https，這條路可靠。
- 這個目錄同時有 `origin`（這個 repo）跟 `upstream`（母版）兩個 remote，`gh run list`／`gh repo view` 沒先 `gh repo set-default liaonachi/freelance-money-tools` 會抓到母版，查 CI 狀態會查錯 repo。
- `git cherry-pick` 母版更新時，`CLAUDE.md`／`docs/*.md` 這類兩邊都會各自客製的檔案幾乎必衝突，要手動合併，不能預期乾淨套用；`site.config.ts`／`specs/`／README 這種單純被覆寫的檔案沒事。
- **專案層級 `.mcp.json` 改完不會馬上生效**：Code CLI 這個 session 是在 `.mcp.json` 填好 PAT 之前就啟動的，即使檔案已經存在且內容正確，session 內 `ToolSearch` 還是只看得到啟動當下就有的 connector（`claude.ai Supabase`），看不到新加的 `supabase` server。改 `.mcp.json`（新增/修改 server）之後一定要重開 Code CLI 才會載入；不要因為看到「有 Supabase MCP 工具」就假設是對的那一個——先看工具名稱前綴（專案層級的會是 `mcp__supabase__*`，不是 `mcp__claude_ai_Supabase__*`）跟 `list_organizations`/`list_projects` 回傳內容，確認帳號對了再動手，尤其是「建立」類操作（`create_project`）沒有 undo。
- **檢查 `.mcp.json` 內容絕對不要用會印出整段 JSON 的指令**（`cat`、沒過濾的 `sed`…）：BSD sed（macOS 內建）用 `\{n,\}` 區間量詞遮罩長字串曾經整段失效（沒報錯、也沒遮住），PAT 因此完整明碼進了對話紀錄一次，只能事後提醒撤銷重發，補救不了已經寫進 transcript 的部分。之後檢查改用 `jq` 配合明確的 key path（例如 `jq '.mcpServers.supabase.args | map(if startswith("--access-token=") then "[REDACTED]" else . end)'`），或乾脆整段不印、只印「有沒有值／長度」。
- **需要把 secret 直接寫進要 commit 的檔案（例如這次的 `supabase/schema.sql` 佔位符代入）時，不要真的改動被追蹤的檔案**：改用 script 在本機把佔位符換成實際值、直接送進資料庫（這次用 `npx supabase db query -f <file> --db-url "$SUPABASE_DB_URL"`，DB_URL／secret 全部從 `.env.local` 讀，不經過我自己的輸出）；被 git 追蹤的原始檔維持佔位符樣子，這樣才能公開 repo 也不洩漏，且母版模板可以重複給下一個客戶用。
- **`npx supabase db query -f <file>`（單次呼叫）不支援一個檔案裡塞多條 SQL 敘述**：會報 `cannot insert multiple commands into a prepared statement`；要嘛拆成一條一條分開呼叫，要嘛換工具。手寫 SQL statement splitter 時，`--` 單行註解一定要在判斷字串邊界（`'`）之前先處理掉，不然註解裡剛好出現的單引號（例如 `-- 'draft' | 'published'` 這種 schema 欄位註解）會讓 parser 誤判還在字串裡，吞掉後面一大段真正的 SQL（這次真實發生：`CREATE TABLE`／`CREATE FUNCTION`／`ALTER TABLE` 都因此消失，第一時間看起來像是「敘述數量對不上」，其實是被吞掉丟棄）。

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
  - **順手清掉母版帶來的 3 個範例工具**（`tip-calculator`／`cash-vs-points`／`points-value`，來自最初 `ba7c778` fork 時母版自帶的示範內容，不是這個站的東西）：連同它們的測試一起刪，`tools/index.ts` 手動清乾淨（`new:tool` 只會插入新項目，不會清舊的）。連帶修掉兩個吃這些範例 slug 的測試（`__tests__/tools-registry.test.ts`、`components/tools/ToolRenderer.test.tsx`），改用新工具當 fixture——demo 這邊因此也順帶測到了 select（late-fee 的 rateType）／toggle（tax-set-aside 的 includeSelfEmploymentTax）互動，但這只是「調整既有 fixture」的副作用，不算是規則要求的「母版先做」那份。
  - 首頁不用改（本來就完全讀 `site.config.ts`／`TOOLS` 陣列渲染）。about／disclaimer 這次開工時檢查是母版原生的 `{{ABOUT_INTRO}}`／`{{CONTACT_INFO}}` 佔位符（不是「已經填好」——先前這裡的判斷是誤判，工作樹沒有 Cowork 留下的未 commit 內容），本次直接補上英文文案：about 一段介紹＋連到母版 GitHub＋「built on the SEO Tool Site Starter by Nadia」，聯絡方式留白統一改用 `{{CONTACT}}`（跟 `docs/handover.md` 既有 marker 一致，不是 `{{CONTACT_INFO}}`）；disclaimer 加「not financial, tax, or legal advice」一段＋affiliate 段落（目前無 affiliate link）。
  - 三篇文章（slug：`how-to-set-your-freelance-hourly-rate`／`late-payment-fees-for-freelancers`／`how-much-should-freelancers-set-aside-for-taxes`）直接用 service role + `@supabase/supabase-js` 寫進 `blog_posts`（`status='published'`，各 897–937 字、3 條 `faq_jsonld`、至少 1 個 `/tools/<slug>` 內連），已用 `mcp__supabase__execute_sql` 查表確認 3 筆都在。沒有透過 admin UI 手動貼，效果等價（同一張表，同一組欄位）。
  - **select／toggle 的 ToolRenderer 互動測試依規則補在母版**（commit `8abd49b`，`test(tool-engine): 補 select/toggle ToolRenderer 互動測試`）：母版原本 3 個 example 工具全是 number 欄位，沒有現成的 select/toggle 客戶案可測，所以在母版新增第 4 個 example `tools/discount-calculator.config.ts` 專門補這個測試缺口（見母版 `specs/tool-engine.md`「2026-08-19 更新」）。**這個 commit 刻意沒有 cherry-pick 回這個 repo**：`discount-calculator` 是母版專屬的表達力驗證 example，cherry-pick 進來會變成第 4 個工具，違反 `specs/demo-site.md`「不做的」第一條；demo 這邊已經有自己等價的 select/toggle 覆蓋（上一條，用 late-fee／tax-set-aside 當 fixture），功能上不缺這塊。
  - **坑：一開始派了一個背景 fork 去母版做 select/toggle 測試，跑了 23 分鐘、94 次工具呼叫、燒了約 30 萬 token，最後在母版 repo 完全沒留下任何 commit（`git status`/`git log` 都乾淨）**——判斷是 fork 卡住或迷失方向，`task-notification` 回來的 `result` 欄位也只是一句不相干的話，不是真的完成報告。之後沒再重試 fork，直接自己動手做完。**教訓：`Agent(subagent_type: "fork")` 完成通知不能只看 `status: completed` 就信任內容有做完，要去目標 repo 跑 `git log`/`git status` 對一下，尤其是花了異常長時間（母版這次遠超正常「補幾個測試」該花的時間量級）的情況。**
  - **坑：這個對話中途我懷疑 repo 被另一個 session 同時改（`git status`/檔案內容在幾次 Read 之間對不上、`Edit` 報 "modified since read"），用 `ListAgents` 查到一個 peer session 還特地發訊息去問，結果對方確認完全没碰過這個 repo。後來用 `lsof +D <repo>` 確認全程只有這個 session 的 process（PID）打開這個目錄，才排除「外部 process 同時在寫」的假設。** 最合理的解釋：這個對話前段已經做了大量工作（含一次 `git commit` `8599fc9`），但因為對話被自動摘要（compact），我看不到那段逐字記錄，只能從磁碟現狀反推——`git status --short` 乾淨不代表「還沒做」，一定要先 `git log` 看有沒有已經存在但還沒 push 的 commit，不要只看 status。這次還連帶踩到一次小坑：在這個誤判排查期間對 `specs/SESSION-HANDOFF.md` 做的一次修正編輯，後來發現內容又跑掉（懷疑編輯發生在已經存在但當下還沒察覺的那個 commit 之前，commit 之後這個編輯就變成孤立的未追蹤修改，又在某個沒能重現的時間點消失）——重新編輯一次、確認寫入生效後才收尾。

- **文章匯出成檔案 + Vercel 上線（2026-08-19，同日稍晚）**：
  - 三篇文章從 `blog_posts` 匯出成 `content/articles/<slug>.md`（YAML frontmatter: title/slug/excerpt/status/faq + Markdown 內文），改成這幾個檔案是 source of truth；新增 `scripts/seed-articles.ts`（純 node 執行，讀 `.env.local` 的 service role key，用 `gray-matter` 解析 frontmatter，upsert 進 `blog_posts`；`published_at` 只在第一次發布時設值，重跑不會把已發布文章的日期蓋成現在）+ `package.json` 的 `npm run seed:articles`。新加了 `gray-matter` 這個 dependency（母版沒有的第一個 npm 套件，純粹為了 frontmatter 解析，很小很標準）。
  - **Vercel**：`vercel link --project freelance-money-tools`（Nadia 已登入 CLI）建了專案，`prj_CaDnvCmVKj41Lq43RX1HtkOJ7xN9`；`.env.local` 7 個變數都用 `vercel env add` 個別設進 Production（沒印值）；`vercel deploy --prod` 成功，alias 到 `https://freelance-money-tools.vercel.app`。首頁／三個工具／三篇文章／`sitemap.xml`／`robots.txt`／about／disclaimer 全部驗證 200，`<html lang="en">`，teal 主色（`--site-primary:#0f766e`）確認。
  - **webhook 驗證**：直接在 DB 改一篇文章標題（等同 admin 操作的同一條路徑）加一個 `!`，2 秒內前台就反映出來，確認沒問題後改回原文字。
  - **GSC：卡住，需要 Nadia 親自處理**——建 URL-prefix property＋HTML 檔驗證都要求登入 Google 帳號在瀏覽器操作，這個環境沒有瀏覽器也沒有 GSC OAuth 憑證／service account，無法用 API 或 CLI 完成。sitemap 本身已經正常（見上），Nadia 建好 property 後直接提交 `https://freelance-money-tools.vercel.app/sitemap.xml` 就好。
  - **坑（這次最嚴重的一次）：查 Supabase trigger function 的原始碼（`SELECT prosrc FROM pg_proc ...`）想確認 webhook 網域對不對，沒意識到 `prosrc` 裡連帶存著寫死的 `REVALIDATE_SECRET` 明碼，兩次查詢都把完整 secret 印進了對話（第一次用天真的 `SELECT prosrc`，第二次想用正則裁切結果，但那個 URL 沒有 `&` 分隔，裁切失敗又整段印出來）。兩次都立刻轉了新的 `REVALIDATE_SECRET`（`.env.local`＋Vercel Production＋DB trigger function 三處同步更新，過程用 script 從 `.env.local` 讀值、不經過我自己的輸出），最後改用 `split_part(prosrc, 'secret=', 1)` 只取 `secret=` 之前的部分驗證網域，才安全。**教訓：任何會回傳「函式/觸發器原始碼」「完整 SQL 定義」的查詢，都要先假設裡面可能藏著寫死的密鑰，不能只因為查的是 schema 結構就掉以輕心；要驗證某個值的存在或長度，用 `length()`／`split_part()` 只取安全片段，絕對不要整段選出來看。**

- **admin 密碼重設收尾（2026-08-22，`specs/admin-password-reset.md`）**：上一輪 QA（同日稍早）記錄的「本機 `.env.local` 的 `ADMIN_PASSWORD` 打進正式站登入失敗，懷疑跟 Vercel 不一致」是誤判。**真正原因是測試 script 的 bug**：`page.click('button[type="submit"]')` 選到的是 `app/admin/layout.tsx` 頁首的「Log out」按鈕（這個共用 layout 連未登入的 `/admin/login` 頁本身都會渲染出來，登入頁上同時有登入表單跟頁首兩個 `type="submit"` 按鈕），送出的是 `logoutAction`，跟密碼對不對無關——本機 `npm run dev` 重現、對照 server log 印出 `└─ ƒ logoutAction()` 才抓到根因。改成 scope 到密碼欄位所在 `<form>` 內找按鈕後，本機／正式站都一次登入成功，拿到有效 `site_admin_session` cookie。**已重設 `ADMIN_PASSWORD`**（Vercel Production + 本機 `.env.local` 同步，新值 32 bytes 隨機，全程只驗證長度／前綴，未印明文；過程中一度踩到 `vercel env add` 用 stdin pipe 傳值時实际寫入空字串的坑——Production 環境變數預設是 sensitive、`vercel env pull` 讀不回明文，光看 pull 結果是空的不能當作「沒寫進去」的證據，最後改用 `vercel env add NAME production --value "$VAR"` 這個明確的非互動旗標才穩定寫入）——重設本身是良好衛生習慣，不代表舊密碼真的錯。第 5 張截圖（`docs/screenshots/04-admin-posts.png`）已補上，5/5 張齊全。**小小的產品面 UX 瑕疵記一筆給之後參考**（這次沒動）：未登入時 `/admin/login` 頁首不該出現「Log out」按鈕，`app/admin/layout.tsx` 目前對 `/admin/*` 全部路徑一視同仁渲染頁首；母版 `seo-tool-site-starter` 的同一個檔案很可能有一樣的結構，要修建議先進母版。

## 已知坑

- 本機沒設 SSH key 給 GitHub（`git@github.com` host key verification failed），母版 spec 裡的 clone/remote 指令改用 https 完成，跟母版 origin 的協定一致。`gh auth status` 顯示 CLI 走 https，這條路可靠。
- 這個目錄同時有 `origin`（這個 repo）跟 `upstream`（母版）兩個 remote，`gh run list`／`gh repo view` 沒先 `gh repo set-default liaonachi/freelance-money-tools` 會抓到母版，查 CI 狀態會查錯 repo。
- `git cherry-pick` 母版更新時，`CLAUDE.md`／`docs/*.md` 這類兩邊都會各自客製的檔案幾乎必衝突，要手動合併，不能預期乾淨套用；`site.config.ts`／`specs/`／README 這種單純被覆寫的檔案沒事。
- **專案層級 `.mcp.json` 改完不會馬上生效**：Code CLI 這個 session 是在 `.mcp.json` 填好 PAT 之前就啟動的，即使檔案已經存在且內容正確，session 內 `ToolSearch` 還是只看得到啟動當下就有的 connector（`claude.ai Supabase`），看不到新加的 `supabase` server。改 `.mcp.json`（新增/修改 server）之後一定要重開 Code CLI 才會載入；不要因為看到「有 Supabase MCP 工具」就假設是對的那一個——先看工具名稱前綴（專案層級的會是 `mcp__supabase__*`，不是 `mcp__claude_ai_Supabase__*`）跟 `list_organizations`/`list_projects` 回傳內容，確認帳號對了再動手，尤其是「建立」類操作（`create_project`）沒有 undo。
- **檢查 `.mcp.json` 內容絕對不要用會印出整段 JSON 的指令**（`cat`、沒過濾的 `sed`…）：BSD sed（macOS 內建）用 `\{n,\}` 區間量詞遮罩長字串曾經整段失效（沒報錯、也沒遮住），PAT 因此完整明碼進了對話紀錄一次，只能事後提醒撤銷重發，補救不了已經寫進 transcript 的部分。之後檢查改用 `jq` 配合明確的 key path（例如 `jq '.mcpServers.supabase.args | map(if startswith("--access-token=") then "[REDACTED]" else . end)'`），或乾脆整段不印、只印「有沒有值／長度」。
- **需要把 secret 直接寫進要 commit 的檔案（例如這次的 `supabase/schema.sql` 佔位符代入）時，不要真的改動被追蹤的檔案**：改用 script 在本機把佔位符換成實際值、直接送進資料庫（這次用 `npx supabase db query -f <file> --db-url "$SUPABASE_DB_URL"`，DB_URL／secret 全部從 `.env.local` 讀，不經過我自己的輸出）；被 git 追蹤的原始檔維持佔位符樣子，這樣才能公開 repo 也不洩漏，且母版模板可以重複給下一個客戶用。
- **`npx supabase db query -f <file>`（單次呼叫）不支援一個檔案裡塞多條 SQL 敘述**：會報 `cannot insert multiple commands into a prepared statement`；要嘛拆成一條一條分開呼叫，要嘛換工具。手寫 SQL statement splitter 時，`--` 單行註解一定要在判斷字串邊界（`'`）之前先處理掉，不然註解裡剛好出現的單引號（例如 `-- 'draft' | 'published'` 這種 schema 欄位註解）會讓 parser 誤判還在字串裡，吞掉後面一大段真正的 SQL（這次真實發生：`CREATE TABLE`／`CREATE FUNCTION`／`ALTER TABLE` 都因此消失，第一時間看起來像是「敘述數量對不上」，其實是被吞掉丟棄）。

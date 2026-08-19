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
- **Day 1–2 第 3 步（Supabase）被卡住，尚未開始**：Nadia 已經把 `liaonachi+seodemo` 帳號的 PAT 填進這個 repo 的 `.mcp.json`（帳號層級，沒鎖 project-ref），但這個 session 讀不到這個專案層級的 MCP server——`ToolSearch` 只找得到既有的 `claude.ai Supabase` connector（帳號是另一個 `liaonachi's Org`，底下是 `auto-publisher-dev`／`finhub-dev`，不是 seodemo 這個新帳號），用錯帳號會把 `seo-demo` 專案建到錯的地方，所以沒有動手建。**下一個 session 開始前先確認 Code CLI 已重開**，重開後應該能看到 `mcp__supabase__*` 系列工具（server 名稱是 `supabase`，見 `.mcp.json`），確認過帳號（`list_organizations`／`list_projects` 應該是空的或全新帳號，不該看到 auto-publisher-dev/finhub-dev）才建 `seo-demo` 專案。
- Day 3 之後（Build／Review／Handover）：全部未開始，等 Supabase 專案建好、`.env.local` 填齊才能開始寫 `tools/*.config.ts` 跟文章（admin 要接 DB 才能發文章）。

## 已知坑

- 本機沒設 SSH key 給 GitHub（`git@github.com` host key verification failed），母版 spec 裡的 clone/remote 指令改用 https 完成，跟母版 origin 的協定一致。`gh auth status` 顯示 CLI 走 https，這條路可靠。
- 這個目錄同時有 `origin`（這個 repo）跟 `upstream`（母版）兩個 remote，`gh run list`／`gh repo view` 沒先 `gh repo set-default liaonachi/freelance-money-tools` 會抓到母版，查 CI 狀態會查錯 repo。
- `git cherry-pick` 母版更新時，`CLAUDE.md`／`docs/*.md` 這類兩邊都會各自客製的檔案幾乎必衝突，要手動合併，不能預期乾淨套用；`site.config.ts`／`specs/`／README 這種單純被覆寫的檔案沒事。
- **專案層級 `.mcp.json` 改完不會馬上生效**：Code CLI 這個 session 是在 `.mcp.json` 填好 PAT 之前就啟動的，即使檔案已經存在且內容正確，session 內 `ToolSearch` 還是只看得到啟動當下就有的 connector（`claude.ai Supabase`），看不到新加的 `supabase` server。改 `.mcp.json`（新增/修改 server）之後一定要重開 Code CLI 才會載入；不要因為看到「有 Supabase MCP 工具」就假設是對的那一個——先看工具名稱前綴（專案層級的會是 `mcp__supabase__*`，不是 `mcp__claude_ai_Supabase__*`）跟 `list_organizations`/`list_projects` 回傳內容，確認帳號對了再動手，尤其是「建立」類操作（`create_project`）沒有 undo。

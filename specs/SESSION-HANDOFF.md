# SESSION-HANDOFF — Freelance Money Tools

> 給下一個接手對話看的現況快照。詳細步驟見 `specs/demo-site.md`。

## 目前進度

**Day 1–2 第 1、2 步完成（2026-08-19）：**

1. 從母版 `seo-tool-site-starter` clone → 重設 git history → 加 `upstream` remote → `gh repo create` 開 public repo（`liaonachi/freelance-money-tools`）
2. 刪母版專屬檔案（`specs/` 全換新、`docs/productized-service-offer.md`、`docs/upstream-changelog.md`），改寫 `CLAUDE.md` 成 demo 站版本
3. 跑 `npm run new:site`，站名／網域／locale／currency／timezone／主色皆已套用
4. 放 `.mcp.json.example`（Supabase CLI + `--access-token` 格式），確認 `.mcp.json` 在 `.gitignore`

## 待辦（下一步）

- **前置未完成**：母版 `specs/admin-faq-field.md`（後台 FAQ 欄位）截至目前**尚未實作**（`lib/faq.ts` 不存在，`PostForm.tsx` 無 FAQ UI），demo 站三個工具與三篇文章都需要 FAQ——這個必須先在母版做完才能進 Day 3。
- Day 1–2 第 3 步：Supabase（`liaonachi+seodemo` PAT → 建 `seo-demo` 專案 → `.env.local` → `db:apply`）——**尚未開始**，需要 Nadia 提供 PAT。
- Day 1–2 第 4 步：三個工具 spec 寫進 `specs/tools.md`——**尚未開始**。
- Day 3 之後（Build／Review／Handover）：全部未開始。

## 已知坑

- 本機沒設 SSH key 給 GitHub（`git@github.com` host key verification failed），母版 spec 裡的 clone/remote 指令改用 https 完成，跟母版 origin 的協定一致。`gh auth status` 顯示 CLI 走 https，這條路可靠。

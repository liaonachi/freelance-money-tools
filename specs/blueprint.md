# blueprint — Freelance Money Tools

> 這是 [seo-tool-site-starter](https://github.com/liaonachi/seo-tool-site-starter)（母版，private）產出的第一個真實交付案，同時作為 Nadia 的 Upwork／Contra 作品集。詳細建置步驟與驗收見 `specs/demo-site.md`。

## 這是什麼

Freelance Money Tools — 給 freelancer 用的免費計算機小站：hourly rate、late fee、tax set-aside 三個工具 + 對應部落格文章。技術棧、目錄結構、開發慣例全部繼承母版（見本檔 `CLAUDE.md`），此檔只記這個站台特有的東西。

## 站台資訊

| 項目 | 值 |
|---|---|
| 站名 | Freelance Money Tools |
| 網域 | https://freelance-money-tools.vercel.app |
| locale / currency / timezone | en / USD / America/New_York |
| 主色 | `#0f766e` |
| Supabase 專案 | `seo-demo`（獨立帳號 `liaonachi+seodemo@gmail.com`，region ap-northeast-1） |

## 母版關係

- `upstream` remote 指向母版（`seo-tool-site-starter`），之後母版更新用 `git fetch upstream` + cherry-pick 拉進來，不做自動同步。
- **不在這個 repo 改引擎**：工具渲染引擎（`ToolRenderer`）、`site.config` schema、`messages/` 架構等改動一律先進母版，這裡只 cherry-pick。
- 母版專屬檔案（`docs/productized-service-offer.md`、`docs/upstream-changelog.md`、母版的 `specs/`）已在 fork 時移除，不需要也不會回填。

## 目前狀態

見 `specs/SESSION-HANDOFF.md`。

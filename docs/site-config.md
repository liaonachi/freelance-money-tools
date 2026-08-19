# `site.config.ts` 設定說明

客戶案的品牌／語系／網域／GA4／色系／nav 全部收斂在專案根目錄的 `site.config.ts` 這一個檔案。跑 `npm run new:site` 會問答式產出它；也可以直接手改。

## 欄位說明

| 欄位 | 說明 |
|---|---|
| `name` | 站名，出現在 `<title>`、Header logo、Footer、OG/Twitter meta |
| `description` | 一句話描述，首頁副標題與預設 meta description |
| `url` | 網域，**必須 `https://` 開頭、不能有尾斜線**。驅動 `sitemap.xml`、`robots.txt`、`metadataBase`、JSON-LD 的 `url` |
| `locale` | `'zh-TW'` 或 `'en'`（目前只支援這兩種，見「加第二個語系」）。驅動 `<html lang>`、OG locale、`messages/` 選字典、`lib/date.ts` 的日期格式 |
| `currency` | Intl 貨幣代碼（例如 `TWD`、`USD`），驅動 `ToolRenderer` 的金額格式化 |
| `timezone` | IANA 時區字串（例如 `Asia/Taipei`），驅動所有日期顯示 |
| `ga4Id` | GA4 Measurement ID；**空字串 = 不載入 gtag**（母版沒有自己的 GA4） |
| `theme.primary` | 品牌主色 hex，注入 CSS 變數 `--site-primary`，驅動所有 `bg-primary`／`text-primary`／`border-primary`／`ring-primary` 系列 Tailwind class |
| `nav` | Header 導覽列（陣列，`{ label, href }`），手機版選單也用同一份資料 |
| `footer.links` | Footer「關於」區塊的連結（陣列，`{ label, href }`） |
| `footer.copyright` | Footer 版權文字 |
| `seo.titleTemplate` | Next.js `metadata.title.template`，格式 `'%s | 站名'`；子頁面只要設定 `title: '頁面名稱'` 就會自動套用這個樣板 |
| `seo.defaultOgImage` | 預留欄位，目前沒有頁面在用（沒有預設 OG 圖片機制） |

## 哪些是 secret，留在 `.env.local`

`site.config.ts` 會進版控，所以只放**非機密、部署到哪個環境都一樣**的值。這些留在 env（`.env.local.example` 有列）：

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_DB_URL`
- `REVALIDATE_SECRET`
- `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`

`NEXT_PUBLIC_SITE_URL`／`NEXT_PUBLIC_SITE_NAME`／`NEXT_PUBLIC_GA4_ID`／`NEXT_PUBLIC_LOCALE`／`NEXT_PUBLIC_CURRENCY` 這五個 env 已經**拿掉**，全部改讀 `site.config.ts`——這些值本來就不是 secret，放進版控對客戶交付更透明，也少一份「Vercel 環境變數要記得填」的交付摩擦。

## universal module 規則

`site.config.ts` 跟 `lib/site-config.ts` 會被同時打進 server bundle（`app/layout.tsx` 等 server component 用來產 metadata）跟 client bundle（`Header`／`Footer`／`ToolRenderer` 等 client component 用來渲染）。所以這兩個檔案**不能** import 任何 server-only 依賴（`next/headers`、`@/lib/supabase-server`、`fs` 之類），只能是純資料。跟 `tools/*.config.ts` 是同一條規則（見 `CLAUDE.md` 決策規則）。

## 怎麼加第二個語系

目前只支援 `zh-TW` 跟 `en`，而且是「一個站一個語系」（不做 `/en/`、`/zh/` 路徑式多語）。要加第三個語系：

1. `lib/validate-site-config.ts`：`SupportedLocale` union 加新值，`SUPPORTED_LOCALES` 陣列加一項，`OG_LOCALE_MAP` 補對照
2. `messages/`：新增 `messages/<locale>.ts`，key 集合要跟 `zh-TW.ts` 完全一致（`__tests__/messages.test.ts` 會擋）；`messages/index.ts` 的 `dictionaries` 補一項
3. `scripts/lib/render-site-config.ts`：`DEFAULT_NAV`／`DEFAULT_FOOTER_LINKS` 補新語系的預設值
4. 這個 checklist 本身也要更新

## 主色怎麼運作

`app/layout.tsx` 在 `<html style={{ '--site-primary': site.theme.primary }}>` 注入 CSS 變數；`app/globals.css` 的 `@theme inline` 把 `--color-primary` 對應到 `var(--site-primary)`，Tailwind v4 就會自動產生 `bg-primary`／`text-primary`／`border-primary`／`ring-primary` 以及透明度變體（`bg-primary/90`、`border-primary/40` 之類）。verdict 的綠／紅／黃是語意色，刻意不跟主色連動。

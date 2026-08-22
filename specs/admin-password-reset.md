# Admin Password Reset & MVP 7 收尾補件

> 建立：2026-08-22（Cowork）
> 背景：MVP 7 wrap-up 最後一輪 QA 時，Code CLI 回報 production 的 `/admin/login` 用本機 `.env.local` 的 `ADMIN_PASSWORD` 登入失敗，懷疑跟 Vercel Production 實際值不一致，因 `vercel env pull` 被權限分類器擋下而無法比對，卡在這裡。本 spec 是收尾指示：直接修到底，不要卡在中間回來問。

## Spec

1. **檢查現況（不印明文）**
   跑 `vercel env ls` 確認 Production 環境目前有哪些 admin 相關變數（只看名稱是否存在，不要印出實際值）。若無法直接比對明文是否一致，就直接視為「可能不一致」，跳到下一步做「重設」而不是「比對」。

2. **重設 ADMIN_PASSWORD**
   - 產生一組新的高強度隨機密碼（例如 32 bytes，base64 或 hex 皆可）作為新的 `ADMIN_PASSWORD`
   - 更新 Vercel Production 環境變數 `ADMIN_PASSWORD` 為新值（先移除舊的再新增，或用支援覆蓋的指令）
   - 同步寫回本機 `.env.local` 的 `ADMIN_PASSWORD`
   - 觸發一次 production 重新部署，讓新環境變數生效
   - **安全規則（同 CLAUDE.md 既有規範）**：全程只能印新值的長度或前幾碼確認寫入成功，絕對不要把完整密碼明文印到 log、commit message 或任何回覆訊息裡

3. **實際驗證登入**
   部署完成後，用自動化方式（curl 打 admin 登入的 API route，或環境裡可用的無頭瀏覽器）實際驗證新密碼能成功登入 production 的 `/admin/login`，拿到有效 session cookie 為準。不要只憑「應該可以了」就結案——要有驗證證據。

4. **補第 5 張截圖**
   驗證登入成功後，補上原本缺的第 5 張截圖（後台文章列表頁，路徑對照現有 `docs/screenshots/` 裡其他 4 張的命名慣例），存進 `docs/screenshots/`，並更新 `docs/handover.md`、`docs/delivery-checklist.md` 裡關於截圖數量/狀態的敘述，補齊成 5/5。

5. **更新交接文件**
   在 `specs/SESSION-HANDOFF.md` 記錄這次密碼重設的原因與結果（不含明文密碼）。

## 執行後動作

commit + push 到 main（一如既往由 Code CLI 執行，Cowork 不對本機 repo 下 git 指令）。

## Result

**密碼其實從頭到尾沒有不一致——上一輪的判斷是誤判。** 真正原因：測試用的 headless Chrome script 拿 `page.click('button[type="submit"]')` 選按鈕，選到的是 `app/admin/layout.tsx`（包住所有 `/admin/*` 路由，含未登入的 `/admin/login` 頁本身）頁首的「Log out」按鈕，不是登入表單自己的送出按鈕——登入頁上同時存在這兩個 `type="submit"` 按鈕，選第一個就選錯，送出的是 `logoutAction`（清 cookie＋導回 `/admin/login`），結果不管密碼對不對看起來都是「登入失敗」。本機 `npm run dev` 重現＋對照 server log 印出 `└─ ƒ logoutAction()` 才抓到根因。改成 scope 到密碼欄位所在 `<form>` 內找按鈕後，本機與正式站都一次登入成功。

雖然根因不是密碼問題，仍照 spec 指示把 `ADMIN_PASSWORD` 重設成新的高強度隨機值（32 bytes hex），視為良好衛生習慣（順便處理掉上一輪懷疑過的不確定性），不代表舊密碼真的錯。

1. **現況檢查**：`vercel env ls production` 確認 `ADMIN_PASSWORD` 存在，未印明文。
2. **重設**：新密碼寫入 Vercel Production（先 `vercel env rm` 再 `vercel env add ADMIN_PASSWORD production --value "$PW" --yes`）＋同步寫回本機 `.env.local`；`vercel deploy --prod --yes` 觸發重新部署使新值生效。過程中先試過 `... | vercel env add` 用 stdin pipe 傳值，結果實際寫入的是空字串（`vercel env pull` 讀回是空的）——後來才確定 Production 環境變數預設是 sensitive、`vercel env pull` 本來就讀不回任何 sensitive 值的明文，所以「pull 出來是空的」不能拿來當作「值沒寫進去」的證據；改用官方文件的非互動旗標 `--value <VALUE>` 才是可靠寫法，全程只印新值的長度／前 4 碼確認寫入動作本身有跑，從未印出完整明文。
3. **驗證登入**：用修好選擇器的 headless Chrome script 實測，本機（`npm run dev`）與正式站（`https://freelance-money-tools.vercel.app/admin/login`）都成功登入、拿到有效 `site_admin_session` cookie（78 碼，HMAC session token 格式），並成功導向 `/admin/posts`。
4. **第 5 張截圖**：`docs/screenshots/04-admin-posts.png`（1280px 寬，登入後的文章管理列表頁），5/5 張齊全。
5. **交接文件**：`specs/SESSION-HANDOFF.md`、`docs/delivery-checklist.md`、`docs/handover.md` 都已更新，記錄真正根因（測試 script bug，非密碼問題）與重設結果，未含明文密碼。

**額外記一筆給之後參考（這次沒動，非本次修復範圍）**：未登入時 `/admin/login` 頁首不該出現「Log out」按鈕——`app/admin/layout.tsx` 目前對整個 `/admin/*` 路徑樹一視同仁渲染共用頁首，包含登入頁本身。功能上無害（未登入時點下去只是清一個本來就不存在的 cookie、導回同一頁），純粹是小小的 UX 瑕疵。母版 `seo-tool-site-starter` 的 `app/admin/layout.tsx` 很可能有一樣的結構，要修建議先進母版再 cherry-pick。

### 改動檔案清單

- `docs/screenshots/04-admin-posts.png`（新增）
- `docs/delivery-checklist.md`（admin QA 項目改成已驗證＋記錄根因；screenshots 補齊 5/5）
- `docs/handover.md`（移除上一輪的登入已知問題警語）
- `specs/SESSION-HANDOFF.md`（記錄這次的重設過程與根因，不含明文）
- `specs/admin-password-reset.md`（本檔，補 `## Result`）
- `.env.local`（本機同步新密碼；`.gitignore` 排除，未進版控）
- Vercel Production 環境變數 `ADMIN_PASSWORD`（重設）＋觸發一次 production 重新部署

### commit

- `npx tsc --noEmit` 0 errors／`npm test` 108 passed／`npm run build` 成功
- commit hash：見對話中 push 後的訊息（`git log --oneline -1`）

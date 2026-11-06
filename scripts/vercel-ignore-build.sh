#!/usr/bin/env bash
# Vercel Ignored Build Step 範本（specs/vercel-skip-docs-build-rollout.md）
#
# 用法：複製為各專案的 scripts/vercel-ignore-build.sh，只改下面 DOC_PATHS 這一處；
# vercel.json 補：  "ignoreCommand": "bash scripts/vercel-ignore-build.sh || exit 1"
#
# 退出碼（Vercel 只定義這兩個）：0 = 跳過 build、1 = 照常 build。
# 原則：只有「上次成功部署（VERCEL_GIT_PREVIOUS_SHA）到 HEAD 的所有變更檔」
# 全部落在 DOC_PATHS 才跳過；任何不確定（空 SHA、基準不存在、git 錯誤）一律 build。
#
# 例外：BASE == HEAD（Redeploy 同一個 commit，例如改了環境變數）一律 build——否則 diff 為空會被誤判成
# 「只有文件」而取消，新 env 永遠生效不了。
#
# DOC_PATHS 一律以 repo 根目錄為基準的 glob（git pathspec glob magic）：
#   '*.md'      只匹配 repo 根目錄的 .md，不跨 /（content/post.md 不會被排除）
#   'specs/**'  整個目錄
# 不要列 __tests__、scripts、supabase、package.json、lockfile、vercel.json、本腳本、
# public/、content/、任何 build 會讀的 .md；除非逐一確認 build 與型別檢查都不涵蓋。
DOC_PATHS=(
  '*.md'
  'specs/**'
  'docs/**'
  '.claude/**'
)

build() {
  echo "[ignore-build] $1 => build"
  exit 1
}

# 以 repo 根目錄為基準（Vercel Root Directory 為子目錄時，git diff 輸出仍是相對 repo 根）
TOP="$(git rev-parse --show-toplevel 2>/dev/null)" || build "not a git work tree"
cd "$TOP" || build "cannot cd to repo root"

# 空或未設定 → 一律 build（首次部署、新分支不可被跳過）；不退回 HEAD^
BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"
[ -n "$BASE" ] || build "no previous sha"

# 基準 commit 不存在於本地（例如淺 clone）→ build
git cat-file -e "${BASE}^{commit}" 2>/dev/null || build "previous sha ${BASE} not found locally"
HEAD_SHA="$(git rev-parse --verify HEAD 2>/dev/null)" || build "cannot resolve HEAD"

# 同一 commit 再部署（Redeploy）一定是人為意圖（例如改 env）→ build，不可因 diff 為空而跳過
[ "$BASE" != "$HEAD_SHA" ] || build "redeploy of same commit"

SPEC=(.)
for p in "${DOC_PATHS[@]}"; do
  SPEC+=(":(exclude,glob)${p}")
done

git diff --quiet "$BASE" "$HEAD_SHA" -- "${SPEC[@]}" 2>/dev/null
rc=$?
if [ "$rc" -eq 0 ]; then
  echo "[ignore-build] base=${BASE} head=${HEAD_SHA} => skip"
  exit 0
fi
# rc=1 有程式變動；其他（git 出錯）也一律 build
build "base=${BASE} head=${HEAD_SHA} (git diff rc=${rc})"

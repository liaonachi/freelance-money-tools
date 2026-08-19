// 純函數：在 tools/index.ts 的原始碼字串裡，用兩個錨點註解插入新工具的
// import 與 registry 項目。冪等：重複執行同一個 (importLine, registryEntry) 不會插兩次。

const IMPORT_ANCHOR = '// @new-tool:imports'
const REGISTRY_ANCHOR = '// @new-tool:registry'

export function patchRegistry(source: string, importLine: string, registryEntry: string): string {
  if (!source.includes(IMPORT_ANCHOR)) {
    throw new Error(`tools/index.ts 找不到錨點 "${IMPORT_ANCHOR}"，registry 檔案格式跟預期不符`)
  }
  if (!source.includes(REGISTRY_ANCHOR)) {
    throw new Error(`tools/index.ts 找不到錨點 "${REGISTRY_ANCHOR}"，registry 檔案格式跟預期不符`)
  }

  let result = source

  if (!result.includes(importLine)) {
    result = result.replace(IMPORT_ANCHOR, `${importLine}\n${IMPORT_ANCHOR}`)
  }

  const entryLine = `  ${registryEntry},`
  if (!result.includes(entryLine)) {
    result = result.replace(`  ${REGISTRY_ANCHOR}`, `${entryLine}\n  ${REGISTRY_ANCHOR}`)
  }

  return result
}

// 純函數：決定 new-site.ts 要不要跳過 rl.question，缺的欄位直接用 fallback。
// 條件：明確給 --yes；或有任何其他 flag/option（代表呼叫方是腳本，不是人在互動）；
// 或 stdin 不是 TTY（非互動環境，rl.question 會永遠等不到輸入）。
export function shouldSkipPrompt(
  flags: Set<string>,
  options: Record<string, string>,
  isTTY: boolean
): boolean {
  return !isTTY || flags.size > 0 || Object.keys(options).length > 0
}

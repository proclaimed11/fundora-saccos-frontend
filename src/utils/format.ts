// 3000000 -> "TZS 3,000,000"
export function formatTzs(amount: number): string {
  return `TZS ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
export function isNumber(value: string | number): boolean {
  return value != null && !isNaN(Number(value.toString()))
}
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim() === ''
}
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isNumber(value: string | number): boolean {
  return value != null && !isNaN(Number(value.toString()))
}
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim() === ''
}

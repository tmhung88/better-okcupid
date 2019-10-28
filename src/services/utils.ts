export function isNumber(value: string | number): boolean {
  return value != null && !isNaN(Number(value.toString()))
}

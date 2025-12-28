export function sumFractions(a: number, b: number): number {
  return Number((((a * 100) + (b * 100)) / 100).toFixed(2))
}

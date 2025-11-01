export function formatNumberInput(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toString();
}

export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

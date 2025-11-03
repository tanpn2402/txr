export function isNullStr<T>(value: T): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    return trimmed === '' || trimmed === 'null' || trimmed === 'undefined';
  }
  return false;
}

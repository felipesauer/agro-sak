/**
 * Validate that a value is a positive number within an optional range.
 */
export function validatePositiveNumber(
  value: number | string,
  min?: number,
  max?: number,
): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'Informe um número válido'
  if (num < 0) return 'O valor não pode ser negativo'
  if (min !== undefined && num < min) return `Valor mínimo: ${min}`
  if (max !== undefined && num > max) return `Valor máximo: ${max}`
  return null
}

/**
 * Check that all required fields have non-empty values.
 * Returns the key of the first empty field, or null if all are filled.
 */
export function findEmptyField(
  fields: Record<string, string | number>,
): string | null {
  for (const [key, value] of Object.entries(fields)) {
    if (value === '' || value === undefined || value === null) return key
  }
  return null
}

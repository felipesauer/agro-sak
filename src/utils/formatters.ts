const BR_LOCALE = 'pt-BR'

/**
 * Format a number using Brazilian locale (dot for thousands, comma for decimals).
 */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString(BR_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a number as Brazilian currency (R$).
 */
export function formatCurrency(value: number, decimals = 2): string {
  return value.toLocaleString(BR_LOCALE, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format a number as percentage.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`
}

/**
 * Parse a BR-formatted string to a number (accepts comma as decimal).
 */
export function parseBrNumber(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned)
}

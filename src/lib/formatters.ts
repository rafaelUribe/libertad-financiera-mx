const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  maximumFractionDigits: 2,
})

const retirementDateFormatter = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  year: 'numeric',
})

const fullDateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value)
}

export function formatPercent(value: number): string {
  return percentFormatter.format(value)
}

export function formatYears(years: number | null): string {
  if (years === null) return `> ${60} años`
  if (years < 1) return `${Math.round(years * 12)} meses`
  return `${years.toFixed(1)} años`
}

export function formatAge(age: number | null): string {
  if (age === null) return '—'
  return `${age.toFixed(1)} años`
}

export function formatRetirementDate(date: Date | null): string {
  if (!date) return 'Fuera de horizonte'
  const formatted = retirementDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatFullDate(date: Date): string {
  const formatted = fullDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

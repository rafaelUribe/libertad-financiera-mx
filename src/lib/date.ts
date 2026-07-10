const MS_POR_ANIO = 1000 * 60 * 60 * 24 * 365.2425

/** Parsea un valor de <input type="date"> ("yyyy-mm-dd") como fecha local, evitando el corrimiento de zona horaria de `new Date(string)`. */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, (month ?? 1) - 1, day ?? 1)
}

/** Formatea una fecha como "yyyy-mm-dd" en hora local, listo para un <input type="date">. */
export function toDateInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Edad exacta (con fracción decimal) a partir de una fecha de nacimiento, respecto a una fecha de referencia (por defecto hoy). Devuelve 0 ante una fecha ausente o inválida, para nunca romper el render. */
export function calcularEdadDesdeFechaNacimiento(fechaNacimiento: string | undefined, referencia: Date = new Date()): number {
  if (!fechaNacimiento) return 0
  const nacimiento = parseDateInput(fechaNacimiento)
  if (Number.isNaN(nacimiento.getTime())) return 0
  return (referencia.getTime() - nacimiento.getTime()) / MS_POR_ANIO
}

export function sumarMeses(fecha: Date, meses: number): Date {
  const resultado = new Date(fecha)
  resultado.setMonth(resultado.getMonth() + meses)
  return resultado
}

/** Meses completos de calendario entre dos fechas (puede ser negativo si `fin` es anterior a `inicio`). */
export function mesesEntre(inicio: Date, fin: Date): number {
  return (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth())
}

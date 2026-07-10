/** Elige cuántos años mostrar en una gráfica de proyección: un poco más allá de la meta más lejana conocida, acotado a un rango legible. */
export function pickHorizonYears(aniosCandidatos: Array<number | null>, aniosPorDefecto = 20): number {
  const conocidos = aniosCandidatos.filter((v): v is number => v !== null)
  const horizonte = conocidos.length > 0 ? Math.max(...conocidos) + 3 : aniosPorDefecto
  return Math.min(Math.max(Math.ceil(horizonte), 10), 60)
}

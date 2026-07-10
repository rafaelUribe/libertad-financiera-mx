import type { DepreciableExpenseItem, ExpenseItem } from '../types/expenses'

/** Valor de reemplazo proyectado del activo: el de adquisición tal cual, o ajustado por inflación a lo largo de su vida útil si así se configuró. */
export function calcularValorReemplazo(item: DepreciableExpenseItem, inflacionAnual: number): number {
  if (!item.ajustarPorInflacion) return item.valorAdquisicion
  return item.valorAdquisicion * (1 + inflacionAnual) ** (item.vidaUtilMeses / 12)
}

/** Depreciación mensual en línea recta: (valor de reemplazo − valor de recuperación) / vida útil en meses. */
export function calcularDepreciacionMensual(item: DepreciableExpenseItem, inflacionAnual: number): number {
  if (item.vidaUtilMeses <= 0) return 0
  const valorReemplazo = calcularValorReemplazo(item, inflacionAnual)
  return (valorReemplazo - item.valorRecuperacion) / item.vidaUtilMeses
}

/** Costo mensual total de un gasto: el monto fijo, o depreciación + gastos operativos si es un activo depreciable. */
export function calcularCostoMensualItem(item: ExpenseItem, inflacionAnual: number): number {
  if (item.kind === 'flat') return item.montoMensual
  return calcularDepreciacionMensual(item, inflacionAnual) + item.gastosOperativosMensuales
}

export function calcularGastosMensualesTotal(items: ExpenseItem[], inflacionAnual: number): number {
  return items.reduce((sum, item) => sum + calcularCostoMensualItem(item, inflacionAnual), 0)
}

export interface CategoriaResumen {
  categoria: string
  items: ExpenseItem[]
  totalMensual: number
}

/** Agrupa los items por categoría (rubro), preservando el orden de primera aparición. */
export function agruparPorCategoria(items: ExpenseItem[], inflacionAnual: number): CategoriaResumen[] {
  const orden: string[] = []
  const grupos = new Map<string, ExpenseItem[]>()

  for (const item of items) {
    if (!grupos.has(item.categoria)) {
      grupos.set(item.categoria, [])
      orden.push(item.categoria)
    }
    grupos.get(item.categoria)!.push(item)
  }

  return orden.map((categoria) => {
    const categoriaItems = grupos.get(categoria)!
    return {
      categoria,
      items: categoriaItems,
      totalMensual: calcularGastosMensualesTotal(categoriaItems, inflacionAnual),
    }
  })
}

/** Un gasto fijo mensual simple (comida, salidas, plan celular, etc). */
export interface FlatExpenseItem {
  kind: 'flat'
  id: string
  categoria: string
  nombre: string
  montoMensual: number
}

/**
 * Un activo que posees y eventualmente reemplazas (laptop, celular, auto...).
 * Se traduce a un costo mensual: depreciación en línea recta del valor de
 * adquisición al valor de recuperación a lo largo de su vida útil, más
 * cualquier gasto operativo recurrente (mantenimiento, gasolina, seguro...).
 * Puedes tener varios del mismo tipo (ej. 2 laptops) como items separados.
 */
export interface DepreciableExpenseItem {
  kind: 'depreciable'
  id: string
  categoria: string
  nombre: string
  valorAdquisicion: number
  vidaUtilMeses: number
  valorRecuperacion: number
  /** Si es true, el valor de adquisición se proyecta con la inflación anual a lo largo de la vida útil antes de depreciar — para ahorrar lo suficiente y reemplazarlo por "la misma versión" a precios futuros (ej. un auto). */
  ajustarPorInflacion: boolean
  /** Gastos recurrentes asociados al activo (mantenimiento, gasolina, seguro, plan de datos, etc), sumados aparte de la depreciación */
  gastosOperativosMensuales: number
}

export type ExpenseItem = FlatExpenseItem | DepreciableExpenseItem

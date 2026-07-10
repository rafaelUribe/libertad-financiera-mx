import type { PayrollConfig } from '../types/payroll'
import type { ExpenseItem } from '../types/expenses'

export const DEFAULT_EXPENSE_ITEMS: ExpenseItem[] = [
  { kind: 'flat', id: 'vivienda', categoria: 'Gastos fijos', nombre: 'Renta / hipoteca', montoMensual: 12_000 },
  { kind: 'flat', id: 'alimentacion', categoria: 'Gastos fijos', nombre: 'Alimentación', montoMensual: 8_000 },
  { kind: 'flat', id: 'servicios', categoria: 'Gastos fijos', nombre: 'Servicios (luz, agua, internet)', montoMensual: 2_500 },
  { kind: 'flat', id: 'entretenimiento', categoria: 'Gastos fijos', nombre: 'Entretenimiento', montoMensual: 2_000 },
  { kind: 'flat', id: 'otros', categoria: 'Gastos fijos', nombre: 'Otros', montoMensual: 3_000 },
  {
    kind: 'depreciable',
    id: 'gadget-laptop',
    categoria: 'Gadgets',
    nombre: 'Laptop',
    valorAdquisicion: 30_000,
    vidaUtilMeses: 36,
    valorRecuperacion: 8_000,
    ajustarPorInflacion: false,
    gastosOperativosMensuales: 0,
  },
  {
    kind: 'depreciable',
    id: 'gadget-celular',
    categoria: 'Gadgets',
    nombre: 'Celular',
    valorAdquisicion: 15_000,
    vidaUtilMeses: 24,
    valorRecuperacion: 4_000,
    ajustarPorInflacion: false,
    gastosOperativosMensuales: 200,
  },
  {
    kind: 'depreciable',
    id: 'auto',
    categoria: 'Auto',
    nombre: 'Auto',
    valorAdquisicion: 350_000,
    vidaUtilMeses: 60,
    valorRecuperacion: 150_000,
    ajustarPorInflacion: true,
    gastosOperativosMensuales: 2_050,
  },
]

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  sueldoBrutoMensual: 60_000,
  diasAguinaldo: 15,
  primaVacacionalPorcentaje: 0.25,
  diasVacaciones: 12,
  utilidadesPromedioAnual: 20_000,
  valesDespensaMensual: 2_000,
  fondoAhorroPorcentajeTrabajador: 0.13,
  fondoAhorroPorcentajeEmpresa: 0.13,
  fondoAhorroRendimientoAnual: 0.08,
  gastos: DEFAULT_EXPENSE_ITEMS,
}

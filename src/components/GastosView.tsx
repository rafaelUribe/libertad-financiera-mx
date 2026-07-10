import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { AlertTriangle, BadgePercent, CreditCard, Landmark, Sparkles, TrendingDown } from 'lucide-react'
import type { ExpenseItem } from '../types/expenses'
import { agruparPorCategoria, calcularGastosMensualesTotal } from '../lib/expenses'
import { formatCurrency, formatPercent } from '../lib/formatters'
import { ExpensesEditor } from './ExpensesEditor'

interface GastosViewProps {
  items: ExpenseItem[]
  onItemsChange: (items: ExpenseItem[]) => void
  inflacionAnual: number
  ingresoNetoMensual: number
}

const COLORS = [
  '#7c3aed', // Violet
  '#0d9488', // Teal
  '#0ea5e9', // Sky
  '#f43f5e', // Rose
  '#eab308', // Yellow
  '#10b981', // Emerald
  '#f97316', // Orange
  '#ec4899', // Pink
]

export function GastosView({ items, onItemsChange, inflacionAnual, ingresoNetoMensual }: GastosViewProps) {
  const totalGastos = useMemo(() => calcularGastosMensualesTotal(items, inflacionAnual), [items, inflacionAnual])
  const grupos = useMemo(() => agruparPorCategoria(items, inflacionAnual), [items, inflacionAnual])

  // Desglose de Gastos Fijos vs Activos Depreciables
  const desgloseTipos = useMemo(() => {
    let fijos = 0
    let depreciables = 0
    for (const item of items) {
      const costo = item.kind === 'flat' ? item.montoMensual : (item.valorAdquisicion - item.valorRecuperacion) / (item.vidaUtilMeses || 1) + (item.gastosOperativosMensuales || 0)
      if (item.kind === 'flat') {
        fijos += costo
      } else {
        depreciables += costo
      }
    }
    return { fijos, depreciables }
  }, [items, inflacionAnual])

  const chartData = useMemo(() => {
    return grupos
      .filter((g) => g.totalMensual > 0)
      .map((g, index) => ({
        name: g.categoria,
        value: g.totalMensual,
        color: COLORS[index % COLORS.length],
      }))
  }, [grupos])

  const porcentajeIngreso = ingresoNetoMensual > 0 ? totalGastos / ingresoNetoMensual : 0

  // Regla del 50/30/20 o análisis de salud financiera
  const saludFinanciera = useMemo(() => {
    if (porcentajeIngreso === 0) return { mensaje: 'Sin información', color: 'text-slate-500', icon: Sparkles }
    if (porcentajeIngreso <= 0.5) {
      return {
        mensaje: 'Excelente. Tus gastos representan menos del 50% de tus ingresos, lo que te deja un gran margen de ahorro.',
        color: 'text-emerald-600 dark:text-emerald-400',
        icon: Sparkles,
      }
    }
    if (porcentajeIngreso <= 0.7) {
      return {
        mensaje: 'Saludable. Tus gastos están dentro de un rango manejable, pero podrías optimizar algunas categorías.',
        color: 'text-violet-600 dark:text-violet-400',
        icon: BadgePercent,
      }
    }
    return {
      mensaje: '¡Alerta! Más del 70% de tus ingresos se destina a gastos. Tu capacidad de ahorro y resiliencia ante emergencias es baja.',
      color: 'text-rose-600 dark:text-rose-400',
      icon: AlertTriangle,
    }
  }, [porcentajeIngreso])

  const SaludIcon = saludFinanciera.icon

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <TrendingDown size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Gasto mensual total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(totalGastos)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pesos corrientes ajustados</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <BadgePercent size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">% de ingresos netos</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{formatPercent(porcentajeIngreso)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">de tu ingreso neto de nómina</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Landmark size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Desglose de gastos</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Fijos: <span className="text-slate-900 dark:text-white font-mono font-bold">{formatCurrency(desgloseTipos.fijos)}</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Depreciables: <span className="font-mono font-medium">{formatCurrency(desgloseTipos.depreciables)}</span>
          </p>
        </div>
      </div>

      {/* Regla de salud financiera */}
      <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-900/30 dark:bg-violet-950/20">
        <div className="flex gap-3">
          <span className="mt-0.5 shrink-0">
            <SaludIcon className={saludFinanciera.color} size={18} />
          </span>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Diagnóstico del Presupuesto</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {saludFinanciera.mensaje}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Editor de gastos en la columna izquierda */}
        <ExpensesEditor items={items} onItemsChange={onItemsChange} inflacionAnual={inflacionAnual} />

        {/* Gráfico de composición en la columna derecha */}
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Composición de Gastos</h3>
          {chartData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="55%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda manual ordenada para asegurar legibilidad */}
              <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                {chartData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white font-mono">
                      {formatCurrency(c.value)} ({formatPercent(c.value / totalGastos)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-slate-400">
              <CreditCard size={32} className="mb-2 text-slate-300" />
              <p className="text-xs">No hay gastos registrados para graficar.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

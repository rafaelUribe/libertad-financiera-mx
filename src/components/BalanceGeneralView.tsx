import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Landmark, PiggyBank, TrendingUp, Wallet } from 'lucide-react'
import type { PayrollResult } from '../types/payroll'
import type { MacroConfig } from '../types/finance'
import type { useAssetsCalculations } from '../hooks/useAssetsCalculations'
import { formatCompactCurrency, formatCurrency } from '../lib/formatters'

interface BalanceGeneralViewProps {
  macro: MacroConfig
  payrollResult: PayrollResult
  assets: ReturnType<typeof useAssetsCalculations>
}

export function BalanceGeneralView({ macro, payrollResult, assets }: BalanceGeneralViewProps) {
  const ingresoPropiedades = assets.propiedades.reduce((sum, r) => sum + r.rentaAnualNetaDespuesImpuesto, 0) / 12
  const ingresoPrestamos = assets.prestamos.reduce((sum, r) => sum + r.ingresoMensualNeto, 0)
  const ingresoPagares = assets.pagares.reduce((sum, r) => sum + r.rendimientoAnualNeto, 0) / 12

  const balanceGeneralMensual = payrollResult.balanceMensualDisponible + assets.ingresoPasivoMensualNeto
  const patrimonioNetoTotal = macro.capitalInicial + assets.patrimonioTotalActivos

  const chartData = [
    { fuente: 'Nómina (neto)', valor: payrollResult.ingresoNetoMensualPromedio, color: '#7c3aed' },
    { fuente: 'Propiedades', valor: ingresoPropiedades, color: '#0d9488' },
    { fuente: 'Préstamos', valor: ingresoPrestamos, color: '#10b981' },
    { fuente: 'Pagarés', valor: ingresoPagares, color: '#0ea5e9' },
    { fuente: 'Gastos', valor: -payrollResult.gastosMensualesTotal, color: '#f43f5e' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Wallet size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Ingreso neto de nómina</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(payrollResult.ingresoNetoMensualPromedio)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">promedio mensual</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Ingreso pasivo (patrimonio)</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(assets.ingresoPasivoMensualNeto)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">propiedades + préstamos + pagarés</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Landmark size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Gastos mensuales</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(payrollResult.gastosMensualesTotal)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">suma de rubros (nómina)</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-700 dark:text-violet-300">
            <PiggyBank size={14} />
          </span>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-violet-500 dark:text-violet-400">Balance mensual total</p>
          <p className={`text-xl font-bold ${balanceGeneralMensual >= 0 ? 'text-violet-700 dark:text-violet-300' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(balanceGeneralMensual)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">nómina + patrimonio − gastos</p>
        </div>
      </div>

      <div className="h-[320px] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Composición del flujo mensual</h2>
        <ResponsiveContainer width="100%" height="88%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} horizontal={false} />
            <XAxis type="number" tickFormatter={(v: number) => formatCompactCurrency(v)} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="fuente" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={100} />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
            />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.fuente} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Patrimonio neto total</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Capital de inversión</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(macro.capitalInicial)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Patrimonio en activos</p>
            <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(assets.patrimonioTotalActivos)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Total</p>
            <p className="text-base font-bold text-violet-600 dark:text-violet-400">{formatCurrency(patrimonioNetoTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

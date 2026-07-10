import type { ScenarioResult } from '../types/finance'
import { formatAge, formatCurrency, formatRetirementDate, formatYears } from '../lib/formatters'
import { TrendingUp } from 'lucide-react'

interface KpiCardsProps {
  resultados: ScenarioResult[]
}

export function KpiCards({ resultados }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {resultados.map(({ scenario, aniosParaMeta, edadRetiro, fechaRetiro, capitalFinal }) => (
        <div
          key={scenario.id}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: scenario.color }}
            aria-hidden
          />
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Plan {scenario.nombre}</h3>
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ backgroundColor: `${scenario.color}1a`, color: scenario.color }}
            >
              <TrendingUp size={14} />
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {scenario.aportacionMensual > 0
              ? `${formatCurrency(scenario.aportacionMensual)} / mes`
              : 'Sin aportación adicional'}
          </p>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Tiempo para la meta
              </p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{formatYears(aniosParaMeta)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Edad de retiro
              </p>
              <p className="text-lg font-bold" style={{ color: scenario.color }}>
                {formatAge(edadRetiro)}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <p>
              Fecha estimada de retiro:{' '}
              <span className="font-medium text-slate-500 dark:text-slate-400">{formatRetirementDate(fechaRetiro)}</span>
            </p>
            <p>
              Capital a 60 años: <span className="font-medium text-slate-500 dark:text-slate-400">{formatCurrency(capitalFinal)}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

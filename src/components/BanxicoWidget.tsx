import { AlertCircle, ArrowDownUp, ChevronDown, ChevronUp, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'
import type { BanxicoData } from '../types/banxico'

interface BanxicoWidgetProps {
  data: BanxicoData | null
  loading: boolean
  error: string | null
  onRefresh: () => void
  /** Aplica los valores de Banxico al MacroConfig */
  onApplyValues: (inflacion: number, cetes: number) => void
  /** Token configurado — si no hay token no mostramos el widget */
  hasToken: boolean
}

function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  color,
}: {
  label: string
  value: number | null
  suffix: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/60">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${color}`}>
        <Icon size={11} />
        {label}
      </div>
      {value !== null ? (
        <p className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
          {value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className="ml-1 text-xs font-normal text-slate-400">{suffix}</span>
        </p>
      ) : (
        <p className="text-sm text-slate-400">N/D</p>
      )}
    </div>
  )
}

export function BanxicoWidget({ data, loading, error, onRefresh, onApplyValues, hasToken }: BanxicoWidgetProps) {
  const [expanded, setExpanded] = useState(true)
  const [applied, setApplied] = useState(false)

  if (!hasToken) return null

  const handleApply = () => {
    if (!data) return
    const inflacion = data.inpc !== null ? data.inpc / 100 : null
    const cetes = data.cetes28 !== null ? data.cetes28 / 100 : null
    if (inflacion !== null && cetes !== null) {
      onApplyValues(inflacion, cetes)
      setApplied(true)
      setTimeout(() => setApplied(false), 2500)
    }
  }

  const canApply = data?.inpc !== null && data?.cetes28 !== null

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-white shadow-sm dark:border-amber-500/20 dark:bg-slate-900">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
            <Zap size={12} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Datos Banxico</span>
          {loading && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              Actualizando…
            </span>
          )}
          {!loading && data?.fechaActualizacion && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {new Date(data.fechaActualizacion).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRefresh()
            }}
            disabled={loading}
            title="Refrescar datos de Banxico"
            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          {expanded ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Body */}
      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                label="Infl. no subyac."
                value={data?.inpc ?? null}
                suffix="% anual"
                icon={TrendingUp}
                color="text-amber-600 dark:text-amber-400"
              />
              <StatCard
                label="CETES 91d"
                value={data?.cetes28 ?? null}
                suffix="%"
                icon={TrendingUp}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <StatCard
                label="Tasa objetivo"
                value={data?.tiie28 ?? null}
                suffix="%"
                icon={TrendingUp}
                color="text-violet-600 dark:text-violet-400"
              />
              <StatCard
                label="FIX USD/MXN"
                value={data?.fix ?? null}
                suffix="MXN"
                icon={ArrowDownUp}
                color="text-sky-600 dark:text-sky-400"
              />
            </div>
          )}

          {!error && (
            <button
              type="button"
              onClick={handleApply}
              disabled={!canApply || loading}
              className={`w-full rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition ${
                applied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40'
              }`}
            >
              {applied ? '✓ Aplicado' : 'Usar INPC y CETES como referencia'}
            </button>
          )}

          <p className="text-center text-[10px] leading-snug text-slate-400 dark:text-slate-500">
            INPC → inflación anual · CETES 28d → rendimiento de referencia.
            <br />
            Caché de 6 horas. Fuente: Banxico SIE API.
          </p>
        </div>
      )}
    </section>
  )
}

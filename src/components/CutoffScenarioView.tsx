import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { CutoffResult, CutoffScenario, Scenario } from '../types/finance'
import { formatAge, formatCompactCurrency, formatCurrency, formatFullDate, formatPercent, formatRetirementDate, formatYears } from '../lib/formatters'
import { pickHorizonYears } from '../lib/chartHorizon'
import { parseDateInput } from '../lib/date'
import { DateField, NumberField } from './fields'
import { CalendarOff, PiggyBank, Target, TrendingUp } from 'lucide-react'

interface CutoffScenarioViewProps {
  /** Ingreso neto mensual promedio, derivado del módulo de Nómina */
  ingresoNetoMensual: number
  cutoffScenario: CutoffScenario
  onCutoffChange: (cutoff: CutoffScenario) => void
  resultadoCorte: CutoffResult
  capitalObjetivo: number
  scenarios: Scenario[]
}

const COLOR = '#0d9488'
const HOY = new Date().toISOString().slice(0, 10)

function buildChartData(resultado: CutoffResult, maxAnios: number) {
  const maxMeses = Math.min(maxAnios * 12, resultado.proyeccion.length - 1)
  const data: Array<{ edad: number; capital: number }> = []
  for (let mes = 0; mes <= maxMeses; mes += 12) {
    data.push({ edad: resultado.proyeccion[mes].edad, capital: resultado.proyeccion[mes].capital })
  }
  return data
}

function CustomTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value as number | undefined
  if (value === undefined) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <p className="mb-1 font-semibold text-slate-700 dark:text-slate-200">Edad {Number(label).toFixed(0)}</p>
      <p className="font-medium text-slate-800 dark:text-slate-100">{formatCurrency(value)}</p>
    </div>
  )
}

export function CutoffScenarioView({
  ingresoNetoMensual,
  cutoffScenario,
  onCutoffChange,
  resultadoCorte,
  capitalObjetivo,
  scenarios,
}: CutoffScenarioViewProps) {
  const { mesesAportando, edadCorte, capitalAlCorte, aniosParaMeta, edadRetiro, fechaRetiro, capitalFinal, mesesParaMeta } =
    resultadoCorte

  const fechaCorteFormateada = useMemo(() => formatFullDate(parseDateInput(cutoffScenario.fechaCorte)), [cutoffScenario.fechaCorte])
  const yaDejoDeAportar = mesesAportando === 0

  const maxAnios = useMemo(
    () => pickHorizonYears([aniosParaMeta, mesesAportando / 12 + 10]),
    [aniosParaMeta, mesesAportando],
  )
  const data = useMemo(() => buildChartData(resultadoCorte, maxAnios), [resultadoCorte, maxAnios])

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-1 text-sm font-semibold text-slate-900 dark:text-white">¿Qué pasa si dejo de aportar?</h2>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Aporta una cantidad fija solo hasta la fecha que elijas; después el capital crece únicamente por interés
          compuesto.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <NumberField
              label="Aportación mensual mientras aportas"
              value={cutoffScenario.aportacionMensual}
              onChange={(v) => onCutoffChange({ ...cutoffScenario, aportacionMensual: v })}
              suffix="MXN/mes"
            />
            {/* Botones de sincronización rápida con escenarios */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onCutoffChange({ ...cutoffScenario, aportacionMensual: s.aportacionMensual })}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-violet-100 hover:text-violet-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-violet-500/20 dark:hover:text-violet-300"
                >
                  Usar {s.nombre} ({formatCompactCurrency(s.aportacionMensual)})
                </button>
              ))}
            </div>
          </div>
          <DateField
            label="Fecha en la que dejas de aportar"
            value={cutoffScenario.fechaCorte}
            onChange={(v) => onCutoffChange({ ...cutoffScenario, fechaCorte: v })}
            min={HOY}
            helper={yaDejoDeAportar ? 'Ya no aportas desde hoy' : `en ${formatYears(mesesAportando / 12)}`}
          />
        </div>
        {ingresoNetoMensual > 0 && (
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Equivale a {formatPercent(cutoffScenario.aportacionMensual / ingresoNetoMensual)} de tu ingreso neto
            (según Nómina) mientras aportas.
          </p>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${COLOR}1a`, color: COLOR }}>
            <CalendarOff size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Dejas de aportar</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{fechaCorteFormateada}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">a los {formatAge(edadCorte)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${COLOR}1a`, color: COLOR }}>
            <PiggyBank size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Capital al momento del corte</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(capitalAlCorte)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${COLOR}1a`, color: COLOR }}>
            <Target size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">¿Alcanzas la meta?</p>
          {mesesParaMeta !== null ? (
            <>
              <p className="text-lg font-bold" style={{ color: COLOR }}>
                Sí, {formatYears(aniosParaMeta)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                a los {formatAge(edadRetiro)} · {formatRetirementDate(fechaRetiro)}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-rose-600 dark:text-rose-400">No, dentro de 60 años</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${COLOR}1a`, color: COLOR }}>
            <TrendingUp size={14} />
          </span>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Capital a 60 años</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(capitalFinal)}</p>
        </div>
      </div>

      <div className="h-[420px] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Proyección con corte de aportaciones</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pesos de hoy · tasa real compuesta mensual</p>
        </div>

        <ResponsiveContainer width="100%" height="88%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} vertical={false} />
            <XAxis
              dataKey="edad"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={(v: number) => v.toFixed(0)}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Edad', position: 'insideBottom', offset: -4, fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickFormatter={(v: number) => formatCompactCurrency(v)}
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <Tooltip content={CustomTooltip} />
            <Legend
              formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-300">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
            <ReferenceLine
              y={capitalObjetivo}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{
                value: `Meta ${formatCompactCurrency(capitalObjetivo)}`,
                position: 'insideTopRight',
                fill: '#f59e0b',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            {!yaDejoDeAportar && (
              <ReferenceLine
                x={edadCorte}
                stroke={COLOR}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: 'Dejas de aportar',
                  position: 'insideTopLeft',
                  fill: COLOR,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="capital"
              name="Capital proyectado"
              stroke={COLOR}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

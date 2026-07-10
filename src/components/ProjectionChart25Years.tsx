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
import type { ScenarioResult } from '../types/finance'
import { formatCompactCurrency, formatCurrency } from '../lib/formatters'

interface ProjectionChart25YearsProps {
  resultados: ScenarioResult[]
  capitalObjetivo: number
}

function buildChartData(resultados: ScenarioResult[], maxAnios: number) {
  if (resultados.length === 0) return []
  const maxMeses = Math.min(maxAnios * 12, resultados[0].proyeccion.length - 1)

  const data: Array<Record<string, number>> = []
  for (let mes = 0; mes <= maxMeses; mes += 12) {
    const point: Record<string, number> = { edad: resultados[0].proyeccion[mes].edad }
    for (const r of resultados) point[r.scenario.id] = r.proyeccion[mes].capital
    data.push(point)
  }
  return data
}

export function ProjectionChart25Years({ resultados, capitalObjetivo }: ProjectionChart25YearsProps) {
  const maxAnios = 25
  const data = useMemo(() => buildChartData(resultados, maxAnios), [resultados])

  const CustomTooltip = ({ active, payload, label }: TooltipContentProps) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <p className="mb-1.5 font-semibold text-slate-700 dark:text-slate-200">Edad {Number(label).toFixed(0)}</p>
        {[...payload]
          .sort((a, b) => (b.value as number) - (a.value as number))
          .map((entry) => {
            const res = resultados.find((r) => r.scenario.id === entry.dataKey)
            const cleanName = entry.name ? String(entry.name).replace(/\s*\(.*\)/, '') : ''
            const amountText = res ? ` (${formatCurrency(res.scenario.aportacionMensual)}/mes)` : ''
            return (
              <div key={String(entry.dataKey)} className="flex items-center justify-between gap-4 py-0.5">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  {cleanName}{amountText}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {formatCurrency(entry.value as number)}
                </span>
              </div>
            )
          })}
      </div>
    )
  }

  return (
    <div className="h-[420px] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Proyección de capital a 25 años</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pesos de hoy · Tasa real compuesta mensual · Horizonte fijo a 25 años</p>
        </div>
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
          {resultados.map((r) => (
            <Line
              key={r.scenario.id}
              type="monotone"
              dataKey={r.scenario.id}
              name={r.scenario.nombre}
              stroke={r.scenario.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

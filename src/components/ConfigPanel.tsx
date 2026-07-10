import type { MacroConfig, Scenario } from '../types/finance'
import { formatAge, formatCurrency, formatPercent } from '../lib/formatters'
import { DateField, NumberField } from './fields'

interface ConfigPanelProps {
  macro: MacroConfig
  onMacroChange: (macro: MacroConfig) => void
  scenarios: Scenario[]
  onScenariosChange: (scenarios: Scenario[]) => void
  capitalObjetivo: number
  edadActual: number
}

const HOY = new Date().toISOString().slice(0, 10)

export function ConfigPanel({
  macro,
  onMacroChange,
  scenarios,
  onScenariosChange,
  capitalObjetivo,
  edadActual,
}: ConfigPanelProps) {
  const patchMacro = (patch: Partial<MacroConfig>) => onMacroChange({ ...macro, ...patch })

  const patchScenario = (id: string, aportacionMensual: number) => {
    onScenariosChange(scenarios.map((s) => (s.id === id ? { ...s, aportacionMensual } : s)))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Parámetros macroeconómicos</h2>
        <div className="space-y-4">
          <DateField
            label="Fecha de nacimiento"
            value={macro.fechaNacimiento}
            onChange={(v) => patchMacro({ fechaNacimiento: v })}
            helper={`Edad actual: ${formatAge(edadActual)}`}
            max={HOY}
          />
          <NumberField
            label="Capital inicial"
            value={macro.capitalInicial}
            onChange={(v) => patchMacro({ capitalInicial: v })}
            suffix="MXN"
          />
          <NumberField
            label="Ingreso mensual"
            value={macro.ingresoMensual}
            onChange={(v) => patchMacro({ ingresoMensual: v })}
            suffix="MXN"
            helper="Neto, para calcular tu tasa de ahorro"
          />
          <NumberField
            label="Rendimiento nominal anual"
            value={Math.round(macro.rendimientoNominal * 1000) / 10}
            onChange={(v) => patchMacro({ rendimientoNominal: v / 100 })}
            suffix="%"
          />
          <NumberField
            label="Inflación anual estimada"
            value={Math.round(macro.inflacionAnual * 1000) / 10}
            onChange={(v) => patchMacro({ inflacionAnual: v / 100 })}
            suffix="%"
            helper="Promedio Banxico"
          />
          <NumberField
            label="Gasto mensual objetivo"
            value={macro.gastoMensualObjetivo}
            onChange={(v) => patchMacro({ gastoMensualObjetivo: v })}
            suffix="MXN"
            helper="Pesos de hoy"
          />
          <NumberField
            label="Tasa de retiro segura (SWR)"
            value={Math.round(macro.tasaRetiroSeguro * 1000) / 10}
            onChange={(v) => patchMacro({ tasaRetiroSeguro: v / 100 })}
            suffix="%"
          />
        </div>

        <div className="mt-5 rounded-xl bg-violet-50 p-3 text-center dark:bg-violet-500/10">
          <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500 dark:text-violet-400">
            Meta de capital objetivo
          </p>
          <p className="text-xl font-bold text-violet-700 dark:text-violet-300">{formatCurrency(capitalObjetivo)}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Escenarios de ahorro mensual</h2>
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id}>
              <NumberField
                label={
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: scenario.color }} />
                    {scenario.nombre}
                  </span>
                }
                value={scenario.aportacionMensual}
                onChange={(v) => patchScenario(scenario.id, v)}
                suffix="MXN/mes"
              />
              {macro.ingresoMensual > 0 && (
                <p className="mt-1 pl-1 text-[10px] text-slate-400 dark:text-slate-500">
                  {formatPercent(scenario.aportacionMensual / macro.ingresoMensual)} de tu ingreso mensual
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="px-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        Tasa real anual estimada:{' '}
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {formatPercent(((1 + macro.rendimientoNominal) / (1 + macro.inflacionAnual) - 1))}
        </span>
        . Todas las proyecciones se expresan en pesos de hoy.
      </p>
    </div>
  )
}

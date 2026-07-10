import { Banknote, Gift, PiggyBank, Scale } from 'lucide-react'
import type { PayrollConfig, PayrollResult } from '../types/payroll'
import { formatCurrency, formatPercent } from '../lib/formatters'
import { NumberField } from './fields'

interface NominaViewProps {
  payroll: PayrollConfig
  onPayrollChange: (payroll: PayrollConfig) => void
  result: PayrollResult
  taxYear: number
}

function KpiTile({
  icon: Icon,
  label,
  value,
  sublabel,
  color = '#7c3aed',
}: {
  icon: typeof Banknote
  label: string
  value: string
  sublabel?: string
  color?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon size={14} />
      </span>
      <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
      {sublabel && <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>}
    </div>
  )
}

function ConceptoFiscal({ nombre, bruto, exento, gravable }: { nombre: string; bruto: number; exento: number; gravable: number }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs last:border-0 dark:border-slate-800">
      <span className="font-medium text-slate-600 dark:text-slate-300">{nombre}</span>
      <span className="text-right text-slate-400 dark:text-slate-500">
        {formatCurrency(bruto)} bruto · {formatCurrency(exento)} exento ·{' '}
        <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrency(gravable)} gravable</span>
      </span>
    </div>
  )
}

export function NominaView({ payroll, onPayrollChange, result, taxYear }: NominaViewProps) {
  const patch = (p: Partial<PayrollConfig>) => onPayrollChange({ ...payroll, ...p })

  return (
    <div className="space-y-6">
      <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
        Cálculo educativo con tarifas ISR oficiales {taxYear} (SAT). No incluye subsidio al empleo; vales de
        despensa y fondo de ahorro se asumen exentos dentro de límites típicos. No sustituye asesoría fiscal.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sueldo y prestaciones</h2>
          <NumberField
            label="Sueldo bruto mensual"
            value={payroll.sueldoBrutoMensual}
            onChange={(v) => patch({ sueldoBrutoMensual: v })}
            suffix="MXN"
          />
          <NumberField
            label="Días de aguinaldo"
            value={payroll.diasAguinaldo}
            onChange={(v) => patch({ diasAguinaldo: v })}
            suffix="días"
          />
          <NumberField
            label="Días de vacaciones"
            value={payroll.diasVacaciones}
            onChange={(v) => patch({ diasVacaciones: v })}
            suffix="días"
          />
          <NumberField
            label="% prima vacacional"
            value={Math.round(payroll.primaVacacionalPorcentaje * 1000) / 10}
            onChange={(v) => patch({ primaVacacionalPorcentaje: v / 100 })}
            suffix="%"
          />
          <NumberField
            label="Utilidades (PTU) promedio anual"
            value={payroll.utilidadesPromedioAnual}
            onChange={(v) => patch({ utilidadesPromedioAnual: v })}
            suffix="MXN"
          />
          <NumberField
            label="Vales de despensa"
            value={payroll.valesDespensaMensual}
            onChange={(v) => patch({ valesDespensaMensual: v })}
            suffix="MXN/mes"
          />

          <h2 className="pt-2 text-sm font-semibold text-slate-900 dark:text-white">Fondo de ahorro</h2>
          <NumberField
            label="% aportación trabajador"
            value={Math.round(payroll.fondoAhorroPorcentajeTrabajador * 1000) / 10}
            onChange={(v) => patch({ fondoAhorroPorcentajeTrabajador: v / 100 })}
            suffix="%"
          />
          <NumberField
            label="% aportación empresa"
            value={Math.round(payroll.fondoAhorroPorcentajeEmpresa * 1000) / 10}
            onChange={(v) => patch({ fondoAhorroPorcentajeEmpresa: v / 100 })}
            suffix="%"
          />
          <NumberField
            label="Rendimiento anual del fondo"
            value={Math.round(payroll.fondoAhorroRendimientoAnual * 1000) / 10}
            onChange={(v) => patch({ fondoAhorroRendimientoAnual: v / 100 })}
            suffix="%"
          />
        </section>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiTile
              icon={Banknote}
              label="Sueldo neto mensual"
              value={formatCurrency(result.sueldoNetoMensual)}
              sublabel={`ISR retenido: ${formatCurrency(result.isrMensualCalculado)}`}
            />
            <KpiTile
              icon={Scale}
              label="ISR mensual (tarifa oficial)"
              value={formatCurrency(result.isrMensualCalculado)}
              sublabel={`Tasa efectiva: ${formatPercent(result.tasaEfectivaMensual)}`}
              color="#0ea5e9"
            />
            <KpiTile
              icon={Gift}
              label="Saldo declaración anual"
              value={formatCurrency(Math.abs(result.saldoDeclaracionAnual))}
              sublabel={result.saldoDeclaracionAnual >= 0 ? 'A cargo (debes pagar)' : 'A favor (te devuelven)'}
              color={result.saldoDeclaracionAnual >= 0 ? '#f43f5e' : '#10b981'}
            />
            <KpiTile
              icon={PiggyBank}
              label="Fondo de ahorro a 1 año"
              value={formatCurrency(result.fondoAhorroProyeccionUnAnio)}
              sublabel={`${formatCurrency(result.fondoAhorroAportacionMensualTotal)}/mes (trab. + empresa)`}
              color="#f59e0b"
            />
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Prestaciones: bruto, exento y gravable
            </h2>
            <ConceptoFiscal
              nombre="Aguinaldo"
              bruto={result.aguinaldoBruto}
              exento={result.aguinaldoExento}
              gravable={result.aguinaldoGravable}
            />
            <ConceptoFiscal
              nombre="Prima vacacional"
              bruto={result.primaVacacionalBruta}
              exento={result.primaVacacionalExenta}
              gravable={result.primaVacacionalGravable}
            />
            <ConceptoFiscal
              nombre="Utilidades (PTU)"
              bruto={result.utilidadesGravables + result.utilidadesExentas}
              exento={result.utilidadesExentas}
              gravable={result.utilidadesGravables}
            />
            <p className="pt-2 text-[11px] text-slate-400 dark:text-slate-500">
              Vales de despensa: {formatCurrency(result.valesDespensaAnual)}/año, 100% exento.
            </p>
          </section>

          <section className="rounded-2xl border border-violet-200 bg-violet-50 p-5 shadow-sm dark:border-violet-500/30 dark:bg-violet-500/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-violet-500 dark:text-violet-400">
                  Balance mensual disponible
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ingreso neto promedio {formatCurrency(result.ingresoNetoMensualPromedio)} − gastos{' '}
                  {formatCurrency(result.gastosMensualesTotal)}
                </p>
              </div>
              <p
                className={`text-2xl font-bold ${result.balanceMensualDisponible >= 0 ? 'text-violet-700 dark:text-violet-300' : 'text-rose-600 dark:text-rose-400'}`}
              >
                {formatCurrency(result.balanceMensualDisponible)}
              </p>
            </div>
          </section>

          <p className="px-1 text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            Ingreso bruto anual total: {formatCurrency(result.ingresoBrutoAnualTotal)} · Ingreso gravable anual:{' '}
            {formatCurrency(result.ingresoAnualGravable)} · Tasa efectiva anual:{' '}
            {formatPercent(result.isrAnualCalculado / result.ingresoAnualGravable)}
          </p>
        </div>
      </div>
    </div>
  )
}

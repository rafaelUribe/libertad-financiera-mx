import { Building2, HandCoins, Landmark, Plus, X } from 'lucide-react'
import type { FixedTermDeposit, Loan, Property } from '../types/assets'
import type { useAssetsCalculations } from '../hooks/useAssetsCalculations'
import { formatCurrency, formatPercent } from '../lib/formatters'
import { NumberField, TextField } from './fields'

interface PatrimonioViewProps {
  properties: Property[]
  onPropertiesChange: (properties: Property[]) => void
  loans: Loan[]
  onLoansChange: (loans: Loan[]) => void
  deposits: FixedTermDeposit[]
  onDepositsChange: (deposits: FixedTermDeposit[]) => void
  assets: ReturnType<typeof useAssetsCalculations>
}

function ItemHeader({ title, onRemove }: { title: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      {title}
      <button
        type="button"
        onClick={onRemove}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
        aria-label="Eliminar"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-3 text-xs font-medium text-slate-500 transition hover:border-violet-400 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:text-violet-400"
    >
      <Plus size={14} />
      {label}
    </button>
  )
}

export function PatrimonioView({
  properties,
  onPropertiesChange,
  loans,
  onLoansChange,
  deposits,
  onDepositsChange,
  assets,
}: PatrimonioViewProps) {
  const patchProperty = (id: string, patch: Partial<Property>) =>
    onPropertiesChange(properties.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const removeProperty = (id: string) => onPropertiesChange(properties.filter((p) => p.id !== id))
  const addProperty = () =>
    onPropertiesChange([
      ...properties,
      { id: `propiedad-${Date.now()}`, nombre: 'Nueva propiedad', valor: 1_000_000, plusvaliaAnualEstimada: 0.05, rentaMensual: 0, gastosMensuales: 0 },
    ])

  const patchLoan = (id: string, patch: Partial<Loan>) =>
    onLoansChange(loans.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  const removeLoan = (id: string) => onLoansChange(loans.filter((l) => l.id !== id))
  const addLoan = () =>
    onLoansChange([...loans, { id: `prestamo-${Date.now()}`, nombre: 'Nuevo préstamo', montoPrestado: 0, tasaRetornoAnual: 0.1 }])

  const patchDeposit = (id: string, patch: Partial<FixedTermDeposit>) =>
    onDepositsChange(deposits.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  const removeDeposit = (id: string) => onDepositsChange(deposits.filter((d) => d.id !== id))
  const addDeposit = () =>
    onDepositsChange([
      ...deposits,
      { id: `pagare-${Date.now()}`, nombre: 'Nuevo pagaré', institucion: '', monto: 0, tasaAnual: 0.1, retencionIsrPorcentaje: 0.005 },
    ])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Patrimonio en activos</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(assets.patrimonioTotalActivos)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Propiedades + préstamos + pagarés</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Ingreso pasivo mensual neto</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(assets.ingresoPasivoMensualNeto)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ya descontados impuestos</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Valor en propiedades</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(assets.valorTotalPropiedades)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {properties.length} {properties.length === 1 ? 'propiedad' : 'propiedades'}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Building2 size={16} className="text-violet-500" />
          Propiedades
        </h2>
        <div className="space-y-5">
          {assets.propiedades.map(({ property, isrResicoMensual, rentaAnualNetaDespuesImpuesto, rentabilidadRentaPct, rentabilidadTotalPct }) => (
            <div key={property.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <ItemHeader
                title={
                  <div className="flex-1 pr-2">
                    <TextField value={property.nombre} onChange={(v) => patchProperty(property.id, { nombre: v })} />
                  </div>
                }
                onRemove={() => removeProperty(property.id)}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <NumberField label="Valor" value={property.valor} onChange={(v) => patchProperty(property.id, { valor: v })} suffix="MXN" />
                <NumberField
                  label="Plusvalía anual"
                  value={Math.round(property.plusvaliaAnualEstimada * 1000) / 10}
                  onChange={(v) => patchProperty(property.id, { plusvaliaAnualEstimada: v / 100 })}
                  suffix="%"
                />
                <NumberField
                  label="Renta mensual"
                  value={property.rentaMensual}
                  onChange={(v) => patchProperty(property.id, { rentaMensual: v })}
                  suffix="MXN"
                />
                <NumberField
                  label="Gastos mensuales"
                  value={property.gastosMensuales}
                  onChange={(v) => patchProperty(property.id, { gastosMensuales: v })}
                  suffix="MXN"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>ISR RESICO: {formatCurrency(isrResicoMensual)}/mes</span>
                <span>Renta neta: {formatCurrency(rentaAnualNetaDespuesImpuesto)}/año</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">Rentabilidad renta: {formatPercent(rentabilidadRentaPct)}</span>
                <span className="font-medium text-violet-600 dark:text-violet-400">Rentabilidad total: {formatPercent(rentabilidadTotalPct)}</span>
              </div>
            </div>
          ))}
          <AddButton onClick={addProperty} label="Agregar propiedad" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <HandCoins size={16} className="text-emerald-500" />
          Préstamos ("yo te presto")
        </h2>
        <div className="space-y-5">
          {assets.prestamos.map(({ loan, ingresoAnualEstimado, ingresoMensualEstimado }) => (
            <div key={loan.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <ItemHeader
                title={
                  <div className="flex-1 pr-2">
                    <TextField value={loan.nombre} onChange={(v) => patchLoan(loan.id, { nombre: v })} />
                  </div>
                }
                onRemove={() => removeLoan(loan.id)}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Monto prestado"
                  value={loan.montoPrestado}
                  onChange={(v) => patchLoan(loan.id, { montoPrestado: v })}
                  suffix="MXN"
                />
                <NumberField
                  label="Retorno promedio anual"
                  value={Math.round(loan.tasaRetornoAnual * 1000) / 10}
                  onChange={(v) => patchLoan(loan.id, { tasaRetornoAnual: v / 100 })}
                  suffix="%"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>Ingreso: {formatCurrency(ingresoMensualEstimado)}/mes</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(ingresoAnualEstimado)}/año</span>
              </div>
            </div>
          ))}
          <AddButton onClick={addLoan} label="Agregar préstamo" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
          <Landmark size={16} className="text-sky-500" />
          Pagarés a plazo fijo (SOFIPOS, ej. Nu)
        </h2>
        <div className="space-y-5">
          {assets.pagares.map(({ deposit, rendimientoAnualBruto, isrRetenido, rendimientoAnualNeto }) => (
            <div key={deposit.id} className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
              <ItemHeader
                title={
                  <div className="flex flex-1 gap-2 pr-2">
                    <TextField value={deposit.nombre} onChange={(v) => patchDeposit(deposit.id, { nombre: v })} />
                    <TextField
                      value={deposit.institucion}
                      onChange={(v) => patchDeposit(deposit.id, { institucion: v })}
                      placeholder="Institución (Nu, Klar...)"
                    />
                  </div>
                }
                onRemove={() => removeDeposit(deposit.id)}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <NumberField label="Monto" value={deposit.monto} onChange={(v) => patchDeposit(deposit.id, { monto: v })} suffix="MXN" />
                <NumberField
                  label="Tasa anual"
                  value={Math.round(deposit.tasaAnual * 1000) / 10}
                  onChange={(v) => patchDeposit(deposit.id, { tasaAnual: v / 100 })}
                  suffix="%"
                />
                <NumberField
                  label="Retención ISR"
                  value={Math.round(deposit.retencionIsrPorcentaje * 10000) / 100}
                  onChange={(v) => patchDeposit(deposit.id, { retencionIsrPorcentaje: v / 100 })}
                  suffix="%"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <span>Bruto: {formatCurrency(rendimientoAnualBruto)}/año</span>
                <span>ISR: {formatCurrency(isrRetenido)}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">Neto: {formatCurrency(rendimientoAnualNeto)}/año</span>
              </div>
            </div>
          ))}
          <AddButton onClick={addDeposit} label="Agregar pagaré" />
        </div>
      </section>
    </div>
  )
}

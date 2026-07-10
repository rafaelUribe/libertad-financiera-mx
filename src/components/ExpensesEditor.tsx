import { useMemo, useEffect, useState, type ChangeEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { DepreciableExpenseItem, ExpenseItem, FlatExpenseItem } from '../types/expenses'
import { agruparPorCategoria, calcularCostoMensualItem, calcularDepreciacionMensual, calcularGastosMensualesTotal } from '../lib/expenses'
import { formatCurrency } from '../lib/formatters'
import { NumberField } from './fields'

interface ExpensesEditorProps {
  items: ExpenseItem[]
  onItemsChange: (items: ExpenseItem[]) => void
  inflacionAnual: number
}

const smallInputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

function RemoveButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Eliminar"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
    >
      <Trash2 size={14} />
    </button>
  )
}

/** Input numérico sin label wrapper para uso inline en filas */
function AmountInput({
  value,
  onChange,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText((cur) => (Number(cur) === value ? cur : String(value)))
  }, [value])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() !== '' && !Number.isNaN(parsed)) onChange(parsed)
  }

  const handleBlur = () => {
    if (text.trim() === '' || Number.isNaN(Number(text))) setText(String(value))
  }

  return (
    <div className="relative w-32 shrink-0">
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${smallInputClass} pr-9 tabular-nums`}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  )
}

function FlatItemRow({
  item,
  onChange,
  onRemove,
}: {
  item: FlatExpenseItem
  onChange: (patch: Partial<FlatExpenseItem>) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      {/* nombre del gasto — ocupa el espacio disponible */}
      <input
        value={item.nombre}
        onChange={(e) => onChange({ nombre: e.target.value })}
        placeholder="Nombre del gasto"
        className={`${smallInputClass} min-w-0 flex-1`}
      />
      {/* monto mensual — ancho fijo */}
      <AmountInput value={item.montoMensual} onChange={(v) => onChange({ montoMensual: v })} suffix="MXN" />
      <RemoveButton onRemove={onRemove} />
    </div>
  )
}

function DepreciableItemRow({
  item,
  inflacionAnual,
  onChange,
  onRemove,
}: {
  item: DepreciableExpenseItem
  inflacionAnual: number
  onChange: (patch: Partial<DepreciableExpenseItem>) => void
  onRemove: () => void
}) {
  const depreciacionMensual = calcularDepreciacionMensual(item, inflacionAnual)
  const costoMensual = calcularCostoMensualItem(item, inflacionAnual)

  return (
    <div className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
      <div className="mb-2 flex items-center gap-2">
        <input
          value={item.categoria}
          onChange={(e) => onChange({ categoria: e.target.value })}
          placeholder="Rubro"
          className={`${smallInputClass} w-28 shrink-0`}
        />
        <input
          value={item.nombre}
          onChange={(e) => onChange({ nombre: e.target.value })}
          placeholder="Nombre (ej. MacBook Pro)"
          className={`${smallInputClass} flex-1`}
        />
        <RemoveButton onRemove={onRemove} />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberField
          label="Valor adquisición"
          value={item.valorAdquisicion}
          onChange={(v) => onChange({ valorAdquisicion: v })}
          suffix="MXN"
        />
        <NumberField label="Vida útil" value={item.vidaUtilMeses} onChange={(v) => onChange({ vidaUtilMeses: v })} suffix="meses" />
        <NumberField
          label="Valor de recuperación"
          value={item.valorRecuperacion}
          onChange={(v) => onChange({ valorRecuperacion: v })}
          suffix="MXN"
        />
        <NumberField
          label="Gastos operativos"
          value={item.gastosOperativosMensuales}
          onChange={(v) => onChange({ gastosOperativosMensuales: v })}
          suffix="MXN/mes"
          helper="Mantenimiento, gasolina, seguro..."
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <input
            type="checkbox"
            checked={item.ajustarPorInflacion}
            onChange={(e) => onChange({ ajustarPorInflacion: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
          />
          Ajustar por inflación (reemplazar la misma versión a precio futuro)
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Depreciación: {formatCurrency(depreciacionMensual)}/mes ·{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">Total: {formatCurrency(costoMensual)}/mes</span>
        </span>
      </div>
    </div>
  )
}

export function ExpensesEditor({ items, onItemsChange, inflacionAnual }: ExpensesEditorProps) {
  const grupos = useMemo(() => agruparPorCategoria(items, inflacionAnual), [items, inflacionAnual])
  const total = useMemo(() => calcularGastosMensualesTotal(items, inflacionAnual), [items, inflacionAnual])

  const patchItem = (id: string, patch: Partial<ExpenseItem>) =>
    onItemsChange(items.map((it) => (it.id === id ? ({ ...it, ...patch } as ExpenseItem) : it)))
  const removeItem = (id: string) => onItemsChange(items.filter((it) => it.id !== id))

  const addFlatItem = (categoria: string) =>
    onItemsChange([...items, { kind: 'flat', id: `gasto-${Date.now()}`, categoria, nombre: 'Nuevo gasto', montoMensual: 0 }])

  const addDepreciableItem = (categoria: string) =>
    onItemsChange([
      ...items,
      {
        kind: 'depreciable',
        id: `activo-${Date.now()}`,
        categoria,
        nombre: 'Nuevo activo',
        valorAdquisicion: 0,
        vidaUtilMeses: 24,
        valorRecuperacion: 0,
        ajustarPorInflacion: false,
        gastosOperativosMensuales: 0,
      },
    ])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Gastos mensuales por rubro</h2>
        <button
          type="button"
          onClick={() => addFlatItem('Nueva categoría')}
          className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="space-y-5">
        {grupos.map((grupo) => (
          <div key={grupo.categoria} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {grupo.categoria}
              </span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {formatCurrency(grupo.totalMensual)}/mes
              </span>
            </div>

            <div className="space-y-2">
              {grupo.items.map((item) =>
                item.kind === 'flat' ? (
                  <FlatItemRow
                    key={item.id}
                    item={item}
                    onChange={(patch) => patchItem(item.id, patch)}
                    onRemove={() => removeItem(item.id)}
                  />
                ) : (
                  <DepreciableItemRow
                    key={item.id}
                    item={item}
                    inflacionAnual={inflacionAnual}
                    onChange={(patch) => patchItem(item.id, patch)}
                    onRemove={() => removeItem(item.id)}
                  />
                ),
              )}
            </div>

            <div className="mt-2 flex gap-4">
              <button
                type="button"
                onClick={() => addFlatItem(grupo.categoria)}
                className="text-[11px] font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                + gasto fijo
              </button>
              <button
                type="button"
                onClick={() => addDepreciableItem(grupo.categoria)}
                className="text-[11px] font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                + activo depreciable (gadget, auto...)
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
        <span className="font-medium text-slate-600 dark:text-slate-300">Total gastos</span>
        <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(total)}</span>
      </div>
    </section>
  )
}

import { useEffect, useState, type ChangeEvent, type ReactNode } from 'react'

const inputBaseClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white'

export function DateField({
  label,
  value,
  onChange,
  helper,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  helper?: string
  min?: string
  max?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
        {helper && <span className="text-[10px] text-slate-400 dark:text-slate-500">{helper}</span>}
      </span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className={`${inputBaseClass} dark:[color-scheme:dark]`}
      />
    </label>
  )
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label?: ReactNode
  value: string
  onChange: (value: string) => void
  placeholder?: string
  helper?: string
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
          {helper && <span className="text-[10px] text-slate-400 dark:text-slate-500">{helper}</span>}
        </span>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputBaseClass}
      />
    </label>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  helper,
}: {
  label: ReactNode
  value: number
  onChange: (value: number) => void
  suffix?: string
  helper?: string
}) {
  // El texto se maneja como estado local (en vez de un <input type="number"> controlado
  // directamente por `value`) para no pelear con el cursor mientras el usuario escribe:
  // un valor intermedio inválido (vacío, "12.") ya no se fuerza a 0 en cada tecla.
  const [text, setText] = useState(String(value))

  useEffect(() => {
    setText((current) => (Number(current) === value ? current : String(value)))
  }, [value])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() !== '' && !Number.isNaN(parsed)) onChange(parsed)
  }

  const handleBlur = () => {
    if (text.trim() === '' || Number.isNaN(Number(text))) setText(String(value))
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
        {helper && <span className="text-[10px] text-slate-400 dark:text-slate-500">{helper}</span>}
      </span>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          className={inputBaseClass}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </div>
    </label>
  )
}

import { useState } from 'react'
import { Check, Download } from 'lucide-react'
import { downloadJson } from '../lib/exportData'

interface ExportButtonProps {
  data: unknown
}

/** Descarga el export como .json y además lo copia al portapapeles, para pegarlo directo en un chat con un agente. */
export function ExportButton({ data }: ExportButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    const json = JSON.stringify(data, null, 2)
    downloadJson(`libertad-financiera-${new Date().toISOString().slice(0, 10)}.json`, data)
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // El portapapeles puede fallar sin HTTPS/permisos; la descarga del archivo ya sucedió.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Exportar datos como JSON (también se copia al portapapeles)"
      className={`flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 ${
        copied ? 'text-emerald-600 dark:text-emerald-400' : ''
      }`}
    >
      {copied ? <Check size={14} /> : <Download size={14} />}
      <span className="hidden sm:inline">{copied ? 'Copiado' : 'Exportar'}</span>
    </button>
  )
}

import { Moon, Sun, Cloud, CloudOff, Cog, HardDrive, Loader2, Settings2 } from 'lucide-react'
import type { SyncStatus } from '../types/finance'
import { ExportButton } from './ExportButton'

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
  syncStatus: SyncStatus
  onOpenSync: () => void
  onOpenConfig: () => void
  onOpenAdvancedConfig: () => void
  exportData: unknown
}

const STATUS_META: Record<SyncStatus, { label: string; icon: typeof Cloud; className: string }> = {
  local: { label: 'Guardado localmente', icon: HardDrive, className: 'text-slate-500 dark:text-slate-400' },
  firebase: { label: 'Sincronizado en la nube', icon: Cloud, className: 'text-emerald-600 dark:text-emerald-400' },
  sheets: { label: 'Sincronizado en la nube', icon: Cloud, className: 'text-emerald-600 dark:text-emerald-400' },
  syncing: { label: 'Sincronizando…', icon: Loader2, className: 'text-sky-600 dark:text-sky-400' },
  error: { label: 'Error de sincronización', icon: CloudOff, className: 'text-rose-600 dark:text-rose-400' },
}

export function Header({
  isDark,
  onToggleDark,
  syncStatus,
  onOpenSync,
  onOpenConfig,
  onOpenAdvancedConfig,
  exportData,
}: HeaderProps) {
  const status = STATUS_META[syncStatus]
  const StatusIcon = status.icon

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold shadow-lg shadow-violet-600/20">
            $
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight text-slate-900 dark:text-white sm:text-lg">
              Libertad Financiera
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dashboard MX · ajustado a inflación</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButton data={exportData} />

          <button
            type="button"
            onClick={onOpenSync}
            className={`hidden items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 sm:flex ${status.className}`}
          >
            <StatusIcon size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            {status.label}
          </button>

          <button
            type="button"
            onClick={onOpenSync}
            aria-label="Sincronización"
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 sm:hidden ${status.className}`}
          >
            <StatusIcon size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={onOpenConfig}
            aria-label="Configuración"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            <Settings2 size={16} />
          </button>

          <button
            type="button"
            onClick={onOpenAdvancedConfig}
            aria-label="Configuración avanzada"
            title="Tablas fiscales y respaldo de configuración"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Cog size={16} />
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            aria-label="Cambiar tema"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}

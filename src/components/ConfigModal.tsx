import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Eye, EyeOff, Trash2, Upload, X, Zap } from 'lucide-react'
import type { PersistenceConfig, StorageState } from '../types/finance'
import type { TaxConfig } from '../types/tax'
import { DEFAULT_TAX_CONFIG } from '../constants/tax'
import { STORAGE_KEYS } from '../constants/finance'
import { buildConfigBackup, parseConfigBackup, parseTaxConfig } from '../lib/configBackup'
import { downloadJson } from '../lib/exportData'
import { formatCurrency } from '../lib/formatters'

interface ConfigModalProps {
  open: boolean
  onClose: () => void
  taxConfig: TaxConfig
  onTaxConfigChange: (taxConfig: TaxConfig) => void
  fullState: StorageState
  onRestoreState: (state: StorageState) => void
  persistenceConfig: PersistenceConfig
  onPersistenceConfigChange: (config: PersistenceConfig) => void
}

type Tab = 'fiscal' | 'respaldo' | 'banxico'

function Message({ kind, text }: { kind: 'error' | 'success'; text: string }) {
  const Icon = kind === 'error' ? AlertCircle : CheckCircle2
  const className =
    kind === 'error'
      ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium ${className}`}>
      <Icon size={14} className="mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  )
}

export function ConfigModal({
  open,
  onClose,
  taxConfig,
  onTaxConfigChange,
  fullState,
  onRestoreState,
  persistenceConfig,
  onPersistenceConfigChange,
}: ConfigModalProps) {
  const [tab, setTab] = useState<Tab>('fiscal')
  const [taxText, setTaxText] = useState(() => JSON.stringify(taxConfig, null, 2))
  const [taxMessage, setTaxMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [backupMessage, setBackupMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [banxicoToken, setBanxicoToken] = useState(persistenceConfig.banxicoToken ?? '')
  const [showToken, setShowToken] = useState(false)
  const [banxicoMessage, setBanxicoMessage] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  if (!open) return null

  const resetAllData = () => {
    window.localStorage.removeItem(STORAGE_KEYS.state)
    window.localStorage.removeItem(STORAGE_KEYS.persistenceConfig)
    window.location.reload()
  }

  const applyTaxConfig = () => {
    try {
      const parsed = parseTaxConfig(taxText)
      onTaxConfigChange(parsed)
      setTaxMessage({ kind: 'success', text: 'Tablas fiscales actualizadas.' })
    } catch (error) {
      setTaxMessage({ kind: 'error', text: error instanceof Error ? error.message : 'JSON inválido.' })
    }
  }

  const restoreDefaultTaxConfig = () => {
    setTaxText(JSON.stringify(DEFAULT_TAX_CONFIG, null, 2))
    onTaxConfigChange(DEFAULT_TAX_CONFIG)
    setTaxMessage({ kind: 'success', text: `Restauradas las tablas ${DEFAULT_TAX_CONFIG.year} (SAT/INEGI).` })
  }

  const exportBackup = () => {
    downloadJson(`libertad-financiera-config-${new Date().toISOString().slice(0, 10)}.json`, buildConfigBackup(fullState))
  }

  const handleImportFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const state = parseConfigBackup(String(reader.result))
        onRestoreState(state)
        setTaxText(JSON.stringify(state.taxConfig, null, 2))
        setBackupMessage({ kind: 'success', text: 'Configuración importada y restaurada correctamente.' })
      } catch (error) {
        setBackupMessage({ kind: 'error', text: error instanceof Error ? error.message : 'No se pudo leer el archivo.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Configuración avanzada</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTab('fiscal')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === 'fiscal'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Tablas fiscales
            </button>
            <button
              type="button"
              onClick={() => setTab('banxico')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === 'banxico'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Banxico API
            </button>
            <button
              type="button"
              onClick={() => setTab('respaldo')}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                tab === 'respaldo'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Respaldo
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {tab === 'banxico' && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                  <Zap size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">Banxico SIE API</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Ingresa tu token del{' '}
                <a
                  href="https://www.banxico.org.mx/SieAPIRest/service/v1/token"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 underline hover:text-amber-700 dark:text-amber-400"
                >
                  SIE API de Banxico
                </a>{' '}
                para obtener datos en tiempo real de INPC, CETES, TIIE y tipo de cambio FIX. El token se guarda en este
                navegador y nunca sale de tu dispositivo.
              </p>

              <div className="space-y-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">Token Bmx-Token</span>
                  <div className="relative">
                    <input
                      id="banxico-token-input"
                      type={showToken ? 'text' : 'password'}
                      value={banxicoToken}
                      onChange={(e) => setBanxicoToken(e.target.value)}
                      placeholder="Ej: 11b631ac63e4c7eb89b31…"
                      className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 font-mono text-xs text-slate-900 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </label>
              </div>

              {banxicoMessage && <Message kind={banxicoMessage.kind} text={banxicoMessage.text} />}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBanxicoToken('')
                    onPersistenceConfigChange({ ...persistenceConfig, banxicoToken: undefined })
                    setBanxicoMessage({ kind: 'success', text: 'Token eliminado.' })
                  }}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = banxicoToken.trim()
                    if (!trimmed) {
                      setBanxicoMessage({ kind: 'error', text: 'El token no puede estar vacío.' })
                      return
                    }
                    onPersistenceConfigChange({ ...persistenceConfig, banxicoToken: trimmed })
                    setBanxicoMessage({ kind: 'success', text: 'Token guardado correctamente.' })
                  }}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
                >
                  Guardar token
                </button>
              </div>

              <div className="rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                <strong>Series consultadas:</strong> INPC General (SP74665), CETES 28d (SF60634), TIIE 28d (SF43718), FIX USD/MXN
                (SF61745). Límite: 80 req/min · 40 000 req/día. Los datos se cachean 6 horas.
              </div>
            </>
          )}

          {tab === 'fiscal' && (
            <>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Tablas actuales: <strong>ISR {taxConfig.year}</strong> · UMA diario{' '}
                <strong>{formatCurrency(taxConfig.umaDiario)}</strong>. Si el SAT/INEGI las vuelve a actualizar, pega
                aquí el JSON nuevo (mismo formato) y aplica los cambios — quedan guardadas en este navegador.
              </p>
              <textarea
                value={taxText}
                onChange={(e) => setTaxText(e.target.value)}
                spellCheck={false}
                rows={14}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              {taxMessage && <Message kind={taxMessage.kind} text={taxMessage.text} />}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={restoreDefaultTaxConfig}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  Restaurar valores {DEFAULT_TAX_CONFIG.year} (SAT)
                </button>
                <button
                  type="button"
                  onClick={applyTaxConfig}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
                >
                  Aplicar cambios
                </button>
              </div>
            </>
          )}

          {tab === 'respaldo' && (
            <>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Descarga o restaura <strong>toda</strong> tu configuración (parámetros, escenarios, nómina, patrimonio
                y tablas fiscales) como un solo archivo JSON. Útil para respaldar, mover tus datos a otro navegador, o
                editarlos manualmente.
              </p>

              <button
                type="button"
                onClick={exportBackup}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download size={14} />
                Exportar configuración completa
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-xs font-medium text-slate-500 transition hover:border-violet-400 hover:text-violet-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500 dark:hover:text-violet-400"
              >
                <Upload size={14} />
                Importar configuración (reemplaza tus datos actuales)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImportFile(file)
                  e.target.value = ''
                }}
              />

              {backupMessage && <Message kind={backupMessage.kind} text={backupMessage.text} />}

              <div className="rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                <strong className="text-slate-600 dark:text-slate-300">Flujo recomendado (sin backend):</strong>{' '}
                exporta el JSON y guárdalo en tu nube de confianza (Google Drive, iCloud, Dropbox). En cualquier otro
                navegador o dispositivo, descárgalo de tu nube e impórtalo aquí — desde ese momento persiste solo en
                el LocalStorage de ese navegador. Repite el export cada vez que hagas cambios importantes.
              </div>

              <div className="rounded-xl border border-rose-200 p-4 dark:border-rose-500/30">
                <p className="mb-2 text-xs font-semibold text-rose-600 dark:text-rose-400">Zona de peligro</p>
                {confirmReset ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Se borrarán todos tus datos guardados en este navegador (parámetros, escenarios, nómina,
                      patrimonio y tablas fiscales). Esta acción no se puede deshacer — exporta un respaldo primero si
                      no lo has hecho.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={resetAllData}
                        className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                      >
                        <Trash2 size={13} />
                        Sí, borrar todo
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={13} />
                    Borrar todos los datos y empezar de nuevo
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

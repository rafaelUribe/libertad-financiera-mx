import { useState } from 'react'
import { Cloud, CloudOff, HardDrive, Loader2, X } from 'lucide-react'
import type { PersistenceConfig, PersistenceProvider, SyncStatus } from '../types/finance'
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../services/storage/sheetsProvider'

interface SyncModalProps {
  open: boolean
  onClose: () => void
  persistenceConfig: PersistenceConfig
  onSave: (config: PersistenceConfig) => void
  syncStatus: SyncStatus
  syncError: string | null
}

const TABS: { id: PersistenceProvider; label: string }[] = [
  { id: 'localStorage', label: 'Local' },
  { id: 'firebase', label: 'Firebase' },
  { id: 'sheets', label: 'Google Sheets' },
]

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      />
    </label>
  )
}

export function SyncModal({ open, onClose, persistenceConfig, onSave, syncStatus, syncError }: SyncModalProps) {
  const [tab, setTab] = useState<PersistenceProvider>(persistenceConfig.provider)
  const [firebase, setFirebase] = useState(
    persistenceConfig.firebase ?? {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
      docId: '',
    },
  )
  const [sheets, setSheets] = useState(persistenceConfig.sheets ?? { webAppUrl: '', storageKey: '' })
  const [showScript, setShowScript] = useState(false)

  if (!open) return null

  const handleSave = () => {
    if (tab === 'firebase') onSave({ provider: 'firebase', firebase, sheets: persistenceConfig.sheets })
    else if (tab === 'sheets') onSave({ provider: 'sheets', sheets, firebase: persistenceConfig.firebase })
    else onSave({ provider: 'localStorage', firebase: persistenceConfig.firebase, sheets: persistenceConfig.sheets })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Sincronización en la nube</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <StatusBanner status={syncStatus} error={syncError} />

          <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          {tab === 'localStorage' && (
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Tus datos se guardan únicamente en este navegador (LocalStorage). No requiere configuración ni conexión
              a internet, pero no se sincronizan entre dispositivos.
            </p>
          )}

          {tab === 'firebase' && (
            <>
              <Field label="API Key" value={firebase.apiKey} onChange={(v) => setFirebase({ ...firebase, apiKey: v })} />
              <Field
                label="Auth Domain"
                value={firebase.authDomain}
                onChange={(v) => setFirebase({ ...firebase, authDomain: v })}
                placeholder="proyecto.firebaseapp.com"
              />
              <Field
                label="Project ID"
                value={firebase.projectId}
                onChange={(v) => setFirebase({ ...firebase, projectId: v })}
              />
              <Field label="App ID" value={firebase.appId} onChange={(v) => setFirebase({ ...firebase, appId: v })} />
              <Field
                label="Storage Bucket (opcional)"
                value={firebase.storageBucket ?? ''}
                onChange={(v) => setFirebase({ ...firebase, storageBucket: v })}
              />
              <Field
                label="Messaging Sender ID (opcional)"
                value={firebase.messagingSenderId ?? ''}
                onChange={(v) => setFirebase({ ...firebase, messagingSenderId: v })}
              />
              <Field
                label="Document ID"
                value={firebase.docId}
                onChange={(v) => setFirebase({ ...firebase, docId: v })}
                placeholder="ej. tu uid o un nombre único"
              />
              <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
                Se guardará en Firestore, colección <code className="font-mono">financial-dashboards</code>, documento
                con el Document ID indicado.
              </p>
            </>
          )}

          {tab === 'sheets' && (
            <>
              <Field
                label="URL del Google Apps Script Web App"
                value={sheets.webAppUrl}
                onChange={(v) => setSheets({ ...sheets, webAppUrl: v })}
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <Field
                label="Clave de almacenamiento"
                value={sheets.storageKey}
                onChange={(v) => setSheets({ ...sheets, storageKey: v })}
                placeholder="ej. tu nombre o email"
              />
              <button
                type="button"
                onClick={() => setShowScript((s) => !s)}
                className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                {showScript ? 'Ocultar' : 'Ver'} código de Apps Script de referencia
              </button>
              {showScript && (
                <pre className="max-h-48 overflow-auto rounded-lg bg-slate-900 p-3 text-[10px] leading-relaxed text-slate-200">
                  <code>{GOOGLE_APPS_SCRIPT_TEMPLATE}</code>
                </pre>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBanner({ status, error }: { status: SyncStatus; error: string | null }) {
  const meta: Record<SyncStatus, { label: string; icon: typeof Cloud; className: string }> = {
    local: { label: 'Guardado localmente', icon: HardDrive, className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
    firebase: { label: 'Sincronizado en la nube (Firebase)', icon: Cloud, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
    sheets: { label: 'Sincronizado en la nube (Google Sheets)', icon: Cloud, className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
    syncing: { label: 'Sincronizando…', icon: Loader2, className: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
    error: { label: error ?? 'Error de sincronización', icon: CloudOff, className: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' },
  }
  const { label, icon: Icon, className } = meta[status]

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${className}`}>
      <Icon size={14} className={status === 'syncing' ? 'animate-spin' : ''} />
      {label}
    </div>
  )
}

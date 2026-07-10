import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CUTOFF_SCENARIO, DEFAULT_MACRO_CONFIG, DEFAULT_SCENARIOS, STORAGE_KEYS } from '../constants/finance'
import { createStorageProvider } from '../services/storage/createStorageProvider'
import type { CutoffScenario, MacroConfig, PersistenceConfig, Scenario, StorageState, SyncStatus } from '../types/finance'

const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = { provider: 'localStorage' }
const SAVE_DEBOUNCE_MS = 600

function loadPersistenceConfig(): PersistenceConfig {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.persistenceConfig)
    if (!raw) return DEFAULT_PERSISTENCE_CONFIG
    return { ...DEFAULT_PERSISTENCE_CONFIG, ...JSON.parse(raw) } as PersistenceConfig
  } catch {
    return DEFAULT_PERSISTENCE_CONFIG
  }
}

/**
 * Hook de persistencia desacoplada: la UI solo conoce `macro`, `scenarios` y
 * `syncStatus`. Por debajo, delega en un StorageProvider (Firebase, Google
 * Sheets o LocalStorage) elegido según `persistenceConfig`, con LocalStorage
 * como caché de seguridad y fallback automático si el proveedor en la nube
 * falla o no tiene credenciales.
 */
export function useFinancialStorage() {
  const [persistenceConfig, setPersistenceConfig] = useState<PersistenceConfig>(loadPersistenceConfig)
  const [macro, setMacro] = useState<MacroConfig>(DEFAULT_MACRO_CONFIG)
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS)
  const [cutoffScenario, setCutoffScenario] = useState<CutoffScenario>(DEFAULT_CUTOFF_SCENARIO)
  const [isLoaded, setIsLoaded] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local')
  const [syncError, setSyncError] = useState<string | null>(null)

  const provider = useMemo(() => createStorageProvider(persistenceConfig), [persistenceConfig])
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextSaveRef = useRef(false)

  // Carga inicial (o recarga al cambiar de proveedor): intenta el proveedor
  // configurado y cae a la caché local si falla o no hay datos remotos aún.
  useEffect(() => {
    let cancelled = false
    setIsLoaded(false)
    setSyncStatus(provider.kind === 'localStorage' ? 'local' : 'syncing')
    setSyncError(null)

    provider
      .load()
      .then((remote) => {
        if (cancelled) return
        const fallback = remote ?? readLocalCache()
        if (fallback) {
          skipNextSaveRef.current = true
          setMacro({ ...DEFAULT_MACRO_CONFIG, ...fallback.macro })
          setScenarios(fallback.scenarios ?? DEFAULT_SCENARIOS)
          setCutoffScenario({ ...DEFAULT_CUTOFF_SCENARIO, ...fallback.cutoffScenario })
        }
        setSyncStatus(provider.kind === 'localStorage' ? 'local' : provider.kind)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        const fallback = readLocalCache()
        if (fallback) {
          skipNextSaveRef.current = true
          setMacro({ ...DEFAULT_MACRO_CONFIG, ...fallback.macro })
          setScenarios(fallback.scenarios ?? DEFAULT_SCENARIOS)
          setCutoffScenario({ ...DEFAULT_CUTOFF_SCENARIO, ...fallback.cutoffScenario })
        }
        setSyncStatus('error')
        setSyncError(error instanceof Error ? error.message : 'Error al sincronizar')
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [provider])

  // Guarda (con debounce) cada vez que cambian los datos, una vez cargados.
  useEffect(() => {
    if (!isLoaded) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    const state: StorageState = { macro, scenarios, cutoffScenario }
    window.localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state))

    if (provider.kind === 'localStorage') {
      setSyncStatus('local')
      return
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    setSyncStatus('syncing')
    saveTimeoutRef.current = setTimeout(() => {
      provider
        .save(state)
        .then(() => setSyncStatus(provider.kind === 'localStorage' ? 'local' : provider.kind))
        .catch((error: unknown) => {
          setSyncStatus('error')
          setSyncError(error instanceof Error ? error.message : 'Error al guardar')
        })
    }, SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [macro, scenarios, cutoffScenario, provider, isLoaded])

  const updatePersistenceConfig = useCallback((config: PersistenceConfig) => {
    window.localStorage.setItem(STORAGE_KEYS.persistenceConfig, JSON.stringify(config))
    setPersistenceConfig(config)
  }, [])

  return {
    macro,
    setMacro,
    scenarios,
    setScenarios,
    cutoffScenario,
    setCutoffScenario,
    isLoaded,
    syncStatus,
    syncError,
    persistenceConfig,
    updatePersistenceConfig,
  }
}

function readLocalCache(): StorageState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.state)
    if (!raw) return null
    return JSON.parse(raw) as StorageState
  } catch {
    return null
  }
}

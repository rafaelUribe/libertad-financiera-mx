import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CUTOFF_SCENARIO, DEFAULT_MACRO_CONFIG, DEFAULT_SCENARIOS, STORAGE_KEYS } from '../constants/finance'
import { DEFAULT_PAYROLL_CONFIG } from '../constants/payroll'
import { DEFAULT_DEPOSITS, DEFAULT_LOANS, DEFAULT_PROPERTIES } from '../constants/assets'
import { DEFAULT_TAX_CONFIG } from '../constants/tax'
import { createStorageProvider } from '../services/storage/createStorageProvider'
import type { CutoffScenario, MacroConfig, PersistenceConfig, Scenario, StorageState, SyncStatus } from '../types/finance'
import type { PayrollConfig } from '../types/payroll'
import type { FixedTermDeposit, Loan, Property } from '../types/assets'
import type { TaxConfig } from '../types/tax'

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

function withDefaults(fallback: Partial<StorageState> | null): StorageState {
  return {
    macro: { ...DEFAULT_MACRO_CONFIG, ...fallback?.macro },
    scenarios: fallback?.scenarios ?? DEFAULT_SCENARIOS,
    cutoffScenario: { ...DEFAULT_CUTOFF_SCENARIO, ...fallback?.cutoffScenario },
    payroll: { ...DEFAULT_PAYROLL_CONFIG, ...fallback?.payroll },
    properties: fallback?.properties ?? DEFAULT_PROPERTIES,
    loans: fallback?.loans ?? DEFAULT_LOANS,
    deposits: fallback?.deposits ?? DEFAULT_DEPOSITS,
    taxConfig: { ...DEFAULT_TAX_CONFIG, ...fallback?.taxConfig },
  }
}

/**
 * Hook de persistencia desacoplada: la UI solo conoce el estado y `syncStatus`.
 * Por debajo, delega en un StorageProvider (Firebase, Google Sheets o
 * LocalStorage) elegido según `persistenceConfig`, con LocalStorage como
 * caché de seguridad y fallback automático si el proveedor en la nube falla
 * o no tiene credenciales.
 */
export function useFinancialStorage() {
  const [persistenceConfig, setPersistenceConfig] = useState<PersistenceConfig>(loadPersistenceConfig)
  const [macro, setMacro] = useState<MacroConfig>(DEFAULT_MACRO_CONFIG)
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS)
  const [cutoffScenario, setCutoffScenario] = useState<CutoffScenario>(DEFAULT_CUTOFF_SCENARIO)
  const [payroll, setPayroll] = useState<PayrollConfig>(DEFAULT_PAYROLL_CONFIG)
  const [properties, setProperties] = useState<Property[]>(DEFAULT_PROPERTIES)
  const [loans, setLoans] = useState<Loan[]>(DEFAULT_LOANS)
  const [deposits, setDeposits] = useState<FixedTermDeposit[]>(DEFAULT_DEPOSITS)
  const [taxConfig, setTaxConfig] = useState<TaxConfig>(DEFAULT_TAX_CONFIG)
  const [isLoaded, setIsLoaded] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local')
  const [syncError, setSyncError] = useState<string | null>(null)

  const provider = useMemo(() => createStorageProvider(persistenceConfig), [persistenceConfig])
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextSaveRef = useRef(false)

  const applyState = (state: StorageState, { skipSave = false }: { skipSave?: boolean } = {}) => {
    if (skipSave) skipNextSaveRef.current = true
    setMacro(state.macro)
    setScenarios(state.scenarios)
    setCutoffScenario(state.cutoffScenario)
    setPayroll(state.payroll)
    setProperties(state.properties)
    setLoans(state.loans)
    setDeposits(state.deposits)
    setTaxConfig(state.taxConfig)
  }

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
        applyState(withDefaults(remote ?? readLocalCache()), { skipSave: true })
        setSyncStatus(provider.kind === 'localStorage' ? 'local' : provider.kind)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        applyState(withDefaults(readLocalCache()), { skipSave: true })
        setSyncStatus('error')
        setSyncError(error instanceof Error ? error.message : 'Error al sincronizar')
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider])

  // Guarda (con debounce) cada vez que cambian los datos, una vez cargados.
  useEffect(() => {
    if (!isLoaded) return
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false
      return
    }

    const state: StorageState = { macro, scenarios, cutoffScenario, payroll, properties, loans, deposits, taxConfig }
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
  }, [macro, scenarios, cutoffScenario, payroll, properties, loans, deposits, taxConfig, provider, isLoaded])

  const updatePersistenceConfig = useCallback((config: PersistenceConfig) => {
    window.localStorage.setItem(STORAGE_KEYS.persistenceConfig, JSON.stringify(config))
    setPersistenceConfig(config)
  }, [])

  /** Restaura todo el estado desde una configuración importada (JSON), guardándola de inmediato. */
  const restoreState = useCallback((state: StorageState) => {
    applyState(withDefaults(state))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    macro,
    setMacro,
    scenarios,
    setScenarios,
    cutoffScenario,
    setCutoffScenario,
    payroll,
    setPayroll,
    properties,
    setProperties,
    loans,
    setLoans,
    deposits,
    setDeposits,
    taxConfig,
    setTaxConfig,
    isLoaded,
    syncStatus,
    syncError,
    persistenceConfig,
    updatePersistenceConfig,
    restoreState,
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

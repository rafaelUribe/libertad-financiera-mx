import { useEffect, useMemo, useRef, useState } from 'react'
import { Header } from './components/Header'
import { ConfigPanel } from './components/ConfigPanel'
import { KpiCards } from './components/KpiCards'
import { ProjectionChart } from './components/ProjectionChart'
import { ProjectionChart25Years } from './components/ProjectionChart25Years'
import { CutoffScenarioView } from './components/CutoffScenarioView'
import { NominaView } from './components/NominaView'
import { PatrimonioView } from './components/PatrimonioView'
import { BalanceGeneralView } from './components/BalanceGeneralView'
import { SyncModal } from './components/SyncModal'
import { ConfigModal } from './components/ConfigModal'
import { BanxicoWidget } from './components/BanxicoWidget'
import { useFinancialCalculations } from './hooks/useFinancialCalculations'
import { useFinancialStorage } from './hooks/useFinancialStorage'
import { usePayrollCalculations } from './hooks/usePayrollCalculations'
import { useAssetsCalculations } from './hooks/useAssetsCalculations'
import { useDarkMode } from './hooks/useDarkMode'
import { useBanxicoData } from './hooks/useBanxicoData'
import { useHashTab } from './hooks/useHashTab'
import type { Tab } from './hooks/useHashTab'
import { buildExportPayload } from './lib/exportData'
import type { StorageState } from './types/finance'

const TABS: { id: Tab; label: string }[] = [
  { id: 'escenarios', label: 'Escenarios de ahorro' },
  { id: 'corte', label: '¿Y si dejo de aportar?' },
  { id: 'nomina', label: 'Nómina' },
  { id: 'patrimonio', label: 'Patrimonio' },
  { id: 'balance', label: 'Balance general' },
]

function App() {
  const { isDark, toggle } = useDarkMode()
  const {
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
    syncStatus,
    syncError,
    persistenceConfig,
    updatePersistenceConfig,
    restoreState,
  } = useFinancialStorage()

  const assets = useAssetsCalculations(properties, loans, deposits, taxConfig.tablaResico)

  // Derive/override capitalInicial and rendimientoNominal from patrimonioTotalActivos
  const macroConCapitalPatrimonio = useMemo(() => {
    const hasAssets = assets.patrimonioTotalActivos > 0
    return {
      ...macro,
      capitalInicial: assets.patrimonioTotalActivos,
      rendimientoNominal: hasAssets ? assets.rendimientoPonderadoAnual : macro.rendimientoNominal,
    }
  }, [macro, assets.patrimonioTotalActivos, assets.rendimientoPonderadoAnual])

  const payrollResult = usePayrollCalculations(payroll, taxConfig, macroConCapitalPatrimonio.inflacionAnual)

  const customScenarioFromState = useMemo(() => {
    const found = scenarios.find((s) => s.id === 'personalizado')
    if (found) return found
    const oldEquilibrado = scenarios.find((s) => s.id === 'equilibrado')
    return {
      id: 'personalizado',
      nombre: 'Ahorro personalizado',
      aportacionMensual: oldEquilibrado ? oldEquilibrado.aportacionMensual : 10000,
      color: '#10b981',
    }
  }, [scenarios])

  const computedScenarios = useMemo(() => {
    const B = Math.max(0, payrollResult.balanceMensualDisponible)
    return [
      {
        id: 'balance_100',
        nombre: 'Ahorro Real (100%)',
        aportacionMensual: B,
        color: '#7c3aed',
      },
      {
        id: 'balance_80',
        nombre: 'Ahorro 80%',
        aportacionMensual: Math.round(B * 0.8),
        color: '#8b5cf6',
      },
      {
        id: 'balance_60',
        nombre: 'Ahorro 60%',
        aportacionMensual: Math.round(B * 0.6),
        color: '#6366f1',
      },
      {
        id: 'balance_40',
        nombre: 'Ahorro 40%',
        aportacionMensual: Math.round(B * 0.4),
        color: '#0ea5e9',
      },
      {
        id: 'balance_20',
        nombre: 'Ahorro 20%',
        aportacionMensual: Math.round(B * 0.2),
        color: '#38bdf8',
      },
      {
        id: 'inercia',
        nombre: 'Inercia (0%)',
        aportacionMensual: 0,
        color: '#64748b',
      },
      customScenarioFromState,
    ]
  }, [payrollResult.balanceMensualDisponible, customScenarioFromState])

  const summary = useFinancialCalculations(macroConCapitalPatrimonio, computedScenarios, cutoffScenario)
  const { capitalObjetivo, resultados, edadActual, resultadoCorte } = summary

  const banxicoToken = persistenceConfig.banxicoToken ?? ''
  const { data: banxicoData, loading: banxicoLoading, error: banxicoError, refresh: banxicoRefresh } = useBanxicoData(banxicoToken)

  // Fallback de inflación cuando Banxico no está disponible
  const INFLACION_FALLBACK = 0.04

  // Referencia para saber si la inflación actual vino de Banxico o es el fallback
  const inflacionDesdeBanxico = useRef(false)

  // Auto-aplicar inflación de Banxico cuando llegan datos frescos
  useEffect(() => {
    if (banxicoData?.inpc !== null && banxicoData?.inpc !== undefined) {
      const nuevaInflacion = banxicoData.inpc / 100
      inflacionDesdeBanxico.current = true
      setMacro((prev) => ({ ...prev, inflacionAnual: nuevaInflacion }))
    }
  // Solo cuando cambia banxicoData — no incluir macro/setMacro para evitar loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banxicoData])

  // Si no hay token y la inflación nunca fue seteada por Banxico, asegurar fallback
  useEffect(() => {
    if (!banxicoToken && !inflacionDesdeBanxico.current) {
      setMacro((prev) =>
        prev.inflacionAnual === INFLACION_FALLBACK ? prev : { ...prev, inflacionAnual: INFLACION_FALLBACK },
      )
    }
  }, [banxicoToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [tab, setTab] = useHashTab()

  const exportPayload = useMemo(
    () => buildExportPayload(macroConCapitalPatrimonio, cutoffScenario, summary, payroll, payrollResult, assets, taxConfig),
    [macroConCapitalPatrimonio, cutoffScenario, summary, payroll, payrollResult, assets, taxConfig],
  )

  const fullState: StorageState = useMemo(
    () => ({ macro, scenarios, cutoffScenario, payroll, properties, loans, deposits, taxConfig }),
    [macro, scenarios, cutoffScenario, payroll, properties, loans, deposits, taxConfig],
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        isDark={isDark}
        onToggleDark={toggle}
        syncStatus={syncStatus}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenConfig={() => setConfigOpen((v) => !v)}
        onOpenAdvancedConfig={() => setAdvancedConfigOpen(true)}
        exportData={exportPayload}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside className={`${configOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="lg:sticky lg:top-24 space-y-4">
              <BanxicoWidget
                data={banxicoData}
                loading={banxicoLoading}
                error={banxicoError}
                onRefresh={banxicoRefresh}
                hasToken={!!banxicoToken}
              />
              <ConfigPanel
                macro={macroConCapitalPatrimonio}
                onMacroChange={setMacro}
                scenarios={computedScenarios}
                onScenariosChange={(updatedScenarios) => {
                  const customOnly = updatedScenarios.filter((s) => s.id === 'personalizado')
                  setScenarios(customOnly)
                }}
                capitalObjetivo={capitalObjetivo}
                edadActual={edadActual}
                ingresoNetoMensual={payrollResult.ingresoNetoMensualPromedio}
                inflacionDesdeBanxico={inflacionDesdeBanxico.current}
                patrimonioTotalActivos={assets.patrimonioTotalActivos}
              />
            </div>
          </aside>

          <div className="min-w-0 space-y-6">
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:w-fit">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 rounded-md px-4 py-1.5 text-xs font-medium transition ${
                    tab === t.id
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'escenarios' && (
              <>
                <KpiCards resultados={resultados} />
                <ProjectionChart resultados={resultados} capitalObjetivo={capitalObjetivo} />
              </>
            )}

            {tab === 'corte' && (
              <CutoffScenarioView
                ingresoNetoMensual={payrollResult.ingresoNetoMensualPromedio}
                cutoffScenario={cutoffScenario}
                onCutoffChange={setCutoffScenario}
                resultadoCorte={resultadoCorte}
                capitalObjetivo={capitalObjetivo}
                scenarios={computedScenarios}
              />
            )}

            {tab === 'nomina' && (
              <NominaView
                payroll={payroll}
                onPayrollChange={setPayroll}
                result={payrollResult}
                taxYear={taxConfig.year}
                inflacionAnual={macroConCapitalPatrimonio.inflacionAnual}
              />
            )}

            {tab === 'patrimonio' && (
              <PatrimonioView
                properties={properties}
                onPropertiesChange={setProperties}
                loans={loans}
                onLoansChange={setLoans}
                deposits={deposits}
                onDepositsChange={setDeposits}
                assets={assets}
              />
            )}

            {tab === 'balance' && <BalanceGeneralView payrollResult={payrollResult} assets={assets} />}
          </div>
        </div>

        {tab === 'escenarios' && (
          <div className="w-full pt-4">
            <ProjectionChart25Years resultados={resultados} capitalObjetivo={capitalObjetivo} />
          </div>
        )}
      </main>

      <SyncModal
        open={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        persistenceConfig={persistenceConfig}
        onSave={updatePersistenceConfig}
        syncStatus={syncStatus}
        syncError={syncError}
      />

      <ConfigModal
        open={advancedConfigOpen}
        onClose={() => setAdvancedConfigOpen(false)}
        taxConfig={taxConfig}
        onTaxConfigChange={setTaxConfig}
        fullState={fullState}
        onRestoreState={restoreState}
        persistenceConfig={persistenceConfig}
        onPersistenceConfigChange={updatePersistenceConfig}
      />
    </div>
  )
}

export default App

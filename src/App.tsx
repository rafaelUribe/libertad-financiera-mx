import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { ConfigPanel } from './components/ConfigPanel'
import { KpiCards } from './components/KpiCards'
import { ProjectionChart } from './components/ProjectionChart'
import { CutoffScenarioView } from './components/CutoffScenarioView'
import { NominaView } from './components/NominaView'
import { PatrimonioView } from './components/PatrimonioView'
import { BalanceGeneralView } from './components/BalanceGeneralView'
import { SyncModal } from './components/SyncModal'
import { ConfigModal } from './components/ConfigModal'
import { useFinancialCalculations } from './hooks/useFinancialCalculations'
import { useFinancialStorage } from './hooks/useFinancialStorage'
import { usePayrollCalculations } from './hooks/usePayrollCalculations'
import { useAssetsCalculations } from './hooks/useAssetsCalculations'
import { useDarkMode } from './hooks/useDarkMode'
import { buildExportPayload } from './lib/exportData'
import type { StorageState } from './types/finance'

type Tab = 'escenarios' | 'corte' | 'nomina' | 'patrimonio' | 'balance'

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

  const summary = useFinancialCalculations(macro, scenarios, cutoffScenario)
  const { capitalObjetivo, resultados, edadActual, resultadoCorte } = summary
  const payrollResult = usePayrollCalculations(payroll, taxConfig)
  const assets = useAssetsCalculations(properties, loans, deposits, taxConfig.tablaResico)

  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [advancedConfigOpen, setAdvancedConfigOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('escenarios')

  const exportPayload = useMemo(
    () => buildExportPayload(macro, cutoffScenario, summary, payroll, payrollResult, assets, taxConfig),
    [macro, cutoffScenario, summary, payroll, payrollResult, assets, taxConfig],
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

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[300px_1fr] lg:px-8 lg:py-8">
        <aside className={`${configOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="lg:sticky lg:top-24">
            <ConfigPanel
              macro={macro}
              onMacroChange={setMacro}
              scenarios={scenarios}
              onScenariosChange={setScenarios}
              capitalObjetivo={capitalObjetivo}
              edadActual={edadActual}
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
              macro={macro}
              cutoffScenario={cutoffScenario}
              onCutoffChange={setCutoffScenario}
              resultadoCorte={resultadoCorte}
              capitalObjetivo={capitalObjetivo}
            />
          )}

          {tab === 'nomina' && (
            <NominaView payroll={payroll} onPayrollChange={setPayroll} result={payrollResult} taxYear={taxConfig.year} />
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

          {tab === 'balance' && <BalanceGeneralView macro={macro} payrollResult={payrollResult} assets={assets} />}
        </div>
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
      />
    </div>
  )
}

export default App

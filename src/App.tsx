import { useState } from 'react'
import { Header } from './components/Header'
import { ConfigPanel } from './components/ConfigPanel'
import { KpiCards } from './components/KpiCards'
import { ProjectionChart } from './components/ProjectionChart'
import { CutoffScenarioView } from './components/CutoffScenarioView'
import { SyncModal } from './components/SyncModal'
import { useFinancialCalculations } from './hooks/useFinancialCalculations'
import { useFinancialStorage } from './hooks/useFinancialStorage'
import { useDarkMode } from './hooks/useDarkMode'

type Tab = 'escenarios' | 'corte'

function App() {
  const { isDark, toggle } = useDarkMode()
  const {
    macro,
    setMacro,
    scenarios,
    setScenarios,
    cutoffScenario,
    setCutoffScenario,
    syncStatus,
    syncError,
    persistenceConfig,
    updatePersistenceConfig,
  } = useFinancialStorage()

  const { capitalObjetivo, resultados, edadActual, resultadoCorte } = useFinancialCalculations(
    macro,
    scenarios,
    cutoffScenario,
  )

  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('escenarios')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header
        isDark={isDark}
        onToggleDark={toggle}
        syncStatus={syncStatus}
        onOpenSync={() => setSyncModalOpen(true)}
        onOpenConfig={() => setConfigOpen((v) => !v)}
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
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 sm:w-fit">
            <button
              type="button"
              onClick={() => setTab('escenarios')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                tab === 'escenarios'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Escenarios de ahorro
            </button>
            <button
              type="button"
              onClick={() => setTab('corte')}
              className={`rounded-md px-4 py-1.5 text-xs font-medium transition ${
                tab === 'corte'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              ¿Y si dejo de aportar?
            </button>
          </div>

          {tab === 'escenarios' ? (
            <>
              <KpiCards resultados={resultados} />
              <ProjectionChart resultados={resultados} capitalObjetivo={capitalObjetivo} />
            </>
          ) : (
            <CutoffScenarioView
              macro={macro}
              cutoffScenario={cutoffScenario}
              onCutoffChange={setCutoffScenario}
              resultadoCorte={resultadoCorte}
              capitalObjetivo={capitalObjetivo}
            />
          )}
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
    </div>
  )
}

export default App

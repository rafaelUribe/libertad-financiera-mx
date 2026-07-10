import { useCallback, useEffect, useState } from 'react'

export type Tab = 'escenarios' | 'corte' | 'nomina' | 'patrimonio' | 'balance'

const VALID_TABS: Tab[] = ['escenarios', 'corte', 'nomina', 'patrimonio', 'balance']
const DEFAULT_TAB: Tab = 'escenarios'

function parseHash(): Tab {
  const hash = window.location.hash.replace('#', '').toLowerCase() as Tab
  return VALID_TABS.includes(hash) ? hash : DEFAULT_TAB
}

/**
 * Hook de navegación por URL hash.
 * - Al montar lee el hash actual y lo usa como tab inicial.
 * - Al cambiar de tab actualiza el hash sin recargar la página.
 * - Si el usuario usa los botones Atrás/Adelante del browser, sincroniza el tab.
 */
export function useHashTab(): [Tab, (tab: Tab) => void] {
  const [tab, setTabState] = useState<Tab>(parseHash)

  // Sincroniza cuando el usuario navega con Atrás/Adelante
  useEffect(() => {
    const onHashChange = () => setTabState(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const setTab = useCallback((next: Tab) => {
    window.location.hash = next
    setTabState(next)
  }, [])

  return [tab, setTab]
}

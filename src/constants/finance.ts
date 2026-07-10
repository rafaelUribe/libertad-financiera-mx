import type { CutoffScenario, MacroConfig, Scenario } from '../types/finance'
import { toDateInputValue } from '../lib/date'

const EDAD_ACTUAL_POR_DEFECTO = 35
const ANIOS_CORTE_POR_DEFECTO = 5

function fechaNacimientoPorDefecto(): string {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() - EDAD_ACTUAL_POR_DEFECTO)
  return toDateInputValue(fecha)
}

function fechaCortePorDefecto(): string {
  const fecha = new Date()
  fecha.setFullYear(fecha.getFullYear() + ANIOS_CORTE_POR_DEFECTO)
  return toDateInputValue(fecha)
}

export const DEFAULT_MACRO_CONFIG: MacroConfig = {
  fechaNacimiento: fechaNacimientoPorDefecto(),
  capitalInicial: 2_500_000,
  rendimientoNominal: 0.12,
  inflacionAnual: 0.04,
  gastoMensualObjetivo: 40_000,
  tasaRetiroSeguro: 0.08,
  ingresoMensual: 60_000,
}

export const DEFAULT_CUTOFF_SCENARIO: CutoffScenario = {
  aportacionMensual: 14_000,
  fechaCorte: fechaCortePorDefecto(),
}

export const DEFAULT_SCENARIOS: Scenario[] = [
  { id: 'extremo', nombre: 'Extremo', aportacionMensual: 24_000, color: '#f43f5e' },
  { id: 'equilibrado', nombre: 'Equilibrado', aportacionMensual: 14_000, color: '#8b5cf6' },
  { id: 'comodo', nombre: 'Cómodo', aportacionMensual: 9_000, color: '#0ea5e9' },
  { id: 'inercia', nombre: 'Inercia', aportacionMensual: 0, color: '#94a3b8' },
]

/** Horizonte máximo de simulación, en años, para evitar loops infinitos si una meta nunca se alcanza */
export const HORIZONTE_MAXIMO_ANIOS = 60

export const STORAGE_KEYS = {
  state: 'finanzas-personales:state',
  persistenceConfig: 'finanzas-personales:persistence-config',
  theme: 'finanzas-personales:theme',
} as const

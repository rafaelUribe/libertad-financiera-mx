import type { PayrollConfig } from './payroll'
import type { FixedTermDeposit, Loan, Property } from './assets'
import type { TaxConfig } from './tax'

export interface MacroConfig {
  /** Fecha de nacimiento del usuario ("yyyy-mm-dd"); la edad actual se deriva de esta fecha */
  fechaNacimiento: string
  /** Capital inicial invertido (Present Value), en MXN */
  capitalInicial: number
  /** Rendimiento nominal anual esperado de la inversión (ej. 0.12 = 12%) */
  rendimientoNominal: number
  /** Inflación anual estimada (ej. 0.04 = 4%), promedio Banxico */
  inflacionAnual: number
  /** Gasto mensual objetivo en pesos de hoy (poder adquisitivo actual) */
  gastoMensualObjetivo: number
  /** Tasa de retiro seguro anual (Safe Withdrawal Rate), ej. 0.08 = 8% */
  tasaRetiroSeguro: number
}

export interface Scenario {
  id: string
  nombre: string
  aportacionMensual: number
  /** Color usado en la gráfica y acentos de UI */
  color: string
}

export interface ProjectionPoint {
  mes: number
  edad: number
  capital: number
}

export interface ScenarioResult {
  scenario: Scenario
  proyeccion: ProjectionPoint[]
  /** Meses necesarios para alcanzar la meta de capital objetivo (null si nunca se alcanza dentro del horizonte) */
  mesesParaMeta: number | null
  /** Años (con un decimal) necesarios para alcanzar la meta */
  aniosParaMeta: number | null
  /** Edad exacta (con un decimal) a la que se alcanza la meta */
  edadRetiro: number | null
  /** Fecha calendario estimada de retiro (null si nunca se alcanza dentro del horizonte) */
  fechaRetiro: Date | null
  /** Capital final proyectado al final del horizonte de simulación */
  capitalFinal: number
}

/** Escenario donde se aporta una cantidad fija solo hasta una fecha de corte, y de ahí en adelante el capital crece únicamente por interés compuesto. */
export interface CutoffScenario {
  aportacionMensual: number
  /** Fecha ("yyyy-mm-dd") en la que se deja de aportar */
  fechaCorte: string
}

export interface CutoffResult {
  cutoff: CutoffScenario
  proyeccion: ProjectionPoint[]
  /** Meses que se estará aportando antes del corte (0 si la fecha de corte ya pasó o es hoy) */
  mesesAportando: number
  /** Edad exacta en la que se deja de aportar */
  edadCorte: number
  /** Capital acumulado justo en el momento del corte */
  capitalAlCorte: number
  mesesParaMeta: number | null
  aniosParaMeta: number | null
  edadRetiro: number | null
  fechaRetiro: Date | null
  capitalFinal: number
}

export interface FinancialSummary {
  /** Edad actual derivada de la fecha de nacimiento */
  edadActual: number
  tasaRealAnual: number
  tasaRealMensual: number
  capitalObjetivo: number
  resultados: ScenarioResult[]
  resultadoCorte: CutoffResult
}

export type SyncStatus = 'local' | 'firebase' | 'sheets' | 'syncing' | 'error'

export interface StorageState {
  macro: MacroConfig
  scenarios: Scenario[]
  cutoffScenario: CutoffScenario
  payroll: PayrollConfig
  properties: Property[]
  loans: Loan[]
  deposits: FixedTermDeposit[]
  taxConfig: TaxConfig
}

export interface FirebaseCredentials {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket?: string
  messagingSenderId?: string
  appId: string
  /** Identificador del documento donde se guarda el estado (ej. uid o nombre de usuario) */
  docId: string
}

export interface GoogleSheetsCredentials {
  /** URL del Google Apps Script Web App desplegado (doGet/doPost) */
  webAppUrl: string
  /** Clave usada como "key" en el modelo key-value del Apps Script */
  storageKey: string
}

export type PersistenceProvider = 'localStorage' | 'firebase' | 'sheets'

export interface PersistenceConfig {
  provider: PersistenceProvider
  firebase?: FirebaseCredentials
  sheets?: GoogleSheetsCredentials
}

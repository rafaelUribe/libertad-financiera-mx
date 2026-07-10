import type { StorageState } from '../types/finance'
import type { TaxConfig } from '../types/tax'

const REQUIRED_STATE_KEYS: (keyof StorageState)[] = [
  'macro',
  'scenarios',
  'cutoffScenario',
  'payroll',
  'properties',
  'loans',
  'deposits',
  'taxConfig',
]

const REQUIRED_TAX_CONFIG_KEYS: (keyof TaxConfig)[] = ['year', 'umaDiario', 'tablaIsrMensual', 'tablaIsrAnual', 'tablaResico']

export interface ConfigBackup {
  app: string
  tipo: 'configuracion-completa'
  generadoEl: string
  estado: StorageState
}

export function buildConfigBackup(state: StorageState): ConfigBackup {
  return {
    app: 'Libertad Financiera - Dashboard MX',
    tipo: 'configuracion-completa',
    generadoEl: new Date().toISOString(),
    estado: state,
  }
}

/** Acepta tanto un respaldo completo (`{ estado: {...} }`) como un StorageState suelto. Lanza un Error legible si falta algo. */
export function parseConfigBackup(raw: string): StorageState {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  const candidato =
    parsed && typeof parsed === 'object' && 'estado' in parsed ? (parsed as ConfigBackup).estado : parsed

  if (!candidato || typeof candidato !== 'object') {
    throw new Error('No se encontró un objeto de configuración en el JSON.')
  }
  const faltantes = REQUIRED_STATE_KEYS.filter((key) => !(key in (candidato as object)))
  if (faltantes.length > 0) {
    throw new Error(`Faltan campos en la configuración: ${faltantes.join(', ')}.`)
  }
  return candidato as StorageState
}

/** Valida y parsea solo las tablas fiscales (ISR/RESICO/UMA), para el editor dedicado. */
export function parseTaxConfig(raw: string): TaxConfig {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('El JSON no es válido: revisa comas, comillas o llaves.')
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('El JSON debe ser un objeto con las tablas fiscales.')
  }
  const faltantes = REQUIRED_TAX_CONFIG_KEYS.filter((key) => !(key in (parsed as object)))
  if (faltantes.length > 0) {
    throw new Error(`Faltan campos: ${faltantes.join(', ')}.`)
  }
  const config = parsed as TaxConfig
  if (!Array.isArray(config.tablaIsrMensual) || !Array.isArray(config.tablaIsrAnual) || !Array.isArray(config.tablaResico)) {
    throw new Error('tablaIsrMensual, tablaIsrAnual y tablaResico deben ser arreglos.')
  }
  return config
}

import type { PersistenceConfig } from '../../types/finance'
import { FirebaseProvider } from './firebaseProvider'
import { localStorageProvider } from './localStorageProvider'
import { SheetsProvider } from './sheetsProvider'
import type { StorageProvider } from './StorageProvider'

function hasFirebaseCredentials(config: PersistenceConfig): boolean {
  const c = config.firebase
  return Boolean(c && c.apiKey && c.projectId && c.appId && c.docId)
}

function hasSheetsCredentials(config: PersistenceConfig): boolean {
  const c = config.sheets
  return Boolean(c && c.webAppUrl && c.storageKey)
}

/**
 * Fábrica que decide qué implementación de persistencia usar. Si el proveedor
 * elegido no tiene credenciales completas, cae de forma transparente en
 * LocalStorage para que la app nunca deje de ser funcional.
 */
export function createStorageProvider(config: PersistenceConfig): StorageProvider {
  if (config.provider === 'firebase' && hasFirebaseCredentials(config)) {
    return new FirebaseProvider(config.firebase!)
  }
  if (config.provider === 'sheets' && hasSheetsCredentials(config)) {
    return new SheetsProvider(config.sheets!)
  }
  return localStorageProvider
}

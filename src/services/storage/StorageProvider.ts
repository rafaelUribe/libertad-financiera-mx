import type { PersistenceProvider, StorageState } from '../../types/finance'

/**
 * Contrato común que deben cumplir todas las implementaciones de persistencia.
 * La UI y los hooks solo dependen de esta interfaz, nunca de un backend concreto,
 * lo que permite intercambiar Firebase / Google Sheets / LocalStorage sin tocar
 * el resto de la aplicación (patrón Strategy).
 */
export interface StorageProvider {
  readonly kind: PersistenceProvider
  load(): Promise<StorageState | null>
  save(state: StorageState): Promise<void>
}

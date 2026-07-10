import { STORAGE_KEYS } from '../../constants/finance'
import type { StorageState } from '../../types/finance'
import type { StorageProvider } from './StorageProvider'

/**
 * Implementación de respaldo: siempre funcional, sin credenciales ni red.
 * Se usa como fallback transparente cuando no hay proveedor en la nube
 * configurado, y como caché de seguridad incluso cuando sí lo hay.
 */
export class LocalStorageProvider implements StorageProvider {
  readonly kind = 'localStorage' as const

  async load(): Promise<StorageState | null> {
    const raw = window.localStorage.getItem(STORAGE_KEYS.state)
    if (!raw) return null
    try {
      return JSON.parse(raw) as StorageState
    } catch {
      return null
    }
  }

  async save(state: StorageState): Promise<void> {
    window.localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state))
  }
}

export const localStorageProvider = new LocalStorageProvider()

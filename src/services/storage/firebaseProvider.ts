import { initializeApp, type FirebaseApp } from 'firebase/app'
import { doc, getDoc, getFirestore, setDoc, type Firestore } from 'firebase/firestore'
import type { FirebaseCredentials, StorageState } from '../../types/finance'
import type { StorageProvider } from './StorageProvider'

const COLLECTION = 'financial-dashboards'

// Cachea la app de Firebase mientras las credenciales no cambien, para no
// reinicializar en cada render. Cada set de credenciales nuevo obtiene un
// nombre de app único y así evita el error "app already exists with different options".
let cachedApp: FirebaseApp | null = null
let cachedConfigKey: string | null = null

function getFirebaseApp(credentials: FirebaseCredentials): FirebaseApp {
  const configKey = JSON.stringify(credentials)
  if (cachedApp && cachedConfigKey === configKey) return cachedApp

  cachedApp = initializeApp(
    {
      apiKey: credentials.apiKey,
      authDomain: credentials.authDomain,
      projectId: credentials.projectId,
      storageBucket: credentials.storageBucket,
      messagingSenderId: credentials.messagingSenderId,
      appId: credentials.appId,
    },
    `finanzas-personales-${Date.now()}`,
  )
  cachedConfigKey = configKey
  return cachedApp
}

/**
 * Persiste el estado de la calculadora en un documento de Firestore
 * (colección `financial-dashboards`, un documento por `docId`).
 */
export class FirebaseProvider implements StorageProvider {
  readonly kind = 'firebase' as const
  private db: Firestore
  private credentials: FirebaseCredentials

  constructor(credentials: FirebaseCredentials) {
    this.credentials = credentials
    this.db = getFirestore(getFirebaseApp(credentials))
  }

  async load(): Promise<StorageState | null> {
    const ref = doc(this.db, COLLECTION, this.credentials.docId)
    const snapshot = await getDoc(ref)
    if (!snapshot.exists()) return null
    return snapshot.data() as StorageState
  }

  async save(state: StorageState): Promise<void> {
    const ref = doc(this.db, COLLECTION, this.credentials.docId)
    await setDoc(ref, state)
  }
}

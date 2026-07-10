import { useCallback, useEffect, useRef, useState } from 'react'
import type { BanxicoData } from '../types/banxico'
import { getBanxicoData } from '../services/banxico'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 horas: datos macroeconómicos no cambian tan seguido
const STORAGE_KEY = 'finanzas-personales:banxico-cache'

interface CacheEntry {
  data: BanxicoData
  fetchedAt: number
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
    return entry
  } catch {
    return null
  }
}

function writeCache(data: BanxicoData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }))
  } catch {
    /* ignorar errores de storage */
  }
}

export interface UseBanxicoDataResult {
  data: BanxicoData | null
  loading: boolean
  error: string | null
  /** Fuerza una nueva petición ignorando la caché */
  refresh: () => void
}

/**
 * Hook que obtiene los datos más recientes de Banxico.
 * Cachea el resultado 6 horas en localStorage para no agotar el rate limit.
 * Solo realiza la petición si el token está configurado.
 */
export function useBanxicoData(token: string): UseBanxicoDataResult {
  const [data, setData] = useState<BanxicoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!token?.trim()) {
        setData(null)
        setError(null)
        return
      }

      if (!forceRefresh) {
        const cached = readCache()
        if (cached) {
          setData(cached.data)
          return
        }
      }

      // Cancelar petición anterior si sigue en vuelo
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      setError(null)
      try {
        const result = await getBanxicoData(token)
        setData(result)
        writeCache(result)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    fetchData()
    return () => {
      abortRef.current?.abort()
    }
  }, [fetchData])

  const refresh = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    fetchData(true)
  }, [fetchData])

  return { data, loading, error, refresh }
}

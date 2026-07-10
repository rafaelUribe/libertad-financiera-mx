import type { BanxicoData, BanxicoResponse } from '../types/banxico'

const BASE_URL = 'https://www.banxico.org.mx/SieAPIRest/service/v1'

/** IDs de las series a consultar (INPC, CETES 28d, TIIE 28d, FIX) */
const SERIES_IDS = 'SP74665,SF60634,SF43718,SF61745'

function parseDato(valor: string | undefined): number | null {
  if (!valor || valor === 'N/E' || valor === 'N/A' || valor === '') return null
  const num = parseFloat(valor.replace(',', '.'))
  return isNaN(num) ? null : num
}

/**
 * Obtiene el dato más reciente (oportuno) de las series de interés.
 * Requiere que el token de Banxico sea válido.
 * Rate limit: 80 req/min, 40 000 req/día.
 */
export async function getBanxicoData(token: string): Promise<BanxicoData> {
  if (!token?.trim()) {
    throw new Error('Token de Banxico no configurado.')
  }

  const url = `${BASE_URL}/series/${SERIES_IDS}/datos/oportuno`
  const res = await fetch(url, {
    headers: {
      'Bmx-Token': token,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('Token inválido o expirado. Verifica tu token de Banxico.')
    }
    if (res.status === 429) {
      throw new Error('Límite de peticiones alcanzado. Intenta en unos minutos.')
    }
    throw new Error(`Error ${res.status} al consultar Banxico.`)
  }

  const json: BanxicoResponse = await res.json()
  const series = json?.bmx?.series ?? []

  const getSerie = (id: string) => series.find((s) => s.idSerie === id)
  const getLatestDato = (id: string) => {
    const serie = getSerie(id)
    if (!serie?.datos?.length) return null
    return serie.datos[serie.datos.length - 1]?.dato ?? null
  }

  // Fecha del dato más reciente disponible (usamos CETES como referencia)
  const fechaSerie = getSerie('SF60634')
  const fechaActualizacion =
    fechaSerie?.datos?.[fechaSerie.datos.length - 1]?.fecha ?? null

  return {
    inpc: parseDato(getLatestDato('SP74665') ?? undefined),
    cetes28: parseDato(getLatestDato('SF60634') ?? undefined),
    tiie28: parseDato(getLatestDato('SF43718') ?? undefined),
    fix: parseDato(getLatestDato('SF61745') ?? undefined),
    fechaActualizacion,
  }
}

/**
 * Obtiene datos de series en un rango de fechas (yyyy-MM-dd).
 * Rate limit: 200 req/5min, 10 000 req/día.
 */
export async function getBanxicoDataByRange(
  token: string,
  fechaIni: string,
  fechaFin: string,
): Promise<BanxicoResponse> {
  if (!token?.trim()) throw new Error('Token de Banxico no configurado.')

  const url = `${BASE_URL}/series/${SERIES_IDS}/datos/${fechaIni}/${fechaFin}`
  const res = await fetch(url, {
    headers: { 'Bmx-Token': token, Accept: 'application/json' },
  })

  if (!res.ok) throw new Error(`Error ${res.status} al consultar Banxico.`)
  return res.json()
}

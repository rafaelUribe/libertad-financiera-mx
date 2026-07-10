import type { BanxicoData, BanxicoResponse } from '../types/banxico'

/**
 * URL base del proxy Netlify Function.
 * En producción y en `netlify dev` el path relativo funciona directamente.
 * En Vite puro (npm run dev sin netlify) este endpoint no existe, por eso
 * la app siempre debe levantarse con `netlify dev`.
 */
const PROXY_URL = '/.netlify/functions/banxico'

function parseDato(valor: string | undefined): number | null {
  if (!valor || valor === 'N/E' || valor === 'N/A' || valor === '') return null
  const num = parseFloat(valor.replace(',', '.'))
  return isNaN(num) ? null : num
}

async function callProxy(token: string, params: Record<string, string> = {}): Promise<Response> {
  const query = new URLSearchParams(params).toString()
  const url = query ? `${PROXY_URL}?${query}` : PROXY_URL

  const res = await fetch(url, {
    headers: {
      'X-Bmx-Token': token,
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    let message = `Error ${res.status}.`
    try {
      const json = await res.json()
      if (json?.error) message = json.error
    } catch {
      /* ignorar */
    }
    throw new Error(message)
  }

  return res
}

/**
 * Obtiene el dato más reciente (oportuno) de las series de interés
 * a través del proxy Netlify Function (evita CORS).
 */
export async function getBanxicoData(token: string): Promise<BanxicoData> {
  if (!token?.trim()) throw new Error('Token de Banxico no configurado.')

  const res = await callProxy(token, { endpoint: 'oportuno' })
  const json: BanxicoResponse = await res.json()
  const series = json?.bmx?.series ?? []

  const getSerie = (id: string) => series.find((s) => s.idSerie === id)
  const getLatestDato = (id: string) => {
    const serie = getSerie(id)
    if (!serie?.datos?.length) return null
    return serie.datos[serie.datos.length - 1]?.dato ?? null
  }

  const fechaSerie = getSerie('SF60634')
  const fechaActualizacion =
    fechaSerie?.datos?.[fechaSerie.datos.length - 1]?.fecha ?? null

  // SP74665 → Inflación no subyacente anual
  // SF43718 → FIX USD/MXN
  // SF60634 → CETES 91 días (tasa de rendimiento)
  // SF61745 → Tasa objetivo Banxico
  return {
    inpc: parseDato(getLatestDato('SP74665') ?? undefined),
    cetes28: parseDato(getLatestDato('SF60634') ?? undefined),
    tiie28: parseDato(getLatestDato('SF61745') ?? undefined),
    fix: parseDato(getLatestDato('SF43718') ?? undefined),
    fechaActualizacion,
  }
}

/**
 * Obtiene datos en un rango de fechas (yyyy-MM-dd) vía proxy.
 */
export async function getBanxicoDataByRange(
  token: string,
  fechaIni: string,
  fechaFin: string,
): Promise<BanxicoResponse> {
  if (!token?.trim()) throw new Error('Token de Banxico no configurado.')
  const res = await callProxy(token, { endpoint: 'rango', fechaIni, fechaFin })
  return res.json()
}

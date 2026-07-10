/**
 * Proxy server-side para la API SIE REST de Banxico.
 * Escrito en JS puro para evitar problemas de compilación TS en Netlify.
 * Requiere Node 18+ (fetch nativo) — definido en netlify.toml.
 *
 * El cliente envía su token en el header X-Bmx-Token.
 * Query params:
 *   endpoint  = 'oportuno' (default) | 'rango'
 *   fechaIni  = 'yyyy-MM-dd'  (solo endpoint=rango)
 *   fechaFin  = 'yyyy-MM-dd'  (solo endpoint=rango)
 */

const BANXICO_BASE = 'https://www.banxico.org.mx/SieAPIRest/service/v1'
const SERIES_IDS = 'SP30578,SF60634,SF43718,SF61745'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Bmx-Token',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

const json = (statusCode, body, extra = {}) => ({
  statusCode,
  headers: { ...CORS, 'Content-Type': 'application/json', ...extra },
  body: typeof body === 'string' ? body : JSON.stringify(body),
})

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const token = (event.headers['x-bmx-token'] ?? '').trim()
  if (!token) {
    return json(401, { error: 'Token de Banxico no proporcionado.' })
  }

  const params = event.queryStringParameters ?? {}
  const endpoint = params['endpoint'] ?? 'oportuno'
  const { fechaIni, fechaFin } = params

  const banxicoUrl =
    endpoint === 'rango' && fechaIni && fechaFin
      ? `${BANXICO_BASE}/series/${SERIES_IDS}/datos/${fechaIni}/${fechaFin}`
      : `${BANXICO_BASE}/series/${SERIES_IDS}/datos/oportuno`

  let res
  try {
    res = await fetch(banxicoUrl, {
      headers: { 'Bmx-Token': token, Accept: 'application/json' },
    })
  } catch (err) {
    console.error('[banxico-proxy] fetch error:', err)
    return json(502, { error: 'No se pudo conectar con el servidor de Banxico.' })
  }

  const body = await res.text()

  if (!res.ok) {
    const s = res.status
    const msg =
      s === 400 ? 'Petición inválida. Verifica los parámetros.' :
      s === 401 || s === 403 ? 'Token inválido o expirado. Verifica tu token de Banxico.' :
      s === 429 ? 'Límite de peticiones alcanzado. Intenta en unos minutos.' :
      `Error ${s} al consultar Banxico.`
    return json(s, { error: msg })
  }

  return json(200, body)
}

import type { Handler, HandlerEvent } from '@netlify/functions'

const BANXICO_BASE = 'https://www.banxico.org.mx/SieAPIRest/service/v1'
const SERIES_IDS = 'SP74665,SF60634,SF43718,SF61745'

/**
 * Proxy server-side para la API SIE de Banxico.
 * Evita el bloqueo CORS al hacer la petición desde el servidor de Netlify.
 *
 * Query params:
 *   endpoint  = 'oportuno' (default) | 'rango'
 *   fechaIni  = 'yyyy-MM-dd'  (solo con endpoint=rango)
 *   fechaFin  = 'yyyy-MM-dd'  (solo con endpoint=rango)
 *
 * El token de Banxico se envía desde el cliente en el header X-Bmx-Token.
 */
export const handler: Handler = async (event: HandlerEvent) => {
  // CORS para el cliente browser
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Bmx-Token',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' }
  }

  const token = event.headers['x-bmx-token'] ?? ''
  if (!token.trim()) {
    return {
      statusCode: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Token de Banxico no proporcionado.' }),
    }
  }

  const params = event.queryStringParameters ?? {}
  const endpoint = params['endpoint'] ?? 'oportuno'
  const fechaIni = params['fechaIni']
  const fechaFin = params['fechaFin']

  let banxicoUrl: string
  if (endpoint === 'rango' && fechaIni && fechaFin) {
    banxicoUrl = `${BANXICO_BASE}/series/${SERIES_IDS}/datos/${fechaIni}/${fechaFin}`
  } else {
    banxicoUrl = `${BANXICO_BASE}/series/${SERIES_IDS}/datos/oportuno`
  }

  try {
    const res = await fetch(banxicoUrl, {
      headers: {
        'Bmx-Token': token,
        Accept: 'application/json',
      },
    })

    const body = await res.text()

    if (!res.ok) {
      const status = res.status
      let message = `Error ${status} al consultar Banxico.`
      if (status === 400) message = 'Petición inválida. Verifica los parámetros.'
      if (status === 401 || status === 403) message = 'Token inválido o expirado. Verifica tu token de Banxico.'
      if (status === 429) message = 'Límite de peticiones alcanzado. Intenta en unos minutos.'
      return {
        statusCode: status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: message }),
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body,
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No se pudo conectar con el servidor de Banxico.' }),
    }
  }
}

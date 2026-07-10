/** Tipos para la API SIE REST de Banxico */

export interface BanxicoSerie {
  idSerie: string
  titulo: string
  fechaInicio: string
  fechaFin: string
  periodicidad: string
  cifra: string
  unidad: string
  multiplicador: string
  obs_fin: string
}

export interface BanxicoDato {
  fecha: string
  dato: string
}

export interface BanxicoSerieConDatos extends BanxicoSerie {
  datos: BanxicoDato[]
}

export interface BanxicoResponse {
  bmx: {
    series: BanxicoSerieConDatos[]
  }
}

/** Series de interés para finanzas personales */
export const BANXICO_SERIES = {
  /** INPC General — inflación acumulada */
  INPC: 'SP74665',
  /** CETES 28 días */
  CETES_28: 'SF60634',
  /** TIIE 28 días (tasa de referencia interbancaria) */
  TIIE_28: 'SF43718',
  /** Tipo de cambio FIX USD/MXN */
  FIX: 'SF61745',
  /** Tasa objetivo Banxico */
  TASA_OBJETIVO: 'SF61745',
} as const

export type BanxicoSerieId = (typeof BANXICO_SERIES)[keyof typeof BANXICO_SERIES]

export interface BanxicoData {
  inpc: number | null
  cetes28: number | null
  tiie28: number | null
  fix: number | null
  /** Fecha del último dato disponible (ISO string) */
  fechaActualizacion: string | null
}

export interface BanxicoConfig {
  /** Token de autenticación del SIE API de Banxico */
  token: string
}

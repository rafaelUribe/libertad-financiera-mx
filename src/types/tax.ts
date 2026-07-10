/** Un tramo de una tarifa progresiva de ISR (cuota fija + % sobre excedente del límite inferior). */
export interface TaxBracket {
  limiteInferior: number
  /** `Infinity` en el último tramo */
  limiteSuperior: number
  cuotaFija: number
  porcentajeExcedente: number
}

/** Un tramo de la tabla RESICO: tasa única aplicada a todo el ingreso si cae dentro de este tramo. */
export interface ResicoBracket {
  /** `Infinity` en el último tramo */
  limiteSuperior: number
  tasa: number
}

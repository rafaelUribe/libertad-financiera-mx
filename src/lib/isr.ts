import type { ResicoBracket, TaxBracket } from '../types/tax'

/** Aplica una tarifa progresiva (cuota fija + % sobre excedente del límite inferior) a un ingreso. */
export function calcularISRTarifa(ingreso: number, tabla: TaxBracket[]): number {
  if (ingreso <= 0) return 0
  const tramo = tabla.find((t) => ingreso >= t.limiteInferior && ingreso <= t.limiteSuperior) ?? tabla[tabla.length - 1]
  const excedente = ingreso - tramo.limiteInferior
  return tramo.cuotaFija + excedente * tramo.porcentajeExcedente
}

/** RESICO: se ubica el tramo donde cae el ingreso mensual y se aplica esa tasa única a todo el ingreso (no es marginal, no admite deducciones). */
export function calcularISRResico(ingresoMensual: number, tabla: ResicoBracket[]): number {
  if (ingresoMensual <= 0) return 0
  const tramo = tabla.find((t) => ingresoMensual <= t.limiteSuperior) ?? tabla[tabla.length - 1]
  return ingresoMensual * tramo.tasa
}

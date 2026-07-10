import type { FixedTermDeposit, FixedTermDepositResult, Loan, LoanResult, Property, PropertyResult } from '../types/assets'
import type { ResicoBracket } from '../types/tax'
import { calcularISRResico } from './isr'

/**
 * Rentabilidad de una propiedad en renta: la renta se grava con RESICO
 * (tasa única sobre el ingreso bruto mensual, sin deducciones permitidas),
 * y se combina con la plusvalía esperada para obtener el retorno total.
 */
export function calcularRentabilidadPropiedad(property: Property, tablaResico: ResicoBracket[]): PropertyResult {
  const rentaAnualBruta = property.rentaMensual * 12
  const gastosAnuales = property.gastosMensuales * 12
  const isrResicoMensual = calcularISRResico(property.rentaMensual, tablaResico)
  const isrResicoAnual = isrResicoMensual * 12
  const rentaAnualNetaDespuesImpuesto = rentaAnualBruta - gastosAnuales - isrResicoAnual
  const plusvaliaAnualEstimadaMXN = property.valor * property.plusvaliaAnualEstimada

  const rentabilidadRentaPct = property.valor > 0 ? rentaAnualNetaDespuesImpuesto / property.valor : 0
  const rentabilidadTotalPct =
    property.valor > 0 ? (rentaAnualNetaDespuesImpuesto + plusvaliaAnualEstimadaMXN) / property.valor : 0

  return {
    property,
    rentaAnualBruta,
    gastosAnuales,
    isrResicoMensual,
    isrResicoAnual,
    rentaAnualNetaDespuesImpuesto,
    plusvaliaAnualEstimadaMXN,
    rentabilidadRentaPct,
    rentabilidadTotalPct,
  }
}

/** Préstamos fintech (ej. yotepresto): la plataforma retiene un % de ISR provisional (típicamente 20%) sobre los intereses cobrados. */
export function calcularRendimientoPrestamo(loan: Loan): LoanResult {
  const ingresoAnualBruto = loan.montoPrestado * loan.tasaRetornoAnual
  const isrRetenidoAnual = ingresoAnualBruto * loan.retencionIsrPorcentaje
  const ingresoAnualNeto = ingresoAnualBruto - isrRetenidoAnual
  return { loan, ingresoAnualBruto, isrRetenidoAnual, ingresoAnualNeto, ingresoMensualNeto: ingresoAnualNeto / 12 }
}

export function calcularRendimientoPagare(deposit: FixedTermDeposit): FixedTermDepositResult {
  const rendimientoAnualBruto = deposit.monto * deposit.tasaAnual
  const isrRetenido = deposit.monto * deposit.retencionIsrPorcentaje
  return { deposit, rendimientoAnualBruto, isrRetenido, rendimientoAnualNeto: rendimientoAnualBruto - isrRetenido }
}

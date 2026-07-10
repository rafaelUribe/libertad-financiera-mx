import { useMemo } from 'react'
import type { FixedTermDeposit, Loan, Property } from '../types/assets'
import type { ResicoBracket } from '../types/tax'
import { calcularRendimientoPagare, calcularRendimientoPrestamo, calcularRentabilidadPropiedad } from '../lib/assets'

export function useAssetsCalculations(
  properties: Property[],
  loans: Loan[],
  deposits: FixedTermDeposit[],
  tablaResico: ResicoBracket[],
) {
  return useMemo(() => {
    const propiedades = properties.map((p) => calcularRentabilidadPropiedad(p, tablaResico))
    const prestamos = loans.map(calcularRendimientoPrestamo)
    const pagares = deposits.map(calcularRendimientoPagare)

    const valorTotalPropiedades = properties.reduce((sum, p) => sum + p.valor, 0)
    const montoTotalPrestamos = loans.reduce((sum, l) => sum + l.montoPrestado, 0)
    const montoTotalPagares = deposits.reduce((sum, d) => sum + d.monto, 0)
    const patrimonioTotalActivos = valorTotalPropiedades + montoTotalPrestamos + montoTotalPagares

    const ingresoPasivoMensualNeto =
      propiedades.reduce((sum, r) => sum + r.rentaAnualNetaDespuesImpuesto, 0) / 12 +
      prestamos.reduce((sum, r) => sum + r.ingresoMensualNeto, 0) +
      pagares.reduce((sum, r) => sum + r.rendimientoAnualNeto, 0) / 12

    const retornoAnualPropiedades = propiedades.reduce((sum, r) => sum + r.rentaAnualNetaDespuesImpuesto + r.plusvaliaAnualEstimadaMXN, 0)
    const retornoAnualPrestamos = prestamos.reduce((sum, r) => sum + r.ingresoAnualNeto, 0)
    const retornoAnualPagares = pagares.reduce((sum, r) => sum + r.rendimientoAnualNeto, 0)

    const retornoAnualTotalActivos = retornoAnualPropiedades + retornoAnualPrestamos + retornoAnualPagares
    const rendimientoPonderadoAnual = patrimonioTotalActivos > 0 ? retornoAnualTotalActivos / patrimonioTotalActivos : 0

    return {
      propiedades,
      prestamos,
      pagares,
      valorTotalPropiedades,
      montoTotalPrestamos,
      montoTotalPagares,
      patrimonioTotalActivos,
      ingresoPasivoMensualNeto,
      rendimientoPonderadoAnual,
    }
  }, [properties, loans, deposits, tablaResico])
}

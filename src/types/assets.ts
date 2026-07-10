export interface Property {
  id: string
  nombre: string
  /** Valor comercial actual, en MXN */
  valor: number
  /** Plusvalía anual esperada, ej. 0.05 = 5% */
  plusvaliaAnualEstimada: number
  /** Renta mensual cobrada, en MXN (ingreso bruto) */
  rentaMensual: number
  /** Gastos mensuales del inmueble: mantenimiento, predial, administración, etc. */
  gastosMensuales: number
}

export interface PropertyResult {
  property: Property
  rentaAnualBruta: number
  gastosAnuales: number
  isrResicoMensual: number
  isrResicoAnual: number
  rentaAnualNetaDespuesImpuesto: number
  plusvaliaAnualEstimadaMXN: number
  rentabilidadRentaPct: number
  rentabilidadTotalPct: number
}

/** Dinero prestado a un tercero ("yo te presto") a cambio de un retorno periódico. */
export interface Loan {
  id: string
  nombre: string
  montoPrestado: number
  tasaRetornoAnual: number
}

export interface LoanResult {
  loan: Loan
  ingresoAnualEstimado: number
  ingresoMensualEstimado: number
}

/** Instrumento de inversión a plazo fijo (pagaré / SOFIPO tipo Nu, Klar, etc). */
export interface FixedTermDeposit {
  id: string
  nombre: string
  institucion: string
  monto: number
  tasaAnual: number
  /** % de retención de ISR sobre el rendimiento (tasa anual publicada por la SHCP sobre intereses del sistema financiero) */
  retencionIsrPorcentaje: number
}

export interface FixedTermDepositResult {
  deposit: FixedTermDeposit
  rendimientoAnualBruto: number
  isrRetenido: number
  rendimientoAnualNeto: number
}

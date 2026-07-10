export interface ExpenseCategory {
  id: string
  nombre: string
  montoMensual: number
}

export interface PayrollConfig {
  sueldoBrutoMensual: number
  diasAguinaldo: number
  primaVacacionalPorcentaje: number
  diasVacaciones: number
  /** Reparto de utilidades (PTU) promedio recibido al año, en MXN */
  utilidadesPromedioAnual: number
  valesDespensaMensual: number
  fondoAhorroPorcentajeTrabajador: number
  fondoAhorroPorcentajeEmpresa: number
  fondoAhorroRendimientoAnual: number
  gastos: ExpenseCategory[]
}

export interface PayrollResult {
  sueldoDiario: number

  /** ISR mensual retenido por la empresa conforme a la tarifa oficial (Art. 96 LISR) */
  isrMensualCalculado: number
  sueldoNetoMensual: number
  /** Tasa efectiva de ISR sobre el sueldo bruto mensual */
  tasaEfectivaMensual: number

  aguinaldoBruto: number
  aguinaldoExento: number
  aguinaldoGravable: number

  primaVacacionalBruta: number
  primaVacacionalExenta: number
  primaVacacionalGravable: number

  utilidadesGravables: number
  utilidadesExentas: number

  valesDespensaAnual: number

  ingresoBrutoAnualTotal: number
  ingresoAnualGravable: number
  isrAnualCalculado: number
  /** Retención anual estimada = retención mensual (tarifa) × 12 */
  isrAnualRetenidoEstimado: number
  /** positivo = saldo a cargo (falta pagar en la declaración anual), negativo = saldo a favor */
  saldoDeclaracionAnual: number

  ingresoNetoAnualTotal: number
  ingresoNetoMensualPromedio: number

  fondoAhorroAportacionMensualTrabajador: number
  fondoAhorroAportacionMensualEmpresa: number
  fondoAhorroAportacionMensualTotal: number
  fondoAhorroProyeccionUnAnio: number

  gastosMensualesTotal: number
  balanceMensualDisponible: number
}

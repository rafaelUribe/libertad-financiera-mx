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
  /** % que retiene la empresa de cada pago como ISR provisional (simplificación real de nómina, no la tarifa oficial) */
  retencionIsrProvisionalPorcentaje: number
  gastos: ExpenseCategory[]
}

export interface PayrollResult {
  sueldoDiario: number

  isrMensualCalculado: number
  isrMensualRetenido: number
  diferenciaMensual: number
  sueldoNetoMensual: number

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

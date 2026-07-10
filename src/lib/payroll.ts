import type { PayrollConfig, PayrollResult } from '../types/payroll'
import { TABLA_ISR_ANUAL, TABLA_ISR_MENSUAL, UMA_DIARIO } from '../constants/tax'
import { calcularISRTarifa } from './isr'

const DIAS_ANIO = 365
const EXENCION_AGUINALDO_UMAS = 30
const EXENCION_PRIMA_VACACIONAL_UMAS = 15
const EXENCION_PTU_UMAS = 15

/**
 * Calcula el desglose completo de nómina: ISR real (tarifas oficiales) vs. la
 * retención simplificada que aplica la empresa en cada pago, prestaciones
 * (aguinaldo, prima vacacional, PTU) con sus exenciones de UMA, fondo de
 * ahorro proyectado y el balance mensual disponible tras gastos.
 *
 * Simplificaciones asumidas: no se calcula subsidio al empleo; vales de
 * despensa y fondo de ahorro se asumen 100% exentos (dentro de los límites
 * legales típicos); la retención de aguinaldo/prima/PTU se reconcilia junto
 * con el sueldo en el cálculo anual, no de forma independiente por concepto.
 */
export function calcularNomina(config: PayrollConfig): PayrollResult {
  const sueldoBrutoAnual = config.sueldoBrutoMensual * 12
  const sueldoDiario = sueldoBrutoAnual / DIAS_ANIO

  const isrMensualCalculado = calcularISRTarifa(config.sueldoBrutoMensual, TABLA_ISR_MENSUAL)
  const isrMensualRetenido = config.sueldoBrutoMensual * config.retencionIsrProvisionalPorcentaje
  const diferenciaMensual = isrMensualCalculado - isrMensualRetenido
  const sueldoNetoMensual = config.sueldoBrutoMensual - isrMensualRetenido

  const aguinaldoBruto = sueldoDiario * config.diasAguinaldo
  const aguinaldoExento = Math.min(aguinaldoBruto, EXENCION_AGUINALDO_UMAS * UMA_DIARIO)
  const aguinaldoGravable = Math.max(0, aguinaldoBruto - aguinaldoExento)

  const primaVacacionalBruta = sueldoDiario * config.diasVacaciones * config.primaVacacionalPorcentaje
  const primaVacacionalExenta = Math.min(primaVacacionalBruta, EXENCION_PRIMA_VACACIONAL_UMAS * UMA_DIARIO)
  const primaVacacionalGravable = Math.max(0, primaVacacionalBruta - primaVacacionalExenta)

  const utilidadesExentas = Math.min(config.utilidadesPromedioAnual, EXENCION_PTU_UMAS * UMA_DIARIO)
  const utilidadesGravables = Math.max(0, config.utilidadesPromedioAnual - utilidadesExentas)

  const valesDespensaAnual = config.valesDespensaMensual * 12

  const ingresoBrutoAnualTotal =
    sueldoBrutoAnual + aguinaldoBruto + primaVacacionalBruta + config.utilidadesPromedioAnual + valesDespensaAnual

  const ingresoAnualGravable = sueldoBrutoAnual + aguinaldoGravable + primaVacacionalGravable + utilidadesGravables

  const isrAnualCalculado = calcularISRTarifa(ingresoAnualGravable, TABLA_ISR_ANUAL)
  const isrAnualRetenidoEstimado = isrMensualRetenido * 12
  const saldoDeclaracionAnual = isrAnualCalculado - isrAnualRetenidoEstimado

  const ingresoNetoAnualTotal = ingresoBrutoAnualTotal - isrAnualCalculado
  const ingresoNetoMensualPromedio = ingresoNetoAnualTotal / 12

  const fondoAhorroAportacionMensualTrabajador = config.sueldoBrutoMensual * config.fondoAhorroPorcentajeTrabajador
  const fondoAhorroAportacionMensualEmpresa = config.sueldoBrutoMensual * config.fondoAhorroPorcentajeEmpresa
  const fondoAhorroAportacionMensualTotal = fondoAhorroAportacionMensualTrabajador + fondoAhorroAportacionMensualEmpresa

  const rMensualFondo = (1 + config.fondoAhorroRendimientoAnual) ** (1 / 12) - 1
  let fondoAhorroProyeccionUnAnio = 0
  for (let mes = 1; mes <= 12; mes++) {
    fondoAhorroProyeccionUnAnio = fondoAhorroProyeccionUnAnio * (1 + rMensualFondo) + fondoAhorroAportacionMensualTotal
  }

  const gastosMensualesTotal = config.gastos.reduce((sum, g) => sum + g.montoMensual, 0)
  const balanceMensualDisponible = ingresoNetoMensualPromedio - gastosMensualesTotal

  return {
    sueldoDiario,
    isrMensualCalculado,
    isrMensualRetenido,
    diferenciaMensual,
    sueldoNetoMensual,
    aguinaldoBruto,
    aguinaldoExento,
    aguinaldoGravable,
    primaVacacionalBruta,
    primaVacacionalExenta,
    primaVacacionalGravable,
    utilidadesGravables,
    utilidadesExentas,
    valesDespensaAnual,
    ingresoBrutoAnualTotal,
    ingresoAnualGravable,
    isrAnualCalculado,
    isrAnualRetenidoEstimado,
    saldoDeclaracionAnual,
    ingresoNetoAnualTotal,
    ingresoNetoMensualPromedio,
    fondoAhorroAportacionMensualTrabajador,
    fondoAhorroAportacionMensualEmpresa,
    fondoAhorroAportacionMensualTotal,
    fondoAhorroProyeccionUnAnio,
    gastosMensualesTotal,
    balanceMensualDisponible,
  }
}

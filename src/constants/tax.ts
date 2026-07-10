import type { ResicoBracket, TaxBracket } from '../types/tax'

/**
 * Tablas fiscales de referencia (México, SAT, ejercicio 2024). Se actualizan
 * cada año por inflación — verifica los valores vigentes antes de tomar
 * decisiones fiscales reales. Esta calculadora es una aproximación educativa,
 * no asesoría fiscal.
 */
export const TAX_TABLES_YEAR = 2024

/** UMA (Unidad de Medida y Actualización) diaria, usada para exenciones de aguinaldo/prima vacacional/PTU. */
export const UMA_DIARIO = 108.57

/** Tarifa mensual para retenciones de sueldos y salarios (Art. 96 LISR). */
export const TABLA_ISR_MENSUAL: TaxBracket[] = [
  { limiteInferior: 0.01, limiteSuperior: 746.04, cuotaFija: 0, porcentajeExcedente: 0.0192 },
  { limiteInferior: 746.05, limiteSuperior: 6332.05, cuotaFija: 14.32, porcentajeExcedente: 0.064 },
  { limiteInferior: 6332.06, limiteSuperior: 11128.01, cuotaFija: 371.83, porcentajeExcedente: 0.1088 },
  { limiteInferior: 11128.02, limiteSuperior: 12935.82, cuotaFija: 893.63, porcentajeExcedente: 0.16 },
  { limiteInferior: 12935.83, limiteSuperior: 15487.71, cuotaFija: 1182.88, porcentajeExcedente: 0.1792 },
  { limiteInferior: 15487.72, limiteSuperior: 31236.49, cuotaFija: 1640.18, porcentajeExcedente: 0.2136 },
  { limiteInferior: 31236.5, limiteSuperior: 49233.0, cuotaFija: 5004.12, porcentajeExcedente: 0.2352 },
  { limiteInferior: 49233.01, limiteSuperior: 93993.9, cuotaFija: 9236.89, porcentajeExcedente: 0.3 },
  { limiteInferior: 93993.91, limiteSuperior: 125325.2, cuotaFija: 22665.17, porcentajeExcedente: 0.32 },
  { limiteInferior: 125325.21, limiteSuperior: 375975.61, cuotaFija: 32691.18, porcentajeExcedente: 0.34 },
  { limiteInferior: 375975.62, limiteSuperior: Infinity, cuotaFija: 117912.32, porcentajeExcedente: 0.35 },
]

/** Tarifa anual (Art. 152 LISR), usada para la declaración anual / cálculo de ISR real sobre el ingreso gravable del año. */
export const TABLA_ISR_ANUAL: TaxBracket[] = [
  { limiteInferior: 0.01, limiteSuperior: 8952.49, cuotaFija: 0, porcentajeExcedente: 0.0192 },
  { limiteInferior: 8952.5, limiteSuperior: 75984.55, cuotaFija: 171.88, porcentajeExcedente: 0.064 },
  { limiteInferior: 75984.56, limiteSuperior: 133536.07, cuotaFija: 4461.94, porcentajeExcedente: 0.1088 },
  { limiteInferior: 133536.08, limiteSuperior: 155229.8, cuotaFija: 10723.55, porcentajeExcedente: 0.16 },
  { limiteInferior: 155229.81, limiteSuperior: 185852.57, cuotaFija: 14194.54, porcentajeExcedente: 0.1792 },
  { limiteInferior: 185852.58, limiteSuperior: 374837.88, cuotaFija: 19682.13, porcentajeExcedente: 0.2136 },
  { limiteInferior: 374837.89, limiteSuperior: 590795.99, cuotaFija: 60049.4, porcentajeExcedente: 0.2352 },
  { limiteInferior: 590796.0, limiteSuperior: 1127926.84, cuotaFija: 110842.74, porcentajeExcedente: 0.3 },
  { limiteInferior: 1127926.85, limiteSuperior: 1503902.46, cuotaFija: 271981.99, porcentajeExcedente: 0.32 },
  { limiteInferior: 1503902.47, limiteSuperior: 4511707.37, cuotaFija: 392294.17, porcentajeExcedente: 0.34 },
  { limiteInferior: 4511707.38, limiteSuperior: Infinity, cuotaFija: 1414947.85, porcentajeExcedente: 0.35 },
]

/**
 * Tabla RESICO Personas Físicas (tasa única sobre el ingreso mensual, sin deducciones),
 * aplicable a ingresos por arrendamiento bajo este régimen.
 */
export const TABLA_RESICO: ResicoBracket[] = [
  { limiteSuperior: 25000, tasa: 0.01 },
  { limiteSuperior: 50000, tasa: 0.011 },
  { limiteSuperior: 83333.33, tasa: 0.015 },
  { limiteSuperior: 208333.33, tasa: 0.02 },
  { limiteSuperior: 3500000, tasa: 0.025 },
]

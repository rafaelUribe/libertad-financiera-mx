import type { ResicoBracket, TaxBracket, TaxConfig } from '../types/tax'

/**
 * Tablas fiscales de referencia (México, SAT/INEGI, ejercicio 2026 — Anexo 8
 * de la RMF 2026, DOF 28/12/2025; UMA publicada por INEGI, vigente desde
 * feb-2026). Se actualizan cada año por inflación: son el valor por defecto,
 * pero quedan editables desde la app (botón "Configuración fiscal") y se
 * pueden sobrescribir pegando un JSON, por si el SAT las vuelve a actualizar.
 * Esta calculadora es una aproximación educativa, no asesoría fiscal.
 */
export const TAX_TABLES_YEAR = 2026

/** UMA (Unidad de Medida y Actualización) diaria 2026, usada para exenciones de aguinaldo/prima vacacional/PTU. */
export const UMA_DIARIO = 117.31

/** Tarifa mensual para retenciones de sueldos y salarios (Art. 96 LISR), derivada de la tarifa anual 2026. */
export const TABLA_ISR_MENSUAL: TaxBracket[] = [
  { limiteInferior: 0.01, limiteSuperior: 844.59, cuotaFija: 0, porcentajeExcedente: 0.0192 },
  { limiteInferior: 844.6, limiteSuperior: 7168.51, cuotaFija: 16.22, porcentajeExcedente: 0.064 },
  { limiteInferior: 7168.52, limiteSuperior: 12598.02, cuotaFija: 420.95, porcentajeExcedente: 0.1088 },
  { limiteInferior: 12598.03, limiteSuperior: 14644.64, cuotaFija: 1011.68, porcentajeExcedente: 0.16 },
  { limiteInferior: 14644.65, limiteSuperior: 17533.64, cuotaFija: 1339.14, porcentajeExcedente: 0.1792 },
  { limiteInferior: 17533.65, limiteSuperior: 35362.83, cuotaFija: 1856.85, porcentajeExcedente: 0.2136 },
  { limiteInferior: 35362.84, limiteSuperior: 55736.68, cuotaFija: 5665.16, porcentajeExcedente: 0.2352 },
  { limiteInferior: 55736.69, limiteSuperior: 106410.5, cuotaFija: 10457.09, porcentajeExcedente: 0.3 },
  { limiteInferior: 106410.51, limiteSuperior: 141880.66, cuotaFija: 25659.23, porcentajeExcedente: 0.32 },
  { limiteInferior: 141880.67, limiteSuperior: 425641.99, cuotaFija: 37009.69, porcentajeExcedente: 0.34 },
  { limiteInferior: 425642.0, limiteSuperior: Infinity, cuotaFija: 133488.54, porcentajeExcedente: 0.35 },
]

/** Tarifa anual (Art. 152 LISR) 2026, publicada en el Anexo 8 de la RMF 2026 (DOF 28/12/2025). */
export const TABLA_ISR_ANUAL: TaxBracket[] = [
  { limiteInferior: 0.01, limiteSuperior: 10135.11, cuotaFija: 0, porcentajeExcedente: 0.0192 },
  { limiteInferior: 10135.12, limiteSuperior: 86022.11, cuotaFija: 194.59, porcentajeExcedente: 0.064 },
  { limiteInferior: 86022.12, limiteSuperior: 151176.19, cuotaFija: 5051.37, porcentajeExcedente: 0.1088 },
  { limiteInferior: 151176.2, limiteSuperior: 175735.66, cuotaFija: 12140.13, porcentajeExcedente: 0.16 },
  { limiteInferior: 175735.67, limiteSuperior: 210403.69, cuotaFija: 16069.64, porcentajeExcedente: 0.1792 },
  { limiteInferior: 210403.7, limiteSuperior: 424353.97, cuotaFija: 22282.14, porcentajeExcedente: 0.2136 },
  { limiteInferior: 424353.98, limiteSuperior: 668840.14, cuotaFija: 67981.92, porcentajeExcedente: 0.2352 },
  { limiteInferior: 668840.15, limiteSuperior: 1276925.98, cuotaFija: 125485.07, porcentajeExcedente: 0.3 },
  { limiteInferior: 1276925.99, limiteSuperior: 1702567.97, cuotaFija: 307910.81, porcentajeExcedente: 0.32 },
  { limiteInferior: 1702567.98, limiteSuperior: 5107703.92, cuotaFija: 444116.23, porcentajeExcedente: 0.34 },
  { limiteInferior: 5107703.93, limiteSuperior: Infinity, cuotaFija: 1601862.46, porcentajeExcedente: 0.35 },
]

/**
 * Tabla RESICO Personas Físicas 2026 (tasa única sobre el ingreso mensual
 * efectivamente cobrado, sin deducciones). Los tramos no se ajustan por
 * inflación (fijos en ley); el límite superior de $291,666.67 corresponde al
 * tope anual de $3,500,000 entre 12 — por arriba de eso ya no se califica para RESICO.
 */
export const TABLA_RESICO: ResicoBracket[] = [
  { limiteSuperior: 25000, tasa: 0.01 },
  { limiteSuperior: 50000, tasa: 0.011 },
  { limiteSuperior: 83333.33, tasa: 0.015 },
  { limiteSuperior: 208333.33, tasa: 0.02 },
  { limiteSuperior: 291666.67, tasa: 0.025 },
]

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  year: TAX_TABLES_YEAR,
  umaDiario: UMA_DIARIO,
  tablaIsrMensual: TABLA_ISR_MENSUAL,
  tablaIsrAnual: TABLA_ISR_ANUAL,
  tablaResico: TABLA_RESICO,
}

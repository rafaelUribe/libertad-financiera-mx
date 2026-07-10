import { useMemo } from 'react'
import type { CutoffScenario, FinancialSummary, MacroConfig, Scenario } from '../types/finance'
import {
  calcularCapitalObjetivo,
  calcularTasaRealAnual,
  calcularTasaRealMensual,
  proyectarConCorte,
  proyectarEscenario,
} from '../lib/financialMath'
import { calcularEdadDesdeFechaNacimiento } from '../lib/date'

/**
 * Hook central de negocio: deriva todos los cálculos financieros (edad actual,
 * tasas reales, meta de capital, proyecciones por escenario y el escenario de
 * corte de aportaciones) a partir de la configuración macroeconómica. Se
 * recalcula automáticamente en cada cambio gracias a useMemo, así la UI
 * responde de forma instantánea.
 */
export function useFinancialCalculations(
  macro: MacroConfig,
  scenarios: Scenario[],
  cutoffScenario: CutoffScenario,
): FinancialSummary {
  return useMemo(() => {
    const fechaInicio = new Date()
    const edadActual = calcularEdadDesdeFechaNacimiento(macro.fechaNacimiento, fechaInicio)
    const tasaRealAnual = calcularTasaRealAnual(macro.rendimientoNominal, macro.inflacionAnual)
    const tasaRealMensual = calcularTasaRealMensual(tasaRealAnual)
    const capitalObjetivo = calcularCapitalObjetivo(macro.gastoMensualObjetivo, macro.tasaRetiroSeguro)

    const resultados = scenarios.map((scenario) =>
      proyectarEscenario(scenario, macro, edadActual, tasaRealMensual, capitalObjetivo, undefined, fechaInicio),
    )

    const resultadoCorte = proyectarConCorte(
      cutoffScenario,
      macro,
      edadActual,
      tasaRealMensual,
      capitalObjetivo,
      undefined,
      fechaInicio,
    )

    return { edadActual, tasaRealAnual, tasaRealMensual, capitalObjetivo, resultados, resultadoCorte }
  }, [macro, scenarios, cutoffScenario])
}

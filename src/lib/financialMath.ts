import type { CutoffResult, CutoffScenario, MacroConfig, ProjectionPoint, Scenario, ScenarioResult } from '../types/finance'
import { HORIZONTE_MAXIMO_ANIOS } from '../constants/finance'
import { mesesEntre, parseDateInput, sumarMeses } from './date'

/**
 * Ecuación de Fisher: convierte una tasa nominal anual a una tasa real anual
 * descontando la inflación. Trabajar en términos reales permite comparar el
 * capital proyectado directamente contra metas expresadas "en pesos de hoy".
 */
export function calcularTasaRealAnual(rendimientoNominal: number, inflacionAnual: number): number {
  return (1 + rendimientoNominal) / (1 + inflacionAnual) - 1
}

export function calcularTasaRealMensual(tasaRealAnual: number): number {
  return tasaRealAnual / 12
}

/** Capital necesario para sostener el gasto anual objetivo bajo la tasa de retiro segura (regla del 4%/8%). */
export function calcularCapitalObjetivo(gastoMensualObjetivo: number, tasaRetiroSeguro: number): number {
  return (gastoMensualObjetivo * 12) / tasaRetiroSeguro
}

/**
 * Proyecta el crecimiento del capital mes a mes para un escenario de aportación fija,
 * usando la tasa real mensual para que tanto el capital como la meta queden expresados
 * en poder adquisitivo de hoy.
 */
export function proyectarEscenario(
  scenario: Scenario,
  macro: MacroConfig,
  edadActual: number,
  tasaRealMensual: number,
  capitalObjetivo: number,
  horizonteAnios: number = HORIZONTE_MAXIMO_ANIOS,
  fechaInicio: Date = new Date(),
): ScenarioResult {
  const horizonteMeses = horizonteAnios * 12
  const proyeccion: ProjectionPoint[] = [{ mes: 0, edad: edadActual, capital: macro.capitalInicial }]

  let capital = macro.capitalInicial
  let mesesParaMeta: number | null = capital >= capitalObjetivo ? 0 : null

  for (let mes = 1; mes <= horizonteMeses; mes++) {
    capital = capital * (1 + tasaRealMensual) + scenario.aportacionMensual
    proyeccion.push({ mes, edad: edadActual + mes / 12, capital })

    if (mesesParaMeta === null && capital >= capitalObjetivo) {
      mesesParaMeta = mes
    }
  }

  const aniosParaMeta = mesesParaMeta !== null ? mesesParaMeta / 12 : null
  const edadRetiro = mesesParaMeta !== null ? edadActual + mesesParaMeta / 12 : null
  const fechaRetiro = mesesParaMeta !== null ? sumarMeses(fechaInicio, mesesParaMeta) : null

  return {
    scenario,
    proyeccion,
    mesesParaMeta,
    aniosParaMeta,
    edadRetiro,
    fechaRetiro,
    capitalFinal: capital,
  }
}

/**
 * Proyecta el capital cuando la aportación se detiene en una fecha de corte:
 * se aporta la cantidad fija mes a mes hasta esa fecha, y de ahí en adelante
 * el capital solo crece por interés compuesto (aportación = 0).
 */
export function proyectarConCorte(
  cutoff: CutoffScenario,
  macro: MacroConfig,
  edadActual: number,
  tasaRealMensual: number,
  capitalObjetivo: number,
  horizonteAnios: number = HORIZONTE_MAXIMO_ANIOS,
  fechaInicio: Date = new Date(),
): CutoffResult {
  const horizonteMeses = horizonteAnios * 12
  const mesesAportando = Math.max(0, mesesEntre(fechaInicio, parseDateInput(cutoff.fechaCorte)))
  const edadCorte = edadActual + mesesAportando / 12

  const proyeccion: ProjectionPoint[] = [{ mes: 0, edad: edadActual, capital: macro.capitalInicial }]
  let capital = macro.capitalInicial
  let capitalAlCorte = macro.capitalInicial
  let mesesParaMeta: number | null = capital >= capitalObjetivo ? 0 : null

  for (let mes = 1; mes <= horizonteMeses; mes++) {
    const aportacion = mes <= mesesAportando ? cutoff.aportacionMensual : 0
    capital = capital * (1 + tasaRealMensual) + aportacion
    proyeccion.push({ mes, edad: edadActual + mes / 12, capital })

    if (mes === mesesAportando) capitalAlCorte = capital
    if (mesesParaMeta === null && capital >= capitalObjetivo) {
      mesesParaMeta = mes
    }
  }

  const aniosParaMeta = mesesParaMeta !== null ? mesesParaMeta / 12 : null
  const edadRetiro = mesesParaMeta !== null ? edadActual + mesesParaMeta / 12 : null
  const fechaRetiro = mesesParaMeta !== null ? sumarMeses(fechaInicio, mesesParaMeta) : null

  return {
    cutoff,
    proyeccion,
    mesesAportando,
    edadCorte,
    capitalAlCorte,
    mesesParaMeta,
    aniosParaMeta,
    edadRetiro,
    fechaRetiro,
    capitalFinal: capital,
  }
}

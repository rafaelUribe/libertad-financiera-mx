import type { FinancialSummary, MacroConfig, CutoffScenario } from '../types/finance'
import { toDateInputValue } from './date'

/**
 * Construye un JSON autodescriptivo con todos los parámetros y resultados
 * calculados, pensado para pegarse directamente en una conversación con un
 * agente/LLM y recibir consejos financieros sin que tenga que adivinar el
 * significado de cada campo.
 */
export function buildExportPayload(macro: MacroConfig, cutoffScenario: CutoffScenario, summary: FinancialSummary) {
  const { edadActual, tasaRealAnual, capitalObjetivo, resultados, resultadoCorte } = summary

  return {
    app: 'Libertad Financiera - Dashboard MX',
    generadoEl: new Date().toISOString(),
    contexto:
      'Datos exportados desde una calculadora de libertad financiera para México. ' +
      'Todas las cifras están en pesos mexicanos (MXN) y expresadas en poder adquisitivo de hoy ' +
      '(términos reales: se descuenta la inflación anual estimada de la tasa nominal vía ecuación de Fisher, ' +
      'y las metas y proyecciones ya están en pesos de hoy, no nominales). ' +
      'La "meta de capital objetivo" es el capital necesario para vivir del gasto mensual objetivo aplicando la tasa de retiro segura (regla del %). ' +
      'Úsalos para dar consejos financieros personalizados sobre el plan de retiro.',
    parametros: {
      fechaNacimiento: macro.fechaNacimiento,
      edadActualAnios: round(edadActual, 1),
      capitalInicialMXN: macro.capitalInicial,
      ingresoMensualNetoMXN: macro.ingresoMensual,
      rendimientoNominalAnual: macro.rendimientoNominal,
      inflacionAnualEstimada: macro.inflacionAnual,
      tasaRealAnual: round(tasaRealAnual, 4),
      gastoMensualObjetivoMXN: macro.gastoMensualObjetivo,
      tasaRetiroSeguraAnual: macro.tasaRetiroSeguro,
      capitalObjetivoMXN: capitalObjetivo,
    },
    escenariosDeAhorroConstante: resultados.map((r) => ({
      nombre: r.scenario.nombre,
      aportacionMensualMXN: r.scenario.aportacionMensual,
      porcentajeDelIngresoMensual:
        macro.ingresoMensual > 0 ? round(r.scenario.aportacionMensual / macro.ingresoMensual, 4) : null,
      alcanzaLaMetaEnHorizonte: r.mesesParaMeta !== null,
      tiempoParaMetaAnios: r.aniosParaMeta !== null ? round(r.aniosParaMeta, 1) : null,
      edadDeRetiro: r.edadRetiro !== null ? round(r.edadRetiro, 1) : null,
      fechaEstimadaDeRetiro: r.fechaRetiro ? toDateInputValue(r.fechaRetiro) : null,
      capitalProyectadoA60AniosMXN: Math.round(r.capitalFinal),
    })),
    escenarioDeCorteDeAportaciones: {
      descripcion: 'Aporta la cantidad fija indicada solo hasta la fecha de corte; después el capital crece únicamente por interés compuesto (aportación = 0).',
      aportacionMensualMXN: cutoffScenario.aportacionMensual,
      porcentajeDelIngresoMensualMientrasAporta:
        macro.ingresoMensual > 0 ? round(cutoffScenario.aportacionMensual / macro.ingresoMensual, 4) : null,
      fechaEnQueDejaDeAportar: cutoffScenario.fechaCorte,
      edadDeCorte: round(resultadoCorte.edadCorte, 1),
      capitalAlMomentoDelCorteMXN: Math.round(resultadoCorte.capitalAlCorte),
      alcanzaLaMetaEnHorizonte: resultadoCorte.mesesParaMeta !== null,
      tiempoParaMetaAnios: resultadoCorte.aniosParaMeta !== null ? round(resultadoCorte.aniosParaMeta, 1) : null,
      edadDeRetiro: resultadoCorte.edadRetiro !== null ? round(resultadoCorte.edadRetiro, 1) : null,
      fechaEstimadaDeRetiro: resultadoCorte.fechaRetiro ? toDateInputValue(resultadoCorte.fechaRetiro) : null,
      capitalProyectadoA60AniosMXN: Math.round(resultadoCorte.capitalFinal),
    },
  }
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

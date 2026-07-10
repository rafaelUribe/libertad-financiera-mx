import type { PayrollConfig } from '../types/payroll'

export const DEFAULT_PAYROLL_CONFIG: PayrollConfig = {
  sueldoBrutoMensual: 60_000,
  diasAguinaldo: 15,
  primaVacacionalPorcentaje: 0.25,
  diasVacaciones: 12,
  utilidadesPromedioAnual: 20_000,
  valesDespensaMensual: 2_000,
  fondoAhorroPorcentajeTrabajador: 0.13,
  fondoAhorroPorcentajeEmpresa: 0.13,
  fondoAhorroRendimientoAnual: 0.08,
  gastos: [
    { id: 'vivienda', nombre: 'Renta / hipoteca', montoMensual: 12_000 },
    { id: 'alimentacion', nombre: 'Alimentación', montoMensual: 8_000 },
    { id: 'transporte', nombre: 'Transporte', montoMensual: 3_000 },
    { id: 'servicios', nombre: 'Servicios (luz, agua, internet)', montoMensual: 2_500 },
    { id: 'entretenimiento', nombre: 'Entretenimiento', montoMensual: 2_000 },
    { id: 'otros', nombre: 'Otros', montoMensual: 3_000 },
  ],
}

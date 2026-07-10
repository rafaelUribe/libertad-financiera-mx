import type { FixedTermDeposit, Loan, Property } from '../types/assets'

export const DEFAULT_PROPERTIES: Property[] = [
  {
    id: 'propiedad-1',
    nombre: 'Departamento renta',
    valor: 1_800_000,
    plusvaliaAnualEstimada: 0.05,
    rentaMensual: 12_000,
    gastosMensuales: 1_500,
  },
]

export const DEFAULT_LOANS: Loan[] = [
  {
    id: 'prestamo-1',
    nombre: 'Cuenta yotepresto',
    montoPrestado: 100_000,
    tasaRetornoAnual: 0.12,
    retencionIsrPorcentaje: 0.2,
  },
]

export const DEFAULT_DEPOSITS: FixedTermDeposit[] = [
  {
    id: 'pagare-1',
    nombre: 'Pagaré Nu',
    institucion: 'Nu',
    monto: 150_000,
    tasaAnual: 0.11,
    retencionIsrPorcentaje: 0.005,
  },
]

import { useMemo } from 'react'
import type { PayrollConfig, PayrollResult } from '../types/payroll'
import type { TaxConfig } from '../types/tax'
import { calcularNomina } from '../lib/payroll'

export function usePayrollCalculations(config: PayrollConfig, taxConfig: TaxConfig, inflacionAnual: number): PayrollResult {
  return useMemo(() => calcularNomina(config, taxConfig, inflacionAnual), [config, taxConfig, inflacionAnual])
}

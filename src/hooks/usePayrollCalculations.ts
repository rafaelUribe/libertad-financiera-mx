import { useMemo } from 'react'
import type { PayrollConfig, PayrollResult } from '../types/payroll'
import type { TaxConfig } from '../types/tax'
import { calcularNomina } from '../lib/payroll'

export function usePayrollCalculations(config: PayrollConfig, taxConfig: TaxConfig): PayrollResult {
  return useMemo(() => calcularNomina(config, taxConfig), [config, taxConfig])
}

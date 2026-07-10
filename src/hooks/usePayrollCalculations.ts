import { useMemo } from 'react'
import type { PayrollConfig, PayrollResult } from '../types/payroll'
import { calcularNomina } from '../lib/payroll'

export function usePayrollCalculations(config: PayrollConfig): PayrollResult {
  return useMemo(() => calcularNomina(config), [config])
}

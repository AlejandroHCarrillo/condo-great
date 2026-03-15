/** Opciones de período para reportes: este año, año anterior, 2 años anteriores. */
export type ReportPeriodKey = 'este_anio' | 'anio_anterior' | 'dos_anios_anteriores';

export interface ReportPeriodOption {
  value: ReportPeriodKey;
  label: string;
}

export const REPORT_PERIOD_OPTIONS: ReportPeriodOption[] = [
  { value: 'este_anio', label: 'Este año' },
  { value: 'anio_anterior', label: 'El año anterior' },
  { value: 'dos_anios_anteriores', label: '2 años anteriores' }
];

/** Devuelve el año a usar para el período seleccionado. */
export function getYearForPeriod(period: ReportPeriodKey): number {
  const currentYear = new Date().getFullYear();
  switch (period) {
    case 'este_anio':
      return currentYear;
    case 'anio_anterior':
      return currentYear - 1;
    case 'dos_anios_anteriores':
      return currentYear - 2;
    default:
      return currentYear;
  }
}

export interface MontoPorMesDto {
  anio: number;
  mes: number;
  total: number;
}

export interface DashboardDto {
  communityId: string;
  ingresosDelMes: number;
  egresosDelMes: number;
  cantidadMorosos: number;
  montoEnMora: number;
  recaudacionMensual: MontoPorMesDto[];
  gastosMensuales: MontoPorMesDto[];
  ticketsLevantados: number;
  ticketsResueltos: number;
  saldoActualEnBanco: number;
  saldosMensualesEnBanco: MontoPorMesDto[];
}

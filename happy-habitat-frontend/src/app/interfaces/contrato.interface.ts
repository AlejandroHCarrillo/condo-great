export interface Contrato {
  id?: string;
  communityId: string;
  tipoContrato: string;
  folioContrato: string;
  representanteComunidad: string;
  costoTotal: number;
  montoPagoParcial: number;
  numeroPagosParciales: number;
  diaPago: number;
  periodicidadPago: string;
  metodoPago: string;
  fechaFirma: string;
  fechaInicio: string;
  fechaFin?: string | null;
  numeroCasas: number;
  estadoContrato: string;
  asesorVentas?: string | null;
  notas?: string | null;
  documentosAdjuntos?: string | null;
  nombreComunidad?: string; // Para mostrar en la lista
}

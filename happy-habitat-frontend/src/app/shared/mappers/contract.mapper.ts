import { ContratoDto } from '../../services/contracts.service';
import { Contrato } from '../../interfaces/contrato.interface';

/**
 * Mapea ContratoDto del backend a Contrato del frontend
 */
export function mapContratoDtoToContrato(dto: ContratoDto): Contrato {
  return {
    id: dto.id,
    communityId: dto.communityId,
    tipoContrato: dto.tipoContrato,
    folioContrato: dto.folioContrato,
    representanteComunidad: dto.representanteComunidad,
    costoTotal: dto.costoTotal,
    montoPagoParcial: dto.montoPagoParcial,
    numeroPagosParciales: dto.numeroPagosParciales,
    diaPago: dto.diaPago,
    periodicidadPago: dto.periodicidadPago,
    metodoPago: dto.metodoPago,
    fechaFirma: dto.fechaFirma,
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin ?? null,
    numeroCasas: dto.numeroCasas,
    estadoContrato: dto.estadoContrato,
    asesorVentas: dto.asesorVentas ?? null,
    notas: dto.notas ?? null,
    documentosAdjuntos: dto.documentosAdjuntos ?? null
  };
}

/**
 * Mapea un array de ContratoDto a Contrato
 */
export function mapContratoDtosToContratos(dtos: ContratoDto[]): Contrato[] {
  return dtos.map(mapContratoDtoToContrato);
}

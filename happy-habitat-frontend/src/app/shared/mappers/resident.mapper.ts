import { Residente, ResidentDto } from '../interfaces/residente.interface';

/**
 * Mapea ResidentDto del backend a Residente del frontend.
 */
export function mapDtoToResidente(dto: ResidentDto): Residente {
  return {
    id: dto.userId,
    fullname: dto.fullName,
    email: dto.email ?? undefined,
    phone: dto.phone ?? undefined,
    number: dto.number ?? undefined,
    address: dto.address,
    comunidades: (dto.communityIds ?? []).map(cid => typeof cid === 'string' ? cid : String(cid))
  };
}

/**
 * Mapea un array de ResidentDto a Residente[].
 */
export function mapResidentDtosToResidentes(dtos: ResidentDto[]): Residente[] {
  return dtos.map(mapDtoToResidente);
}

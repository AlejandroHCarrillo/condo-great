import { Residente, ResidentDto } from '../interfaces/residente.interface';

/**
 * Mapea ResidentDto del backend a Residente del frontend.
 */
export function mapDtoToResidente(dto: ResidentDto): Residente {
  const rawIds = dto.communityIds ?? [];
  const fromSingle = dto.communityId != null ? [String(dto.communityId)] : [];
  const communityIds = rawIds.length > 0 ? rawIds : fromSingle;
  return {
    id: dto.userId,
    residentId: dto.id,
    fullname: dto.fullName ?? '',
    email: dto.email ?? undefined,
    phone: dto.phone ?? undefined,
    number: dto.number ?? undefined,
    address: dto.address ?? '',
    comunidades: communityIds.map(cid => typeof cid === 'string' ? cid : String(cid))
  };
}

/**
 * Mapea un array de ResidentDto a Residente[].
 */
export function mapResidentDtosToResidentes(dtos: ResidentDto[]): Residente[] {
  return dtos.map(mapDtoToResidente);
}

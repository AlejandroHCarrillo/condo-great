import { UserDto, ResidentInfoDto } from '../../services/users.service';
import { Usuario } from '../../shared/interfaces/usuario-interface';
import { RolesEnum } from '../../enums/roles.enum';

/**
 * Mapea UserDto del backend a Usuario del frontend
 */
export function mapUserDtoToUsuario(dto: UserDto): Usuario {
  // Usar userCommunityIds si están disponibles, de lo contrario usar residentInfo.communityIds
  const comunidades = dto.userCommunityIds && dto.userCommunityIds.length > 0
    ? dto.userCommunityIds
    : (dto.residentInfo?.communityIds || (dto.residentInfo?.communityId ? [dto.residentInfo.communityId] : []));

  // Si hay ResidentInfo, usarlo; si no, crear uno básico con firstName/lastName
  const residentInfo = dto.residentInfo ? {
    id: dto.residentInfo.id,
    fullname: dto.residentInfo.fullName,
    email: dto.residentInfo.email,
    phone: dto.residentInfo.phone,
    number: dto.residentInfo.number,
    address: dto.residentInfo.address,
    comunidades: comunidades
  } : (dto.firstName || dto.lastName ? {
    fullname: `${dto.firstName || ''} ${dto.lastName || ''}`.trim(),
    email: dto.email,
    phone: undefined,
    number: undefined,
    address: '',
    comunidades: comunidades
  } as any : undefined);

  return {
    id: dto.id,
    role: dto.roleCode as RolesEnum,
    username: dto.username,
    password: '', // No se envía la contraseña desde el backend
    firstName: dto.firstName,
    lastName: dto.lastName,
    ResidentInfo: residentInfo
  };
}

/**
 * Mapea un array de UserDto a Usuario
 */
export function mapUserDtosToUsuarios(dtos: UserDto[]): Usuario[] {
  return dtos.map(mapUserDtoToUsuario);
}

/**
 * Mapea RolesEnum a RoleId (GUID) del backend
 */
export function mapRoleToRoleId(role: RolesEnum): string {
  const roleIdMap: Record<RolesEnum, string> = {
    [RolesEnum.SYSTEM_ADMIN]: '11111111-1111-1111-1111-111111111111',
    [RolesEnum.ADMIN_COMPANY]: '22222222-2222-2222-2222-222222222222',
    [RolesEnum.COMITEE_MEMBER]: '33333333-3333-3333-3333-333333333333',
    [RolesEnum.RESIDENT]: '44444444-4444-4444-4444-444444444444',
    [RolesEnum.TENANT]: '55555555-5555-5555-5555-555555555555',
    [RolesEnum.VIGILANCE]: '66666666-6666-6666-6666-666666666666'
  };
  return roleIdMap[role] || roleIdMap[RolesEnum.RESIDENT];
}

/**
 * Mapea RoleId (GUID) del backend a RolesEnum
 */
export function mapRoleIdToRole(roleId: string): RolesEnum {
  const roleIdMap: Record<string, RolesEnum> = {
    '11111111-1111-1111-1111-111111111111': RolesEnum.SYSTEM_ADMIN,
    '22222222-2222-2222-2222-222222222222': RolesEnum.ADMIN_COMPANY,
    '33333333-3333-3333-3333-333333333333': RolesEnum.COMITEE_MEMBER,
    '44444444-4444-4444-4444-444444444444': RolesEnum.RESIDENT,
    '55555555-5555-5555-5555-555555555555': RolesEnum.TENANT,
    '66666666-6666-6666-6666-666666666666': RolesEnum.VIGILANCE
  };
  return roleIdMap[roleId] || RolesEnum.RESIDENT;
}


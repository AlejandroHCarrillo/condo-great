import { LoginResponse, UserDto, AuthResponse, ResidentInfoDto, CommunityDto } from '../interfaces/auth.interface';
import { UserInfo, ResidentInfo } from '../../interfaces/user-info.interface';
import { Comunidad } from '../../interfaces/comunidad.interface';
import { RolesEnum } from '../../enums/roles.enum';
import { tipoComunidadEnum } from '../../enums/tipo-comunidad.enum';

/**
 * Mapea el nombre del rol del backend al enum del frontend
 */
function mapRoleToEnum(roleName: string): RolesEnum {
  const roleMap: Record<string, RolesEnum> = {
    // Backend role codes
    'SYSTEM_ADMIN': RolesEnum.SYSTEM_ADMIN,
    'ADMIN_COMPANY': RolesEnum.ADMIN_COMPANY,
    'COMITEE_MEMBER': RolesEnum.COMITEE_MEMBER,
    'RESIDENT': RolesEnum.RESIDENT,
    'RENTER': RolesEnum.TENANT,
    'VIGILANCE': RolesEnum.VIGILANCE,
    // Legacy mappings (for backwards compatibility)
    'SysAdmin': RolesEnum.SYSTEM_ADMIN,
    'Admin': RolesEnum.ADMIN_COMPANY,
    'Manager': RolesEnum.ADMIN_COMPANY,
    'Resident': RolesEnum.RESIDENT,
    'ResidentPower': RolesEnum.COMITEE_MEMBER,
    'Vigilance': RolesEnum.VIGILANCE,
    'Supervision': RolesEnum.ADMIN_COMPANY
  };

  return roleMap[roleName] || RolesEnum.RESIDENT;
}

/**
 * Transforma LoginResponse del backend a AuthResponse del frontend
 * Nota: El backend no devuelve información completa del usuario en LoginResponse,
 * solo username, email y role. Necesitaremos obtener el usuario completo después.
 */
export function mapLoginResponseToAuthResponse(loginResponse: LoginResponse): AuthResponse {
  const expiresAt = new Date(loginResponse.expiresAt);
  const now = new Date();
  const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000); // segundos

  // Mapear Community a Comunidad si existe
  let comunidad: Comunidad | undefined;
  if (loginResponse.residentInfo?.comunidad) {
    const comunidadDto = loginResponse.residentInfo.comunidad;
    comunidad = {
      id: comunidadDto.id,
      tipoUnidadHabitacional: tipoComunidadEnum.COMUNIDAD, // Default, puede ajustarse según necesidad
      nombre: comunidadDto.nombre,
      ubicacion: comunidadDto.direccion,
      cantidadviviendas: 0, // No disponible en el backend, usar 0 como default
      contacto: comunidadDto.contacto
    };
  }

  // Mapear ResidentInfo si existe
  let residentInfo: ResidentInfo | undefined;
  if (loginResponse.residentInfo) {
    // Obtener tipoComunidad de la comunidad si existe, o usar un valor por defecto
    const tipoComunidad = comunidad?.tipoUnidadHabitacional || tipoComunidadEnum.COMUNIDAD;
    
    residentInfo = {
      id: loginResponse.residentInfo.id,
      fullname: loginResponse.residentInfo.fullname,
      email: loginResponse.residentInfo.email,
      phone: loginResponse.residentInfo.phone,
      number: loginResponse.residentInfo.number,
      address: loginResponse.residentInfo.address,
      tipoComunidad: tipoComunidad,
      comunidad: comunidad
    };
  }

  // Mapear todos los roles si están disponibles
  const allRoles: RolesEnum[] = [];
  if (loginResponse.roles && loginResponse.roles.length > 0) {
    allRoles.push(...loginResponse.roles.map(roleCode => mapRoleToEnum(roleCode)));
  } else if (loginResponse.role) {
    // Si no hay array de roles, usar el rol único
    allRoles.push(mapRoleToEnum(loginResponse.role));
  }

  // Mapear todas las comunidades si están disponibles
  const allCommunities: Comunidad[] = [];
  if (loginResponse.residentInfo?.comunidadesCompletas && loginResponse.residentInfo.comunidadesCompletas.length > 0) {
    // Mapear todas las comunidades completas del backend
    allCommunities.push(...loginResponse.residentInfo.comunidadesCompletas.map(comunidadDto => ({
      id: comunidadDto.id,
      tipoUnidadHabitacional: tipoComunidadEnum.COMUNIDAD, // Default, puede ajustarse según necesidad
      nombre: comunidadDto.nombre,
      ubicacion: comunidadDto.direccion,
      cantidadviviendas: 0, // No disponible en el backend, usar 0 como default
      contacto: comunidadDto.contacto
    })));
  } else if (loginResponse.residentInfo?.comunidades && loginResponse.residentInfo.comunidades.length > 0) {
    // Fallback: si solo hay IDs, crear objetos Comunidad básicos
    allCommunities.push(...loginResponse.residentInfo.comunidades.map(comunidadId => ({
      id: comunidadId,
      tipoUnidadHabitacional: tipoComunidadEnum.COMUNIDAD,
      nombre: '', // No disponible solo con ID
      ubicacion: '',
      cantidadviviendas: 0,
      contacto: ''
    })));
  } else if (comunidad) {
    // Si solo hay una comunidad mapeada, agregarla
    allCommunities.push(comunidad);
  }

  // Crear UserInfo desde LoginResponse con toda la información
  const user: UserInfo = {
    id: loginResponse.userId,
    fullname: loginResponse.residentInfo?.fullname || loginResponse.username,
    username: loginResponse.username,
    email: loginResponse.email,
    addres: loginResponse.residentInfo?.address,
    selectedRole: mapRoleToEnum(loginResponse.role), // Rol principal/seleccionado
    userRoles: allRoles.length > 0 ? allRoles : undefined, // Todos los roles
    communities: allCommunities.length > 0 ? allCommunities : undefined, // Todas las comunidades
    residentInfo: residentInfo
  };

  return {
    token: loginResponse.token,
    refreshToken: undefined, // El backend no devuelve refreshToken aún
    user,
    expiresIn
  };
}

/**
 * Transforma UserDto del backend a UserInfo del frontend
 */
export function mapUserDtoToUserInfo(userDto: UserDto): UserInfo {
  return {
    id: userDto.id,
    fullname: `${userDto.firstName} ${userDto.lastName}`.trim(),
    username: userDto.username,
    email: userDto.email,
    selectedRole: mapRoleToEnum(userDto.roleName),
    // unidadhabitacional se completará cuando se obtenga la información de la comunidad
  };
}

/**
 * Actualiza AuthResponse con información completa del usuario
 */
export function updateAuthResponseWithUser(authResponse: AuthResponse, userDto: UserDto): AuthResponse {
  return {
    ...authResponse,
    user: mapUserDtoToUserInfo(userDto)
  };
}


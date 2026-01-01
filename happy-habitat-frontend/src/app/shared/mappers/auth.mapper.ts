import { LoginResponse, UserDto, AuthResponse, ResidentInfoDto } from '../interfaces/auth.interface';
import { UserInfo, ResidentInfo } from '../../interfaces/user-info.interface';
import { RolesEnum } from '../../enums/roles.enum';

/**
 * Mapea el nombre del rol del backend al enum del frontend
 */
function mapRoleToEnum(roleName: string): RolesEnum {
  const roleMap: Record<string, RolesEnum> = {
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

  // Mapear ResidentInfo si existe
  let residentInfo: ResidentInfo | undefined;
  if (loginResponse.residentInfo) {
    residentInfo = {
      id: loginResponse.residentInfo.id,
      fullname: loginResponse.residentInfo.fullname,
      email: loginResponse.residentInfo.email,
      phone: loginResponse.residentInfo.phone,
      number: loginResponse.residentInfo.number,
      address: loginResponse.residentInfo.address,
      comunidades: loginResponse.residentInfo.comunidades
    };
  }

  // Crear UserInfo desde LoginResponse
  const user: UserInfo = {
    id: loginResponse.userId,
    fullname: loginResponse.residentInfo?.fullname || loginResponse.username,
    username: loginResponse.username,
    email: loginResponse.email,
    role: mapRoleToEnum(loginResponse.role),
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
    role: mapRoleToEnum(userDto.roleName),
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


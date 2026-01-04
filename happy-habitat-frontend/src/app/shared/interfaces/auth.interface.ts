import { RolesEnum } from '../../enums/roles.enum';
import { UserInfo } from '../../interfaces/user-info.interface';

// Request interfaces - coinciden con los DTOs del backend
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  roleId: string; // GUID del rol
}

// Response interfaces del backend
export interface CommunityDto {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  contacto: string;
  email: string;
  phone: string;
}

export interface ResidentInfoDto {
  id?: string;
  fullname: string;
  email?: string;
  phone?: string;
  number?: string;
  address: string;
  comunidades?: string[];
  comunidad?: CommunityDto; // Full community information
}

export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  role: string;
  expiresAt: string; // ISO date string
  residentInfo?: ResidentInfoDto;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roleId: string;
  roleName: string;
  companies?: Array<{
    companyId: string;
    companyName: string;
  }>;
}

// Response interface del frontend (transformada)
export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserInfo;
  expiresIn?: number;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: RolesEnum;
  exp?: number;
  iat?: number;
}

// Request interfaces para forgot/reset password
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  token: string;
}


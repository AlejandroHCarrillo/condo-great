import { RolesEnum } from '../../enums/roles.enum';
import { UserInfo } from '../../interfaces/user-info.interface';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phone?: string;
}

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


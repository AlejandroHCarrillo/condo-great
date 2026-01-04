import { Injectable, signal } from '@angular/core';
import { UserInfo } from '../interfaces/user-info.interface';
import { AuthResponse } from '../shared/interfaces/auth.interface';

const TOKEN_KEY = 'hh_token';
const REFRESH_TOKEN_KEY = 'hh_refresh_token';
const USER_KEY = 'hh_user';
const TOKEN_EXPIRY_KEY = 'hh_token_expiry';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutos antes de expirar

  /**
   * Guarda la sesión del usuario
   */
  saveSession(authResponse: AuthResponse): void {
    // Guardar token
    if (authResponse.token) {
      localStorage.setItem(TOKEN_KEY, authResponse.token);
    }

    // Guardar refresh token si existe
    if (authResponse.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    }

    // Guardar información del usuario
    if (authResponse.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
    }

    // Guardar tiempo de expiración
    if (authResponse.expiresIn) {
      const expiryTime = Date.now() + (authResponse.expiresIn * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
    } else {
      // Por defecto, 24 horas si no se especifica
      const defaultExpiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(TOKEN_EXPIRY_KEY, defaultExpiry.toString());
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Obtiene la información del usuario
   */
  getUser(): UserInfo | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as UserInfo;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el token ha expirado
   */
  isTokenExpired(): boolean {
    const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiryStr) {
      return true;
    }

    const expiryTime = parseInt(expiryStr, 10);
    const now = Date.now();
    
    // Considerar expirado si falta menos de 5 minutos
    return now >= (expiryTime - this.TOKEN_EXPIRY_BUFFER);
  }

  /**
   * Limpia toda la sesión
   */
  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * Verifica si hay una sesión activa
   */
  hasActiveSession(): boolean {
    return !!this.getToken() && !!this.getUser() && !this.isTokenExpired();
  }
}


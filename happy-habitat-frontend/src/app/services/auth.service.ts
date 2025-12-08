import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, delay } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../shared/interfaces/auth.interface';
import { UserInfo } from '../interfaces/user-info.interface';
import { SessionService } from './session.service';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';
import { RolesEnum } from '../enums/roles.enum';
import { tipoComunidadEnum } from '../enums/tipo-comunidad.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/auth`;

  // Signals para estado de autenticación
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<UserInfo | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    // Verificar si hay sesión guardada al inicializar
    this.checkStoredSession();
  }

  /**
   * Inicia sesión con username y password
   * TEMPORAL: Si useMockAuth está activado, simula un login exitoso sin llamar a la API
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.logger.info('Login attempt', 'AuthService', { username: credentials.username, useMock: environment.auth?.useMockAuth });
    
    // TEMPORAL: Modo mock - simula login exitoso sin llamar a la API
    // Para habilitar la API real, cambiar useMockAuth a false en environment.ts
    if (environment.auth?.useMockAuth) {
      return this.mockLogin(credentials);
    }
    
    // CÓDIGO REAL DE API - Se ejecutará cuando useMockAuth sea false
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
        this.logger.info('Login successful', 'AuthService', { userId: response.user.id });
      }),
      catchError((error) => {
        this.isLoading.set(false);
        // El error interceptor ya manejará el error y mostrará la notificación
        // Solo loggeamos aquí para contexto adicional
        this.logger.error('Login failed', error, 'AuthService', { username: credentials.username });
        return throwError(() => error);
      })
    );
  }

  /**
   * Simula un login exitoso con datos mock
   * TEMPORAL: Solo para desarrollo sin backend
   */
  private mockLogin(credentials: LoginRequest): Observable<AuthResponse> {
    const mockResponse = this.createMockAuthResponse(credentials.username);
    
    // Simular delay de red (500ms) y luego procesar la respuesta
    return of(mockResponse).pipe(
      delay(500),
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
        this.logger.info('Mock login successful', 'AuthService', { 
          userId: response.user.id, 
          username: credentials.username,
          note: 'Using mock authentication - API calls disabled'
        });
      })
    );
  }

  /**
   * Crea una respuesta mock de autenticación
   */
  private createMockAuthResponse(username: string): AuthResponse {
    // Determinar rol basado en el username
    const isAdmin = username.toLowerCase() === 'admin' || username.toLowerCase().includes('admin');
    const role = isAdmin ? RolesEnum.SYSTEM_ADMIN : RolesEnum.RESIDENT;
    
    // Crear usuario mock basado en el username
    const mockUser: UserInfo = {
      id: `mock-user-${Date.now()}`,
      fullname: isAdmin 
        ? 'Administrador del Sistema' 
        : `${username.charAt(0).toUpperCase() + username.slice(1)} Usuario`,
      username: username,
      email: `${username}@happyhabitat.com`,
      role: role,
      unidadhabitacional: {
        id: 'fcdc9a85-88b7-4109-84b3-a75107392d87',
        tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
        nombre: 'Residencial El Pueblito',
        ubicacion: 'Av. Paseo del Pueblito 123, El Pueblito, QRO',
        latlng: { lat: 20.5821, lng: -100.3897 },
        cantidadviviendas: 120,
        contacto: 'admin@elpueblito.mx'
      }
    };

    return {
      token: `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `mock-refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: mockUser,
      expiresIn: 3600 // 1 hora
    };
  }

  /**
   * Registra un nuevo usuario
   * TEMPORAL: Si useMockAuth está activado, simula un registro exitoso sin llamar a la API
   */
  register(data: RegisterRequest): Observable<AuthResponse> {
    this.isLoading.set(true);
    this.logger.info('Registration attempt', 'AuthService', { username: data.username, email: data.email, useMock: environment.auth?.useMockAuth });
    
    // TEMPORAL: Modo mock - simula registro exitoso sin llamar a la API
    // Para habilitar la API real, cambiar useMockAuth a false en environment.ts
    if (environment.auth?.useMockAuth) {
      return this.mockRegister(data);
    }
    
    // CÓDIGO REAL DE API - Se ejecutará cuando useMockAuth sea false
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
        this.logger.info('Registration successful', 'AuthService', { userId: response.user.id });
      }),
      catchError((error) => {
        this.isLoading.set(false);
        this.logger.error('Registration failed', error, 'AuthService', { username: data.username });
        return throwError(() => error);
      })
    );
  }

  /**
   * Simula un registro exitoso con datos mock
   * TEMPORAL: Solo para desarrollo sin backend
   */
  private mockRegister(data: RegisterRequest): Observable<AuthResponse> {
    const mockResponse = this.createMockAuthResponseFromRegister(data);
    
    // Simular delay de red (500ms) y luego procesar la respuesta
    return of(mockResponse).pipe(
      delay(500),
      tap((response) => {
        this.handleAuthSuccess(response);
        this.isLoading.set(false);
        this.logger.info('Mock registration successful', 'AuthService', { 
          userId: response.user.id, 
          username: data.username,
          note: 'Using mock authentication - API calls disabled'
        });
      })
    );
  }

  /**
   * Crea una respuesta mock de autenticación desde datos de registro
   */
  private createMockAuthResponseFromRegister(data: RegisterRequest): AuthResponse {
    const mockUser: UserInfo = {
      id: `mock-user-${Date.now()}`,
      fullname: data.fullname,
      username: data.username,
      email: data.email,
      role: RolesEnum.RESIDENT,
      unidadhabitacional: {
        id: 'fcdc9a85-88b7-4109-84b3-a75107392d87',
        tipoUnidadHabitacional: tipoComunidadEnum.FRACCIONAMIENTO,
        nombre: 'Residencial El Pueblito',
        ubicacion: 'Av. Paseo del Pueblito 123, El Pueblito, QRO',
        latlng: { lat: 20.5821, lng: -100.3897 },
        cantidadviviendas: 120,
        contacto: 'admin@elpueblito.mx'
      }
    };

    return {
      token: `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `mock-refresh-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user: mockUser,
      expiresIn: 3600 // 1 hora
    };
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    const userId = this.currentUser()?.id;
    this.logger.info('Logout', 'AuthService', { userId });
    
    this.sessionService.clearSession();
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresca el token de autenticación
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.sessionService.getRefreshToken();
    
    if (!refreshToken) {
      this.logger.warn('Refresh token attempt without token', 'AuthService');
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.logger.debug('Refreshing token', 'AuthService');
    
    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.handleAuthSuccess(response);
        this.logger.debug('Token refreshed successfully', 'AuthService');
      }),
      catchError((error) => {
        this.logger.error('Token refresh failed', error, 'AuthService');
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  checkAuth(): boolean {
    const token = this.sessionService.getToken();
    const user = this.sessionService.getUser();
    
    if (token && user && !this.sessionService.isTokenExpired()) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      return true;
    }
    
    this.logout();
    return false;
  }

  /**
   * Maneja el éxito de autenticación
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.sessionService.saveSession(response);
    this.isAuthenticated.set(true);
    this.currentUser.set(response.user);
  }

  /**
   * Verifica si hay una sesión guardada
   */
  private checkStoredSession(): void {
    if (this.checkAuth()) {
      // Sesión válida encontrada
      return;
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role;
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.currentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Solicita recuperación de contraseña enviando un correo con contraseña provisional
   * TEMPORAL: Si useMockAuth está activado, simula el envío sin llamar a la API
   */
  forgotPassword(usernameOrEmail: string): Observable<{ message: string }> {
    this.logger.info('Forgot password request', 'AuthService', { usernameOrEmail, useMock: environment.auth?.useMockAuth });
    
    // TEMPORAL: Modo mock - simula envío exitoso sin llamar a la API
    // Para habilitar la API real, cambiar useMockAuth a false en environment.ts
    if (environment.auth?.useMockAuth) {
      return this.mockForgotPassword(usernameOrEmail);
    }
    
    // CÓDIGO REAL DE API - Se ejecutará cuando useMockAuth sea false
    return this.http.post<{ message: string }>(`${this.API_URL}/forgot-password`, { usernameOrEmail }).pipe(
      tap(() => {
        this.logger.info('Forgot password request successful', 'AuthService', { usernameOrEmail });
      }),
      catchError((error) => {
        this.logger.error('Forgot password request failed', error, 'AuthService', { usernameOrEmail });
        return throwError(() => error);
      })
    );
  }

  /**
   * Simula el envío de correo de recuperación de contraseña
   * TEMPORAL: Solo para desarrollo sin backend
   */
  private mockForgotPassword(usernameOrEmail: string): Observable<{ message: string }> {
    // Simular delay de red (800ms) para simular el envío de correo
    return of({ message: 'Si el usuario o correo existe, se ha enviado un correo con una contraseña provisional.' }).pipe(
      delay(800),
      tap(() => {
        this.logger.info('Mock forgot password request successful', 'AuthService', { 
          usernameOrEmail,
          note: 'Using mock authentication - API calls disabled'
        });
      })
    );
  }

  /**
   * Restablece la contraseña del usuario autenticado
   * TEMPORAL: Si useMockAuth está activado, simula el cambio sin llamar a la API
   */
  resetPassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    this.logger.info('Reset password request', 'AuthService', { useMock: environment.auth?.useMockAuth });
    
    // TEMPORAL: Modo mock - simula cambio exitoso sin llamar a la API
    // Para habilitar la API real, cambiar useMockAuth a false en environment.ts
    if (environment.auth?.useMockAuth) {
      return this.mockResetPassword(currentPassword, newPassword);
    }
    
    // CÓDIGO REAL DE API - Se ejecutará cuando useMockAuth sea false
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, { 
      currentPassword, 
      newPassword 
    }).pipe(
      tap(() => {
        this.logger.info('Reset password successful', 'AuthService');
      }),
      catchError((error) => {
        this.logger.error('Reset password failed', error, 'AuthService');
        return throwError(() => error);
      })
    );
  }

  /**
   * Simula el cambio de contraseña
   * TEMPORAL: Solo para desarrollo sin backend
   */
  private mockResetPassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    // Simular delay de red (800ms) para simular el cambio
    return of({ message: 'Tu contraseña ha sido actualizada exitosamente.' }).pipe(
      delay(800),
      tap(() => {
        this.logger.info('Mock reset password successful', 'AuthService', { 
          note: 'Using mock authentication - API calls disabled'
        });
      })
    );
  }
}


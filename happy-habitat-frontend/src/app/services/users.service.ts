import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, tap, map, filter, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';
import { SessionService } from './session.service';
import { UserInfo } from '../interfaces/user-info.interface';
import { RolesEnum } from '../enums/roles.enum';

export interface UserDto {
  id: string;
  roleId: string;
  roleCode: RolesEnum;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  residentInfo?: ResidentInfoDto;
  userCommunityIds?: string[];
}

export interface ResidentInfoDto {
  id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  number?: string;
  address: string;
  communityId?: string;
  communityIds: string[];
}

export interface CreateUserRequest {
  roleId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isActive?: boolean;
  residentInfo?: {
    fullName: string;
    email?: string;
    phone?: string;
    number?: string;
    address: string;
  };
  communityIds: string[];
  userCommunityIds?: string[];
}

export interface UpdateUserRequest {
  roleId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  isActive?: boolean;
  residentInfo?: {
    fullName: string;
    email?: string;
    phone?: string;
    number?: string;
    address: string;
  };
  communityIds: string[];
  userCommunityIds?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);
  private sessionService = inject(SessionService);

  private readonly API_URL = `${environment.apiUrl}/users`;

  // Signal para almacenar el usuario logueado
  currentUser = signal<UserInfo | null>(null);

  constructor() {
    // Inicializar el usuario desde localStorage si existe
    this.initializeUserFromSession();
  }

  /**
   * Inicializa el usuario desde la sesión guardada
   */
  private initializeUserFromSession(): void {
    const user = this.sessionService.getUser();
    if (user) {
      this.currentUser.set(user);
      this.logger.debug('User initialized from session', 'UsersService', { userId: user.id, username: user.username });
    }
  }

  /**
   * Guarda el usuario logueado en el servicio
   */
  setCurrentUser(user: UserInfo): void {
    this.currentUser.set(user);
    this.logger.debug('Current user set in UsersService', 'UsersService', { 
      userId: user.id, 
      username: user.username,
      role: user.role 
    });
  }

  /**
   * Obtiene el usuario logueado actual
   */
  getCurrentUser(): UserInfo | null {
    return this.currentUser();
  }

  /**
   * Obtiene el ID del usuario logueado actual
   */
  getCurrentUserId(): string | undefined {
    return this.currentUser()?.id;
  }

  /**
   * Limpia el usuario logueado (útil para logout)
   */
  clearCurrentUser(): void {
    this.currentUser.set(null);
    this.logger.debug('Current user cleared from UsersService', 'UsersService');
  }

  /**
   * Obtiene el ResidentId del usuario actual autenticado
   * Usa el currentUser guardado si está disponible, evita peticiones HTTP innecesarias
   */
  getCurrentUserResidentId(): Observable<string | null> {
    // Obtener el usuario actual desde el signal
    const currentUser = this.getCurrentUser();
    
    // Si no hay usuario logueado, devolver null sin hacer petición HTTP
    if (!currentUser) {
      this.logger.warn('No current user found, cannot get resident ID', 'UsersService');
      return of(null);
    }
    
    // Si el usuario tiene residentInfo con id, usarlo directamente (evita petición HTTP)
    if (currentUser.residentInfo?.id) {
      const residentId = currentUser.residentInfo.id;
      this.logger.debug('Resident ID found in current user', 'UsersService', { 
        userId: currentUser.id, 
        residentId 
      });
      return of(residentId);
    }
    
    // Si el usuario está logueado pero no tiene residentInfo, devolver null
    // No hacer petición HTTP para evitar errores de CORS/conexión
    this.logger.debug('User logged in but no resident info available', 'UsersService', { 
      userId: currentUser.id,
      hasResidentInfo: !!currentUser.residentInfo
    });
    return of(null);
  }

  /**
   * Obtiene todos los usuarios
   */
  getAllUsers(includeInactive: boolean = false): Observable<UserDto[]> {
    this.logger.debug('Fetching all users', 'UsersService', { includeInactive });
    
    let params = new HttpParams();
    if (includeInactive) {
      params = params.set('includeInactive', 'true');
    }
    
    return this.http.get<UserDto[]>(this.API_URL, { params }).pipe(
      catchError((error) => {
        this.logger.error('Error fetching users', error, 'UsersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: string): Observable<UserDto> {
    this.logger.debug(`Fetching user with id: ${id}`, 'UsersService');
    
    return this.http.get<UserDto>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching user ${id}`, error, 'UsersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo usuario
   */
  createUser(request: CreateUserRequest): Observable<UserDto> {
    this.logger.info('Creating new user', 'UsersService', { 
      username: request.username,
      roleId: request.roleId
    });
    
    return this.http.post<UserDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating user', error, 'UsersService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un usuario existente
   */
  updateUser(id: string, request: UpdateUserRequest): Observable<UserDto> {
    this.logger.info(`Updating user ${id}`, 'UsersService', { 
      username: request.username,
      roleId: request.roleId
    });
    
    return this.http.put<UserDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating user ${id}`, error, 'UsersService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: string): Observable<void> {
    this.logger.info(`Deleting user ${id}`, 'UsersService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting user ${id}`, error, 'UsersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


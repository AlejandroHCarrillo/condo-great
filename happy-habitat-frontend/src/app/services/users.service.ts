import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';
import { SessionService } from './session.service';
import { UserInfo } from '../interfaces/user-info.interface';

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
   */
  getCurrentUserResidentId(): Observable<string> {
    // Obtener el usuario actual desde el signal
    const currentUser = this.getCurrentUser();
    const currentUserId = "4497F73C-C55E-4027-B50A-4D13CF3AD71E"; //currentUser?.id;
    
    console.log('[UsersService] getCurrentUserResidentId - Current User ID:', currentUserId);
    console.log('[UsersService] getCurrentUserResidentId - Current User Info:', currentUser);
    
    this.logger.debug('Fetching current user resident ID', 'UsersService', { userId: currentUserId });
    
    return this.http.get<string>(`${this.API_URL}/me/resident`).pipe(
      tap((residentId) => {
        console.log('[UsersService] getCurrentUserResidentId - Received ResidentId:', residentId);
        console.log('[UsersService] getCurrentUserResidentId - User ID used:', currentUserId, '| ResidentId received:', residentId);
      }),
      catchError((error) => {
        console.error('[UsersService] getCurrentUserResidentId - Error:', error);
        console.error('[UsersService] getCurrentUserResidentId - User ID that caused error:', currentUserId);
        this.logger.error('Error fetching current user resident ID', error, 'UsersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


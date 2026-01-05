import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comunicado } from '../shared/interfaces/comunicado.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class ComunicadosService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/comunicados`;

  /**
   * Obtiene los comunicados paginados (primeros 20, más recientes primero)
   * @param page Número de página (por defecto 1)
   * @param pageSize Tamaño de página (por defecto 20)
   */
  getComunicadosPaginated(page: number = 1, pageSize: number = 20): Observable<Comunicado[]> {
    this.logger.debug('Fetching paginated comunicados', 'ComunicadosService', { page, pageSize });
    
    const url = `${this.API_URL}/paginated?page=${page}&pageSize=${pageSize}`;
    
    return this.http.get<Comunicado[]>(url).pipe(
      catchError((error) => {
        this.logger.error('Error fetching paginated comunicados', error, 'ComunicadosService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los comunicados
   */
  getAllComunicados(): Observable<Comunicado[]> {
    this.logger.debug('Fetching all comunicados', 'ComunicadosService');
    
    return this.http.get<Comunicado[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching comunicados', error, 'ComunicadosService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene comunicados por ID de comunidad
   */
  getComunicadosByCommunityId(communityId?: string | null): Observable<Comunicado[]> {
    this.logger.debug(`Fetching comunicados for community: ${communityId}`, 'ComunicadosService');
    
    const url = communityId 
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    
    return this.http.get<Comunicado[]>(url).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching comunicados for community ${communityId}`, error, 'ComunicadosService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un comunicado por ID
   */
  getComunicadoById(id: string): Observable<Comunicado> {
    this.logger.debug(`Fetching comunicado with id: ${id}`, 'ComunicadosService');
    
    return this.http.get<Comunicado>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching comunicado ${id}`, error, 'ComunicadosService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


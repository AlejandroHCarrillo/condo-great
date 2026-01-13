import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comunidad } from '../interfaces/comunidad.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

export interface CommunityDto {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
  contacto: string;
  email: string;
  phone: string;
  tipoComunidad: string;
  latitud?: number | null;
  longitud?: number | null;
  cantidadViviendas: number;
}

export interface CreateCommunityRequest {
  nombre: string;
  descripcion: string;
  direccion: string;
  contacto: string;
  email: string;
  phone: string;
  tipoComunidad: string;
  latitud?: number | null;
  longitud?: number | null;
  cantidadViviendas: number;
}

export interface UpdateCommunityRequest {
  nombre: string;
  descripcion: string;
  direccion: string;
  contacto: string;
  email: string;
  phone: string;
  tipoComunidad: string;
  latitud?: number | null;
  longitud?: number | null;
  cantidadViviendas: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommunitiesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/communities`;

  /**
   * Obtiene todas las comunidades
   */
  getAllCommunities(): Observable<CommunityDto[]> {
    this.logger.debug('Fetching all communities', 'CommunitiesService');
    
    return this.http.get<CommunityDto[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching communities', error, 'CommunitiesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene una comunidad por ID
   */
  getCommunityById(id: string): Observable<CommunityDto> {
    this.logger.debug(`Fetching community with id: ${id}`, 'CommunitiesService');
    
    return this.http.get<CommunityDto>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching community ${id}`, error, 'CommunitiesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea una nueva comunidad
   */
  createCommunity(request: CreateCommunityRequest): Observable<CommunityDto> {
    this.logger.info('Creating new community', 'CommunitiesService', { 
      nombre: request.nombre
    });
    
    return this.http.post<CommunityDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating community', error, 'CommunitiesService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza una comunidad existente
   */
  updateCommunity(id: string, request: UpdateCommunityRequest): Observable<CommunityDto> {
    this.logger.info(`Updating community ${id}`, 'CommunitiesService');
    
    return this.http.put<CommunityDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating community ${id}`, error, 'CommunitiesService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina una comunidad
   */
  deleteCommunity(id: string): Observable<void> {
    this.logger.info(`Deleting community ${id}`, 'CommunitiesService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting community ${id}`, error, 'CommunitiesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


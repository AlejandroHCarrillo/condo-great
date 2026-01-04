import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CreateResidentVisitRequest, 
  UpdateResidentVisitRequest, 
  ResidentVisitDto 
} from '../shared/interfaces/resident-visit.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class ResidentVisitsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/residentvisits`;

  /**
   * Obtiene todas las visitas
   */
  getAllVisits(): Observable<ResidentVisitDto[]> {
    this.logger.debug('Fetching all visits', 'ResidentVisitsService');
    
    return this.http.get<ResidentVisitDto[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching visits', error, 'ResidentVisitsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene una visita por ID
   */
  getVisitById(id: string): Observable<ResidentVisitDto> {
    this.logger.debug(`Fetching visit with id: ${id}`, 'ResidentVisitsService');
    
    return this.http.get<ResidentVisitDto>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching visit ${id}`, error, 'ResidentVisitsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todas las visitas de un residente específico
   */
  getVisitsByResidentId(residentId: string): Observable<ResidentVisitDto[]> {
    this.logger.debug(`Fetching visits for resident: ${residentId}`, 'ResidentVisitsService');
    
    return this.http.get<ResidentVisitDto[]>(`${this.API_URL}/resident/${residentId}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching visits for resident ${residentId}`, error, 'ResidentVisitsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea una nueva visita
   */
  createVisit(request: CreateResidentVisitRequest): Observable<ResidentVisitDto> {
    this.logger.info('Creating new visit', 'ResidentVisitsService', { 
      visitorName: request.visitorName,
      residentId: request.residentId 
    });
    
    return this.http.post<ResidentVisitDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating visit', error, 'ResidentVisitsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza una visita existente
   */
  updateVisit(id: string, request: UpdateResidentVisitRequest): Observable<ResidentVisitDto> {
    this.logger.info(`Updating visit ${id}`, 'ResidentVisitsService');
    
    return this.http.put<ResidentVisitDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating visit ${id}`, error, 'ResidentVisitsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina una visita
   */
  deleteVisit(id: string): Observable<void> {
    this.logger.info(`Deleting visit ${id}`, 'ResidentVisitsService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting visit ${id}`, error, 'ResidentVisitsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


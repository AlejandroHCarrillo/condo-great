import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

export interface ContratoDto {
  id: string;
  communityId: string; // Mapeado desde CommunityId del backend
  tipoContrato: string; // Mapeado desde TipoContrato del backend
  folioContrato: string; // Mapeado desde FolioContrato del backend
  representanteComunidad: string; // Mapeado desde RepresentanteComunidad del backend
  costoTotal: number; // Mapeado desde CostoTotal del backend
  periodicidadPago: string; // Mapeado desde PeriodicidadPago del backend
  metodoPago: string; // Mapeado desde MetodoPago del backend
  fechaFirma: string; // Mapeado desde FechaFirma del backend
  fechaInicio: string; // Mapeado desde FechaInicio del backend
  fechaFin?: string | null; // Mapeado desde FechaFin del backend
  numeroCasas: number; // Mapeado desde NumeroCasas del backend
  estadoContrato: string; // Mapeado desde EstadoContrato del backend
  asesorVentas?: string | null; // Mapeado desde AsesorVentas del backend
  notas?: string | null; // Mapeado desde Notas del backend
  documentosAdjuntos?: string | null; // Mapeado desde DocumentosAdjuntos del backend
  paymentHistories?: any[] | null; // Mapeado desde PaymentHistories del backend
  createdAt: string; // Mapeado desde CreatedAt del backend
  updatedAt?: string | null; // Mapeado desde UpdatedAt del backend
  updatedByUserId?: string | null; // Mapeado desde UpdatedByUserId del backend
}

export interface CreateContratoRequest {
  communityId: string;
  tipoContrato: string;
  folioContrato: string;
  representanteComunidad: string;
  costoTotal: number;
  periodicidadPago: string;
  metodoPago: string;
  fechaFirma: string;
  fechaInicio: string;
  fechaFin?: string | null;
  numeroCasas: number;
  estadoContrato: string;
  asesorVentas?: string | null;
  notas?: string | null;
  documentosAdjuntos?: string | null;
}

export interface UpdateContratoRequest {
  tipoContrato: string;
  folioContrato: string;
  representanteComunidad: string;
  costoTotal: number;
  periodicidadPago: string;
  metodoPago: string;
  fechaFirma: string;
  fechaInicio: string;
  fechaFin?: string | null;
  numeroCasas: number;
  estadoContrato: string;
  asesorVentas?: string | null;
  notas?: string | null;
  documentosAdjuntos?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContractsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/contratos`;

  /**
   * Obtiene todos los contratos
   */
  getAllContratos(includeInactive: boolean = false): Observable<ContratoDto[]> {
    this.logger.debug('Fetching all contracts', 'ContractsService');
    
    return this.http.get<ContratoDto[]>(this.API_URL, {
      params: { includeInactive: includeInactive.toString() }
    }).pipe(
      catchError((error) => {
        this.logger.error('Error fetching contracts', error, 'ContractsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene contratos por ID de comunidad
   */
  getContratosByCommunityId(communityId: string, includeInactive: boolean = false): Observable<ContratoDto[]> {
    this.logger.debug(`Fetching contracts for community ${communityId}`, 'ContractsService');
    
    return this.http.get<ContratoDto[]>(`${this.API_URL}/community/${communityId}`, {
      params: { includeInactive: includeInactive.toString() }
    }).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching contracts for community ${communityId}`, error, 'ContractsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un contrato por ID
   */
  getContratoById(id: string, includeInactive: boolean = false): Observable<ContratoDto> {
    this.logger.debug(`Fetching contract with id: ${id}`, 'ContractsService');
    
    return this.http.get<ContratoDto>(`${this.API_URL}/${id}`, {
      params: { includeInactive: includeInactive.toString() }
    }).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching contract ${id}`, error, 'ContractsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo contrato
   */
  createContrato(request: CreateContratoRequest): Observable<ContratoDto> {
    this.logger.info('Creating new contract', 'ContractsService', { 
      folioContrato: request.folioContrato
    });
    
    return this.http.post<ContratoDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating contract', error, 'ContractsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un contrato existente
   */
  updateContrato(id: string, request: UpdateContratoRequest): Observable<ContratoDto> {
    this.logger.info(`Updating contract ${id}`, 'ContractsService');
    
    return this.http.put<ContratoDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating contract ${id}`, error, 'ContractsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un contrato
   */
  deleteContrato(id: string): Observable<void> {
    this.logger.info(`Deleting contract ${id}`, 'ContractsService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting contract ${id}`, error, 'ContractsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

export interface CargoComunidadDto {
  id: string;
  contratoId: string;
  comunidadId: string;
  montoCargo: number;
  fechaDePago: string;
  montoRecargos: number;
  estatus: string; // No vencido, vencido, pagado, pago parcial
  notas?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PagoComunidadDto {
  id: string;
  montoPago: number;
  formaDePago: string;
  fechaDePago: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
  updatedByUserId?: string | null;
  pagoCargos?: PagoCargoComunidadDto[];
}

export interface PagoCargoComunidadDto {
  id: string;
  pagoComunidadId: string;
  cargosComunidadId: string;
  montoAplicado: number;
  createdAt: string;
}

export interface StatementDto {
  cargos: CargoComunidadDto[];
  pagos: PagoComunidadDto[];
}

@Injectable({
  providedIn: 'root'
})
export class ChargesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/charges`;

  /**
   * Obtiene el estado de cuenta (cargos y pagos) por contratoId
   */
  getStatementByContratoId(contratoId: string): Observable<StatementDto> {
    this.logger.debug(`Fetching statement for contract: ${contratoId}`, 'ChargesService');
    
    return this.http.get<StatementDto>(`${this.API_URL}/contrato/${contratoId}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching statement for contract ${contratoId}`, error, 'ChargesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene el estado de cuenta (cargos y pagos) por comunidadId
   */
  getStatementByComunidadId(comunidadId: string): Observable<StatementDto> {
    this.logger.debug(`Fetching statement for community: ${comunidadId}`, 'ChargesService');
    
    return this.http.get<StatementDto>(`${this.API_URL}/comunidad/${comunidadId}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching statement for community ${comunidadId}`, error, 'ChargesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los cargos de una comunidad
   */
  getCargosByComunidadId(comunidadId: string): Observable<CargoComunidadDto[]> {
    this.logger.debug(`Fetching charges for community: ${comunidadId}`, 'ChargesService');
    
    return this.http.get<CargoComunidadDto[]>(`${this.API_URL}/comunidad/${comunidadId}/cargos`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching charges for community ${comunidadId}`, error, 'ChargesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los cargos de un contrato
   */
  getCargosByContratoId(contratoId: string): Observable<CargoComunidadDto[]> {
    this.logger.debug(`Fetching charges for contract: ${contratoId}`, 'ChargesService');
    
    return this.http.get<CargoComunidadDto[]>(`${this.API_URL}/contrato/${contratoId}/cargos`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching charges for contract ${contratoId}`, error, 'ChargesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}

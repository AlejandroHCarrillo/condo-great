import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CreateVehicleRequest, 
  UpdateVehicleRequest, 
  VehicleDto 
} from '../shared/interfaces/vehicle.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class VehiclesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/vehicles`;

  /**
   * Obtiene todos los vehículos
   */
  getAllVehicles(): Observable<VehicleDto[]> {
    this.logger.debug('Fetching all vehicles', 'VehiclesService');
    
    return this.http.get<VehicleDto[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching vehicles', error, 'VehiclesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un vehículo por ID
   */
  getVehicleById(id: string): Observable<VehicleDto> {
    this.logger.debug(`Fetching vehicle with id: ${id}`, 'VehiclesService');
    
    return this.http.get<VehicleDto>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching vehicle ${id}`, error, 'VehiclesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los vehículos de un residente específico
   */
  getVehiclesByResidentId(residentId: string): Observable<VehicleDto[]> {
    this.logger.debug(`Fetching vehicles for resident: ${residentId}`, 'VehiclesService');
    
    return this.http.get<VehicleDto[]>(`${this.API_URL}/resident/${residentId}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching vehicles for resident ${residentId}`, error, 'VehiclesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo vehículo
   */
  createVehicle(request: CreateVehicleRequest): Observable<VehicleDto> {
    this.logger.info('Creating new vehicle', 'VehiclesService', { 
      brand: request.brand,
      model: request.model,
      residentId: request.residentId 
    });
    
    return this.http.post<VehicleDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating vehicle', error, 'VehiclesService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un vehículo existente
   */
  updateVehicle(id: string, request: UpdateVehicleRequest): Observable<VehicleDto> {
    this.logger.info(`Updating vehicle ${id}`, 'VehiclesService');
    
    return this.http.put<VehicleDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating vehicle ${id}`, error, 'VehiclesService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un vehículo
   */
  deleteVehicle(id: string): Observable<void> {
    this.logger.info(`Deleting vehicle ${id}`, 'VehiclesService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting vehicle ${id}`, error, 'VehiclesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


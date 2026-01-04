import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CreatePetRequest, 
  UpdatePetRequest, 
  PetDto 
} from '../shared/interfaces/pet.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/pets`;

  /**
   * Obtiene todas las mascotas
   */
  getAllPets(): Observable<PetDto[]> {
    this.logger.debug('Fetching all pets', 'PetsService');
    
    return this.http.get<PetDto[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching pets', error, 'PetsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene una mascota por ID
   */
  getPetById(id: string): Observable<PetDto> {
    this.logger.debug(`Fetching pet with id: ${id}`, 'PetsService');
    
    return this.http.get<PetDto>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching pet ${id}`, error, 'PetsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todas las mascotas de un residente específico
   */
  getPetsByResidentId(residentId: string): Observable<PetDto[]> {
    this.logger.debug(`Fetching pets for resident: ${residentId}`, 'PetsService');
    
    return this.http.get<PetDto[]>(`${this.API_URL}/resident/${residentId}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching pets for resident ${residentId}`, error, 'PetsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea una nueva mascota
   */
  createPet(request: CreatePetRequest): Observable<PetDto> {
    this.logger.info('Creating new pet', 'PetsService', { 
      name: request.name,
      residentId: request.residentId 
    });
    
    return this.http.post<PetDto>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating pet', error, 'PetsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza una mascota existente
   */
  updatePet(id: string, request: UpdatePetRequest): Observable<PetDto> {
    this.logger.info(`Updating pet ${id}`, 'PetsService');
    
    return this.http.put<PetDto>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating pet ${id}`, error, 'PetsService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina una mascota
   */
  deletePet(id: string): Observable<void> {
    this.logger.info(`Deleting pet ${id}`, 'PetsService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting pet ${id}`, error, 'PetsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Amenidad,
  CreateAmenityDto,
  UpdateAmenityDto
} from '../shared/interfaces/amenidad.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AmenidadesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/amenities`;

  getAllAmenities(): Observable<Amenidad[]> {
    this.logger.debug('Fetching all amenities', 'AmenidadesService');
    return this.http.get<Amenidad[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching amenities', error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  getAmenitiesByCommunityId(communityId?: string | null): Observable<Amenidad[]> {
    this.logger.debug(`Fetching amenities for community: ${communityId}`, 'AmenidadesService');
    const url = communityId
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    return this.http.get<Amenidad[]>(url).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching amenities for community ${communityId}`, error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  getAmenityById(id: string): Observable<Amenidad | null> {
    this.logger.debug(`Fetching amenity with id: ${id}`, 'AmenidadesService');
    return this.http.get<Amenidad>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        if (error.status === 404) return of(null);
        this.logger.error(`Error fetching amenity ${id}`, error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  createAmenity(dto: CreateAmenityDto): Observable<Amenidad> {
    return this.http.post<Amenidad>(this.API_URL, dto).pipe(
      catchError((error) => {
        this.logger.error('Error creating amenity', error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  updateAmenity(id: string, dto: UpdateAmenityDto): Observable<Amenidad> {
    return this.http.put<Amenidad>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((error) => {
        this.logger.error(`Error updating amenity ${id}`, error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  deleteAmenity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting amenity ${id}`, error, 'AmenidadesService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}

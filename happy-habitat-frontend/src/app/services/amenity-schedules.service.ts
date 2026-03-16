import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AmenityScheduleDto,
  CreateAmenityScheduleDto,
  UpdateAmenityScheduleDto
} from '../shared/interfaces/amenity-schedule.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class AmenitySchedulesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/amenityschedules`;

  getByAmenityId(amenityId: string): Observable<AmenityScheduleDto[]> {
    return this.http.get<AmenityScheduleDto[]>(`${this.API_URL}/amenity/${amenityId}`).pipe(
      catchError((err) => {
        this.logger.error('Error fetching amenity schedules', err, 'AmenitySchedulesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getById(id: string): Observable<AmenityScheduleDto | null> {
    return this.http.get<AmenityScheduleDto>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateAmenityScheduleDto): Observable<AmenityScheduleDto> {
    return this.http.post<AmenityScheduleDto>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating amenity schedule', err, 'AmenitySchedulesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateAmenityScheduleDto): Observable<AmenityScheduleDto> {
    return this.http.put<AmenityScheduleDto>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error('Error updating amenity schedule', err, 'AmenitySchedulesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error('Error deleting amenity schedule', err, 'AmenitySchedulesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

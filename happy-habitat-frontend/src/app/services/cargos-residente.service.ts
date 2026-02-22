import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CargoResidente,
  CreateCargoResidenteDto,
  UpdateCargoResidenteDto
} from '../shared/interfaces/cargo-residente.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class CargosResidenteService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/cargosresidente`;

  getAll(): Observable<CargoResidente[]> {
    return this.http.get<CargoResidente[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching cargos residente', err, 'CargosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByResidentId(residentId: string): Observable<CargoResidente[]> {
    return this.http
      .get<CargoResidente[]>(`${this.API_URL}/resident/${residentId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching cargos for resident ${residentId}`,
            err,
            'CargosResidenteService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getByCommunityId(communityId: string): Observable<CargoResidente[]> {
    return this.http
      .get<CargoResidente[]>(`${this.API_URL}/community/${communityId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching cargos for community ${communityId}`,
            err,
            'CargosResidenteService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<CargoResidente | null> {
    return this.http.get<CargoResidente>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching cargo ${id}`, err, 'CargosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateCargoResidenteDto): Observable<CargoResidente> {
    return this.http.post<CargoResidente>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating cargo residente', err, 'CargosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateCargoResidenteDto): Observable<CargoResidente> {
    return this.http.put<CargoResidente>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating cargo ${id}`, err, 'CargosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting cargo ${id}`, err, 'CargosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

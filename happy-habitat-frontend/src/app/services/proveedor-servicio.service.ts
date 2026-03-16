import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ProveedorServicio,
  CreateProveedorServicioDto,
  UpdateProveedorServicioDto
} from '../shared/interfaces/proveedor-servicio.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class ProveedorServicioService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/proveedorservicios`;

  getAll(includeInactive = false): Observable<ProveedorServicio[]> {
    return this.http
      .get<ProveedorServicio[]>(this.API_URL, { params: { includeInactive: String(includeInactive) } })
      .pipe(
        catchError((err) => {
          this.logger.error('Error fetching proveedores servicios', err, 'ProveedorServicioService');
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getByCommunityId(communityId: string | null, includeInactive = false): Observable<ProveedorServicio[]> {
    const url = communityId
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    return this.http
      .get<ProveedorServicio[]>(url, { params: { includeInactive: String(includeInactive) } })
      .pipe(
        catchError((err) => {
          this.logger.error(`Error fetching proveedores servicios for community ${communityId}`, err, 'ProveedorServicioService');
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<ProveedorServicio | null> {
    return this.http.get<ProveedorServicio>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching proveedor servicio ${id}`, err, 'ProveedorServicioService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateProveedorServicioDto): Observable<ProveedorServicio> {
    return this.http.post<ProveedorServicio>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating proveedor servicio', err, 'ProveedorServicioService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateProveedorServicioDto): Observable<ProveedorServicio> {
    return this.http.put<ProveedorServicio>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating proveedor servicio ${id}`, err, 'ProveedorServicioService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting proveedor servicio ${id}`, err, 'ProveedorServicioService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  calificar(id: string, puntuacion: number): Observable<ProveedorServicio> {
    return this.http.post<ProveedorServicio>(`${this.API_URL}/${id}/calificar`, { puntuacion }).pipe(
      catchError((err) => {
        this.logger.error(`Error calificando proveedor servicio ${id}`, err, 'ProveedorServicioService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

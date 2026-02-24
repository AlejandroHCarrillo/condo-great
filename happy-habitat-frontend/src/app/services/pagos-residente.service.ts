import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PagosResidente,
  CreatePagosResidenteDto,
  UpdatePagosResidenteDto
} from '../shared/interfaces/pagos-residente.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class PagosResidenteService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/pagosresidente`;

  getAll(): Observable<PagosResidente[]> {
    return this.http.get<PagosResidente[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching pagos residente', err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getMy(): Observable<PagosResidente[]> {
    return this.http.get<PagosResidente[]>(`${this.API_URL}/my`).pipe(
      catchError((err) => {
        this.logger.error('Error fetching my pagos', err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByResidentId(residentId: string): Observable<PagosResidente[]> {
    return this.http
      .get<PagosResidente[]>(`${this.API_URL}/resident/${residentId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching pagos for resident ${residentId}`,
            err,
            'PagosResidenteService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getByCommunityId(communityId: string): Observable<PagosResidente[]> {
    return this.http
      .get<PagosResidente[]>(`${this.API_URL}/community/${communityId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching pagos for community ${communityId}`,
            err,
            'PagosResidenteService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<PagosResidente | null> {
    return this.http.get<PagosResidente>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching pago ${id}`, err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreatePagosResidenteDto): Observable<PagosResidente> {
    return this.http.post<PagosResidente>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating pago residente', err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdatePagosResidenteDto): Observable<PagosResidente> {
    return this.http.put<PagosResidente>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating pago ${id}`, err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting pago ${id}`, err, 'PagosResidenteService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

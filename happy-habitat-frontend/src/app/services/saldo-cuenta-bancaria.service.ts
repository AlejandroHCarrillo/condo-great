import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  SaldoCuentaBancaria,
  CreateSaldoCuentaBancariaDto,
  UpdateSaldoCuentaBancariaDto
} from '../shared/interfaces/saldo-cuenta-bancaria.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class SaldoCuentaBancariaService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/SaldoCuentaBancaria`;

  getAll(): Observable<SaldoCuentaBancaria[]> {
    return this.http.get<SaldoCuentaBancaria[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching saldos cuenta bancaria', err, 'SaldoCuentaBancariaService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByCommunityId(communityId: string): Observable<SaldoCuentaBancaria[]> {
    return this.http
      .get<SaldoCuentaBancaria[]>(`${this.API_URL}/community/${communityId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching saldos for community ${communityId}`,
            err,
            'SaldoCuentaBancariaService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: number): Observable<SaldoCuentaBancaria | null> {
    return this.http.get<SaldoCuentaBancaria>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching saldo ${id}`, err, 'SaldoCuentaBancariaService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateSaldoCuentaBancariaDto): Observable<SaldoCuentaBancaria> {
    return this.http.post<SaldoCuentaBancaria>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating saldo cuenta bancaria', err, 'SaldoCuentaBancariaService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: number, dto: UpdateSaldoCuentaBancariaDto): Observable<SaldoCuentaBancaria> {
    return this.http.put<SaldoCuentaBancaria>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating saldo ${id}`, err, 'SaldoCuentaBancariaService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting saldo ${id}`, err, 'SaldoCuentaBancariaService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

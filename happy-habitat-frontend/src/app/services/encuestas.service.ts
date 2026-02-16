import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Encuesta,
  CreateEncuestaDto,
  UpdateEncuestaDto
} from '../shared/interfaces/encuesta.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/encuestas`;

  getAll(): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching encuestas', err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByCommunityId(communityId: string): Observable<Encuesta[]> {
    return this.http.get<Encuesta[]>(`${this.API_URL}/community/${communityId}`).pipe(
      catchError((err) => {
        this.logger.error(`Error fetching encuestas for community ${communityId}`, err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getById(id: string): Observable<Encuesta | null> {
    return this.http.get<Encuesta>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching encuesta ${id}`, err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateEncuestaDto): Observable<Encuesta> {
    return this.http.post<Encuesta>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating encuesta', err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateEncuestaDto): Observable<Encuesta> {
    return this.http.put<Encuesta>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating encuesta ${id}`, err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting encuesta ${id}`, err, 'EncuestasService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

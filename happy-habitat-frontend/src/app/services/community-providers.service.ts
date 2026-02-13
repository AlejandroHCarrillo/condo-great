import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CommunityProvider,
  CreateCommunityProviderDto,
  UpdateCommunityProviderDto
} from '../shared/interfaces/community-provider.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityProvidersService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/communityproviders`;

  getAll(includeInactive = false): Observable<CommunityProvider[]> {
    return this.http
      .get<CommunityProvider[]>(this.API_URL, { params: { includeInactive: String(includeInactive) } })
      .pipe(
        catchError((err) => {
          this.logger.error('Error fetching community providers', err, 'CommunityProvidersService');
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getByCommunityId(communityId: string | null, includeInactive = false): Observable<CommunityProvider[]> {
    const url = communityId
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    return this.http
      .get<CommunityProvider[]>(url, { params: { includeInactive: String(includeInactive) } })
      .pipe(
        catchError((err) => {
          this.logger.error(`Error fetching providers for community ${communityId}`, err, 'CommunityProvidersService');
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<CommunityProvider | null> {
    return this.http.get<CommunityProvider>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching provider ${id}`, err, 'CommunityProvidersService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateCommunityProviderDto): Observable<CommunityProvider> {
    return this.http.post<CommunityProvider>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating community provider', err, 'CommunityProvidersService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateCommunityProviderDto): Observable<CommunityProvider> {
    return this.http.put<CommunityProvider>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating provider ${id}`, err, 'CommunityProvidersService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting provider ${id}`, err, 'CommunityProvidersService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

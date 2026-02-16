import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CommunityConfiguration,
  CreateCommunityConfigurationDto,
  UpdateCommunityConfigurationDto
} from '../shared/interfaces/community-configuration.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityConfigurationsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/communityconfigurations`;

  getAll(): Observable<CommunityConfiguration[]> {
    return this.http.get<CommunityConfiguration[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching community configurations', err, 'CommunityConfigurationsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByCommunityId(communityId: string): Observable<CommunityConfiguration[]> {
    return this.http
      .get<CommunityConfiguration[]>(`${this.API_URL}/community/${communityId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching configurations for community ${communityId}`,
            err,
            'CommunityConfigurationsService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<CommunityConfiguration | null> {
    return this.http.get<CommunityConfiguration>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching configuration ${id}`, err, 'CommunityConfigurationsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateCommunityConfigurationDto): Observable<CommunityConfiguration> {
    return this.http.post<CommunityConfiguration>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating community configuration', err, 'CommunityConfigurationsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateCommunityConfigurationDto): Observable<CommunityConfiguration> {
    return this.http.put<CommunityConfiguration>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating configuration ${id}`, err, 'CommunityConfigurationsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting configuration ${id}`, err, 'CommunityConfigurationsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

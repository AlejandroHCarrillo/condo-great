import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CommunityPrice,
  CreateCommunityPriceDto,
  UpdateCommunityPriceDto
} from '../shared/interfaces/community-price.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class CommunityPricesService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/communityprices`;

  getAll(): Observable<CommunityPrice[]> {
    return this.http.get<CommunityPrice[]>(this.API_URL).pipe(
      catchError((err) => {
        this.logger.error('Error fetching community prices', err, 'CommunityPricesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByCommunityId(communityId: string): Observable<CommunityPrice[]> {
    return this.http
      .get<CommunityPrice[]>(`${this.API_URL}/community/${communityId}`)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `Error fetching prices for community ${communityId}`,
            err,
            'CommunityPricesService'
          );
          this.errorService.handleError(err);
          return throwError(() => err);
        })
      );
  }

  getById(id: string): Observable<CommunityPrice | null> {
    return this.http.get<CommunityPrice>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching price ${id}`, err, 'CommunityPricesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  create(dto: CreateCommunityPriceDto): Observable<CommunityPrice> {
    return this.http.post<CommunityPrice>(this.API_URL, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating community price', err, 'CommunityPricesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  update(id: string, dto: UpdateCommunityPriceDto): Observable<CommunityPrice> {
    return this.http.put<CommunityPrice>(`${this.API_URL}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating price ${id}`, err, 'CommunityPricesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting price ${id}`, err, 'CommunityPricesService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  CreateBannerRequest, 
  UpdateBannerRequest, 
  Banner 
} from '../shared/interfaces/banner.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/banners`;

  /**
   * Obtiene todos los banners
   */
  getAllBanners(): Observable<Banner[]> {
    this.logger.debug('Fetching all banners', 'BannersService');
    
    return this.http.get<Banner[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching banners', error, 'BannersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene solo los banners activos
   * @param date Fecha opcional para filtrar banners (por defecto usa la fecha actual)
   */
  getActiveBanners(date?: Date): Observable<Banner[]> {
    this.logger.debug('Fetching active banners', 'BannersService', { date });
    
    let url = `${this.API_URL}/active`;
    if (date) {
      const dateParam = date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      url += `?date=${dateParam}`;
    }
    
    return this.http.get<Banner[]>(url).pipe(
      catchError((error) => {
        this.logger.error('Error fetching active banners', error, 'BannersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene banners por ID de comunidad
   */
  getBannersByCommunityId(communityId?: string | null): Observable<Banner[]> {
    this.logger.debug(`Fetching banners for community: ${communityId}`, 'BannersService');
    
    const url = communityId 
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    
    return this.http.get<Banner[]>(url).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching banners for community ${communityId}`, error, 'BannersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un banner por ID
   */
  getBannerById(id: string): Observable<Banner> {
    this.logger.debug(`Fetching banner with id: ${id}`, 'BannersService');
    
    return this.http.get<Banner>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching banner ${id}`, error, 'BannersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un nuevo banner
   */
  createBanner(request: CreateBannerRequest): Observable<Banner> {
    this.logger.info('Creating new banner', 'BannersService', { 
      title: request.title,
      communityId: request.communityId 
    });
    
    return this.http.post<Banner>(this.API_URL, request).pipe(
      catchError((error) => {
        this.logger.error('Error creating banner', error, 'BannersService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un banner existente
   */
  updateBanner(id: string, request: UpdateBannerRequest): Observable<Banner> {
    this.logger.info(`Updating banner ${id}`, 'BannersService');
    
    return this.http.put<Banner>(`${this.API_URL}/${id}`, request).pipe(
      catchError((error) => {
        this.logger.error(`Error updating banner ${id}`, error, 'BannersService', { request });
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un banner
   */
  deleteBanner(id: string): Observable<void> {
    this.logger.info(`Deleting banner ${id}`, 'BannersService');
    
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting banner ${id}`, error, 'BannersService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }
}


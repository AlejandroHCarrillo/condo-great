import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Residente, ResidentDto } from '../shared/interfaces/residente.interface';
import { mapResidentDtosToResidentes } from '../shared/mappers/resident.mapper';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

/**
 * Servicio de residentes.
 * Usa los endpoints del backend: /api/residents
 */
@Injectable({
  providedIn: 'root'
})
export class ResidentsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/residents`;
  private readonly CACHE_KEY_PREFIX = 'hh_residents_community_';
  private readonly CACHE_KEY_COMMUNITIES_PREFIX = 'hh_residents_communities_';
  private readonly RESIDENTS_CACHE_TTL_MS = 15 * 60 * 1000;

  private getResidentsCacheKey(communityId: string): string {
    return `${this.CACHE_KEY_PREFIX}${communityId}`;
  }

  /** Llave para caché de varias comunidades: concatenación de ids ordenados. */
  private getCacheKeyForCommunityIds(communityIds: string[]): string {
    return this.CACHE_KEY_COMMUNITIES_PREFIX + [...communityIds].filter(Boolean).sort().join(',');
  }

  private getResidentsFromCacheByKey(key: string): Residente[] | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return null;
      const parsed = JSON.parse(raw) as { data: Residente[]; savedAt: number } | Residente[];
      const entry = Array.isArray(parsed) ? null : parsed;
      if (!entry?.data || !Array.isArray(entry.data) || !entry.savedAt) return null;
      const expired = Date.now() - entry.savedAt > this.RESIDENTS_CACHE_TTL_MS;
      return expired ? null : entry.data;
    } catch {
      return null;
    }
  }

  private setResidentsCacheByKey(key: string, residentes: Residente[]): void {
    try {
      localStorage.setItem(key, JSON.stringify({ data: residentes, savedAt: Date.now() }));
    } catch (e) {
      this.logger.warn('Could not cache residents to localStorage', 'ResidentsService', e);
    }
  }

  private getResidentsFromCache(communityId: string): Residente[] | null {
    return this.getResidentsFromCacheByKey(this.getResidentsCacheKey(communityId));
  }

  private setResidentsCache(communityId: string, residentes: Residente[]): void {
    this.setResidentsCacheByKey(this.getResidentsCacheKey(communityId), residentes);
  }

  /**
   * Obtiene los residentes de las comunidades indicadas.
   * Usa caché en localStorage con llave = concatenación de communityIds (TTL 15 min).
   */
  getResidentsByCommunities(communityIds: string[]): Observable<Residente[]> {
    if (!communityIds?.length) return of([]);

    const key = this.getCacheKeyForCommunityIds(communityIds);
    const cached = this.getResidentsFromCacheByKey(key);
    if (cached !== null) return of(this.sortResidentsByCommunityAndNumber(cached));

    let params = new HttpParams();
    communityIds.forEach(id => params = params.append('communityIds', id));

    return this.http.get<ResidentDto[]>(`${this.API_URL}/by-communities`, { params }).pipe(
      map(dtos => this.sortResidentsByCommunityAndNumber(mapResidentDtosToResidentes(dtos))),
      tap(residentes => this.setResidentsCacheByKey(key, residentes)),
      catchError(error => {
        this.logger.error('Error loading residents', error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene los residentes de una comunidad.
   * Usa caché en localStorage por communityId (TTL 15 min).
   */
  getResidentsByCommunityId(communityId: string): Observable<Residente[]> {
    const cached = this.getResidentsFromCache(communityId);
    if (cached !== null) return of(this.sortResidentsByCommunityAndNumber(cached));

    return this.http.get<ResidentDto[]>(`${this.API_URL}/community/${communityId}`).pipe(
      map(dtos => this.sortResidentsByCommunityAndNumber(mapResidentDtosToResidentes(dtos))),
      tap(residentes => this.setResidentsCache(communityId, residentes)),
      catchError(error => {
        this.logger.error(`Error loading residents for community ${communityId}`, error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /** Ordena residentes por comunidad (primer id) y número de casa. */
  private sortResidentsByCommunityAndNumber(list: Residente[]): Residente[] {
    return [...list].sort((a, b) => {
      const comunidadA = a.comunidades?.[0] ?? '';
      const comunidadB = b.comunidades?.[0] ?? '';
      if (comunidadA !== comunidadB) return comunidadA.localeCompare(comunidadB);
      const numA = a.number ?? '';
      const numB = b.number ?? '';
      return numA.localeCompare(numB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
}

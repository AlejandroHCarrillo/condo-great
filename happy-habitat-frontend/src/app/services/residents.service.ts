import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Residente, ResidentDto, CreateResidentDto, UpdateResidentDto } from '../shared/interfaces/residente.interface';
import { mapDtoToResidente, mapResidentDtosToResidentes } from '../shared/mappers/resident.mapper';

/** Respuesta paginada del backend (GET con page y pageSize). */
export interface PagedResidentsResult {
  items: Residente[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PagedResultDtoBackend {
  items: ResidentDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
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
  private readonly CACHE_KEY_PAGED_PREFIX = 'hh_residents_community_paged_';
  private readonly CACHE_KEY_COMMUNITIES_PREFIX = 'hh_residents_communities_';
  private readonly RESIDENTS_CACHE_TTL_MS = 15 * 60 * 1000;
  /** Prefijo común de todas las llaves de caché de residentes (para invalidar en bloque). */
  private readonly CACHE_ALL_PREFIX = 'hh_residents_';

  private getResidentsCacheKey(communityId: string): string {
    return `${this.CACHE_KEY_PREFIX}${communityId}`;
  }

  /** Llave para caché paginado por comunidad: communityId + page + pageSize. */
  private getCacheKeyForCommunityIdPaged(communityId: string, page: number, pageSize: number): string {
    return `${this.CACHE_KEY_PAGED_PREFIX}${communityId}_${page}_${pageSize}`;
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

  private getPagedResidentsFromCacheByKey(key: string): PagedResidentsResult | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return null;
      const parsed = JSON.parse(raw) as { data: PagedResidentsResult; savedAt: number };
      if (!parsed?.data || typeof parsed.data.totalCount !== 'number' || !parsed.savedAt) return null;
      const expired = Date.now() - parsed.savedAt > this.RESIDENTS_CACHE_TTL_MS;
      return expired ? null : parsed.data;
    } catch {
      return null;
    }
  }

  private setPagedResidentsCacheByKey(key: string, result: PagedResidentsResult): void {
    try {
      localStorage.setItem(key, JSON.stringify({ data: result, savedAt: Date.now() }));
    } catch (e) {
      this.logger.warn('Could not cache paged residents to localStorage', 'ResidentsService', e);
    }
  }

  /**
   * Invalida toda la caché de residentes en localStorage.
   * Debe llamarse tras crear, actualizar o eliminar un residente para que la tabla se actualice.
   */
  invalidateResidentsCache(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_ALL_PREFIX)) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      this.logger.warn('Could not invalidate residents cache', 'ResidentsService', e);
    }
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
   * Obtiene residentes de una comunidad paginados.
   * Usa caché en localStorage con llave communityId + page + pageSize (TTL 15 min).
   */
  getResidentsByCommunityIdPaged(communityId: string, page: number, pageSize: number): Observable<PagedResidentsResult> {
    const key = this.getCacheKeyForCommunityIdPaged(communityId, page, pageSize);
    const cached = this.getPagedResidentsFromCacheByKey(key);
    if (cached !== null) return of(cached);

    const params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PagedResultDtoBackend>(`${this.API_URL}/community/${communityId}`, { params }).pipe(
      map(res => ({
        items: mapResidentDtosToResidentes(res.items),
        totalCount: res.totalCount,
        page: res.page,
        pageSize: res.pageSize,
        totalPages: res.totalPages
      })),
      tap(result => this.setPagedResidentsCacheByKey(key, result)),
      catchError(error => {
        this.logger.error(`Error loading residents for community ${communityId}`, error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene residentes de varias comunidades paginados (conecta con el endpoint paginado del backend).
   */
  getResidentsByCommunitiesPaged(communityIds: string[], page: number, pageSize: number): Observable<PagedResidentsResult> {
    if (!communityIds?.length) return of({ items: [], totalCount: 0, page: 1, pageSize, totalPages: 0 });
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    communityIds.forEach(id => { params = params.append('communityIds', id); });
    return this.http.get<PagedResultDtoBackend>(`${this.API_URL}/by-communities`, { params }).pipe(
      map(res => ({
        items: mapResidentDtosToResidentes(res.items),
        totalCount: res.totalCount,
        page: res.page,
        pageSize: res.pageSize,
        totalPages: res.totalPages
      })),
      catchError(error => {
        this.logger.error('Error loading residents', error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un residente por su ID (id del registro Resident en el backend).
   */
  getResidentById(id: string): Observable<Residente | null> {
    return this.http.get<ResidentDto>(`${this.API_URL}/${id}`).pipe(
      map(dto => mapDtoToResidente(dto)),
      catchError(error => {
        if (error.status === 404) return of(null);
        this.logger.error(`Error loading resident ${id}`, error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crea un residente (POST /api/residents).
   */
  createResident(dto: CreateResidentDto): Observable<Residente> {
    return this.http.post<ResidentDto>(this.API_URL, dto).pipe(
      map(dto => mapDtoToResidente(dto)),
      catchError(error => {
        this.logger.error('Error creating resident', error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Actualiza un residente (PUT /api/residents/:id).
   * Tras actualizar correctamente, invalida la caché para que la tabla se refresque.
   */
  updateResident(id: string, dto: UpdateResidentDto): Observable<Residente> {
    return this.http.put<ResidentDto>(`${this.API_URL}/${id}`, dto).pipe(
      map(dto => mapDtoToResidente(dto)),
      tap(() => this.invalidateResidentsCache()),
      catchError(error => {
        this.logger.error(`Error updating resident ${id}`, error, 'ResidentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Elimina un residente (DELETE /api/residents/:id).
   * Tras eliminar correctamente, invalida la caché para que la tabla se refresque.
   */
  deleteResident(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => this.invalidateResidentsCache()),
      catchError(error => {
        this.logger.error(`Error deleting resident ${id}`, error, 'ResidentsService');
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

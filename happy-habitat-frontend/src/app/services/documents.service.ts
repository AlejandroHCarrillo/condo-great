import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { Documento, CreateDocumentoDto, UpdateDocumentoDto, DocumentUploadResponse } from '../shared/interfaces/documento.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API_URL = `${environment.apiUrl}/documents`;

  getAll(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.API_URL).pipe(
      catchError((error) => {
        this.logger.error('Error fetching documents', error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  getByCommunityId(communityId?: string | null): Observable<Documento[]> {
    const url = communityId
      ? `${this.API_URL}/community/${communityId}`
      : `${this.API_URL}/community`;
    return this.http.get<Documento[]>(url).pipe(
      catchError((error) => {
        this.logger.error(`Error fetching documents for community ${communityId}`, error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  getById(id: string): Observable<Documento | null> {
    return this.http.get<Documento>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        if (error?.status === 404) return of(null);
        this.logger.error(`Error fetching document ${id}`, error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  create(dto: CreateDocumentoDto): Observable<Documento> {
    const body = {
      ...dto,
      communityId: dto.communityId || null,
      fecha: dto.fecha ? new Date(dto.fecha).toISOString() : new Date().toISOString()
    };
    return this.http.post<Documento>(this.API_URL, body).pipe(
      catchError((error) => {
        this.logger.error('Error creating document', error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  update(id: string, dto: UpdateDocumentoDto): Observable<Documento> {
    const body = {
      ...dto,
      communityId: dto.communityId || null,
      fecha: dto.fecha ? new Date(dto.fecha).toISOString() : new Date().toISOString()
    };
    return this.http.put<Documento>(`${this.API_URL}/${id}`, body).pipe(
      catchError((error) => {
        this.logger.error(`Error updating document ${id}`, error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError((error) => {
        this.logger.error(`Error deleting document ${id}`, error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sube un archivo al servidor. Path: communityId/categoria/residentId/nombreArchivo.ext
   * @param file Archivo a subir
   * @param communityId ID de la comunidad (requerido)
   * @param residentId ID del residente (opcional)
   * @param category Categoría del documento (opcional)
   */
  upload(
    file: File,
    communityId: string,
    residentId?: string | null,
    category?: string | null
  ): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('communityId', communityId);
    if (residentId != null && residentId !== '') formData.append('residentId', residentId);
    if (category != null && category !== '') formData.append('category', category);

    return this.http.post<DocumentUploadResponse>(`${this.API_URL}/upload`, formData).pipe(
      catchError((error) => {
        this.logger.error('Error uploading document', error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Descarga el archivo del documento por ID (endpoint protegido: admin de la comunidad o quien subió el archivo).
   * Usa el token de autenticación. Dispara la descarga en el navegador con el nombre indicado.
   */
  download(id: string, fileName?: string): Observable<void> {
    return this.http.get(`${this.API_URL}/${id}/download`, { responseType: 'blob', observe: 'response' }).pipe(
      tap((response) => {
        if (!response.body || !response.ok) {
          throw { status: response.status, message: response.statusText };
        }
        const url = URL.createObjectURL(response.body);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName?.trim() || 'documento';
        a.click();
        URL.revokeObjectURL(url);
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error(`Error downloading document ${id}`, error, 'DocumentsService');
        this.errorService.handleError(error);
        return throwError(() => (typeof error?.status === 'number' ? error : { status: error?.status, ...error }));
      })
    );
  }
}

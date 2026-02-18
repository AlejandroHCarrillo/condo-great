import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import type { DocumentUploadResponse } from '../shared/interfaces/documento.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API = `${environment.apiUrl}/file`;

  /**
   * Sube un archivo al servidor en la ruta relativa indicada.
   * @param file Archivo a subir
   * @param path Ruta relativa (ej. uploads/tickets/1/photo.jpg)
   */
  uploadFile(file: File, path: string): Observable<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    return this.http.post<DocumentUploadResponse>(`${this.API}/upload`, formData).pipe(
      catchError((err) => {
        this.logger.error('Error uploading file', err, 'FileService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

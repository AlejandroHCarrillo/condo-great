import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Servicio compartido para URLs de imágenes (rutas relativas del API) y nombres de archivo únicos.
 */
@Injectable({ providedIn: 'root' })
export class ImageUrlService {
  /**
   * Convierte una ruta relativa de imagen (ej. uploads/tickets/1/photo.jpg) en URL absoluta.
   * Si la ruta ya es http(s), se devuelve tal cual.
   */
  getImageUrl(relativePath: string): string {
    const path = (relativePath || '').trim().replace(/\\/g, '/');
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = (environment.apiUrl || '').replace(/\/api\/?$/, '');
    const pathNorm = path.replace(/^\/+/, '');
    return pathNorm ? `${base}/${pathNorm}` : '';
  }

  /**
   * Genera un nombre único para un archivo (guid + extensión original).
   */
  uniqueFileName(originalName: string): string {
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.jpg';
    const guid = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${guid}${ext}`;
  }

  /**
   * Devuelve las URLs de imágenes de un comentario (compatibles con API en camelCase o PascalCase).
   */
  getCommentImageUrls(comment: { imageUrls?: string[] | null; ImageUrls?: string[] }): string[] {
    const urls = comment.imageUrls ?? (comment as { ImageUrls?: string[] }).ImageUrls;
    return Array.isArray(urls) ? urls : [];
  }
}

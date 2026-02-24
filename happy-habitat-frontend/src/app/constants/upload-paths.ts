/** Prefijo base para todas las rutas de archivos subidos. */
export const UPLOAD_BASE = 'uploads/images';

/**
 * Ruta donde se guardan las imágenes/videos de un ticket.
 * Ejemplo: uploads/{communityId}/tickets/15
 */
export function ticketUploadPath(communityId: string, ticketId: number): string {
  return `${UPLOAD_BASE}/${communityId}/tickets/${ticketId}`;
}

/**
 * Ruta donde se guardan las imágenes/videos de los comentarios de un ticket.
 * Ejemplo: uploads/{communityId}/tickets/15/comentarios
 */
export function ticketCommentsUploadPath(communityId: string, ticketId: number): string {
  return `${UPLOAD_BASE}/${communityId}/tickets/${ticketId}/comentarios`;
}

/**
 * Ruta base para tickets de una comunidad (sin ticketId; se usa en el formulario de nuevo ticket).
 * Ejemplo: uploads/{communityId}/tickets
 */
export function ticketBasePath(communityId: string): string {
  return `${UPLOAD_BASE}/${communityId}/tickets`;
}

/** Fallback cuando no hay communityId (ej. residente). */
export function ticketBasePathFallback(): string {
  return `${UPLOAD_BASE}/tickets`;
}

/** Fallback para ruta de un ticket concreto cuando no hay communityId. */
export function ticketUploadPathFallback(ticketId: number): string {
  return `${UPLOAD_BASE}/tickets/${ticketId}`;
}

/**
 * Ruta donde se guarda la imagen de una amenidad.
 * Ejemplo: uploads/{communityId}/amenidades/unique-name.jpg
 */
export function amenidadImageUploadPath(communityId: string, filename: string): string {
  return `uploads/${communityId}/amenidades/${filename}`;
}

/**
 * Ruta donde se guarda la imagen de un comunicado.
 * Ejemplo: uploads/{communityId}/comunicados/unique-name.jpg
 */
export function comunicadoImageUploadPath(communityId: string, filename: string): string {
  return `uploads/${communityId}/comunicados/${filename}`;
}

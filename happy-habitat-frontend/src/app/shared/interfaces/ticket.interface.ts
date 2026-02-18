export interface CategoriaTicketDto {
  id: number;
  categoria: string;
}

export interface StatusTicketDto {
  id: number;
  code: string;
  descripcion: string;
  color: string;
}

export interface Ticket {
  id: number;
  communityId: string;
  communityName?: string | null;
  residentId: string;
  residentName?: string | null;
  /** Número de casa del residente. */
  residentNumber?: string | null;
  categoriaTicketId: number;
  categoriaTicketNombre?: string | null;
  statusId: number;
  statusCode?: string | null;
  statusDescripcion?: string | null;
  /** Color del estado (hex) para el badge. */
  statusColor?: string | null;
  contenido?: string | null;
  /** Rutas relativas de imágenes (ej. uploads/tickets/1/photo.jpg). */
  imageUrls?: string[] | null;
  fechaReporte: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateTicketDto {
  categoriaTicketId: number;
  contenido?: string;
  /** Cuando el usuario es ADMIN_COMPANY/SYSTEM_ADMIN, indica el residente a nombre del cual se crea el ticket. */
  residentId?: string;
  /** Cuando el usuario es ADMIN_COMPANY/SYSTEM_ADMIN, indica la comunidad del ticket (se usa la comunidad seleccionada). */
  communityId?: string;
}

export interface UpdateTicketDto {
  statusId?: number;
  contenido?: string;
  imageUrls?: string[];
}

export interface ComentarioDto {
  id: number;
  residentId: string;
  residentName?: string | null;
  origen: string;
  idOrigen: string;
  idComment?: number | null;
  comentarioTexto: string;
  /** Rutas relativas de imágenes del comentario. */
  imageUrls?: string[] | null;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateComentarioDto {
  origen: string;
  idOrigen: string;
  idComment?: number | null;
  comentarioTexto: string;
  /** Rutas relativas de imágenes (tras subirlas). */
  imageUrls?: string[];
}

export interface UpdateComentarioDto {
  comentarioTexto: string;
}

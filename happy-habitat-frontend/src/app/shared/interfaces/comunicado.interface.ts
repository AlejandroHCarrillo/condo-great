export interface Comunicado {
  id: string;
  communityId?: string | null;
  communityName?: string | null;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string; // Fecha en formato ISO string (serializada desde DateTime del backend)
  imagen?: string | null;
  createdAt?: string;
}

/** DTO para crear comunicado (POST /api/comunicados) */
export interface CreateComunicadoDto {
  communityId?: string | null;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string; // ISO date string
  imagen?: string | null;
}

/** DTO para actualizar comunicado (PUT /api/comunicados/:id) */
export interface UpdateComunicadoDto {
  communityId?: string | null;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string;
  imagen?: string | null;
}
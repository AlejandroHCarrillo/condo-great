export interface Documento {
  id: string;
  communityId?: string | null;
  communityName?: string | null;
  /** Usuario que subió el documento (para autorización de descarga). */
  userId?: string | null;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO string desde el backend
  userCreated: string;
  nombreDocumento: string;
  urlDoc: string;
  createdAt?: string;
}

export interface CreateDocumentoDto {
  communityId?: string | null;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO date string (YYYY-MM-DD o ISO completo)
  userCreated: string;
  nombreDocumento: string;
  urlDoc: string;
}

export interface UpdateDocumentoDto {
  communityId?: string | null;
  titulo: string;
  descripcion: string;
  fecha: string;
  userCreated: string;
  nombreDocumento: string;
  urlDoc: string;
}

/** Respuesta del endpoint POST api/documents/upload */
export interface DocumentUploadResponse {
  relativePath: string;
  originalFileName: string;
  fileSizeBytes: number;
}


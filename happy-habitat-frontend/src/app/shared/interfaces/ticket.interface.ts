export interface TipoReporteDto {
  id: number;
  tipo: string;
}

export interface StatusTicketDto {
  id: number;
  code: string;
  descripcion: string;
}

export interface Ticket {
  id: number;
  communityId: string;
  communityName?: string | null;
  residentId: string;
  residentName?: string | null;
  tipoReporteId: number;
  tipoReporteNombre?: string | null;
  statusId: number;
  statusCode?: string | null;
  statusDescripcion?: string | null;
  fechaReporte: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateTicketDto {
  tipoReporteId: number;
}

export interface UpdateTicketDto {
  statusId?: number;
}

export interface ComentarioDto {
  id: number;
  residentId: string;
  residentName?: string | null;
  origen: string;
  idOrigen: string;
  idComment?: number | null;
  comentarioTexto: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateComentarioDto {
  origen: string;
  idOrigen: string;
  idComment?: number | null;
  comentarioTexto: string;
}

export interface UpdateComentarioDto {
  comentarioTexto: string;
}

export interface Encuesta {
  id: string;
  communityId: string;
  communityName?: string | null;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CreateEncuestaDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive?: boolean;
}

export interface UpdateEncuestaDto {
  communityId: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
}

export interface ProveedorServicio {
  id: string;
  communityId?: string;
  communityName?: string;
  giro: string;
  nombre: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  paginaWeb?: string;
  rating?: number;
  totalCalificaciones?: number;
  isActive: boolean;
  createdAt?: string;
  createdByUserId?: string;
  updatedAt?: string;
  updatedByUserId?: string;
}

export interface CreateProveedorServicioDto {
  communityId: string;
  giro: string;
  nombre: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  paginaWeb?: string;
  rating?: number;
}

export interface UpdateProveedorServicioDto {
  communityId: string;
  giro: string;
  nombre: string;
  telefono?: string;
  email?: string;
  descripcion?: string;
  paginaWeb?: string;
  rating?: number;
}

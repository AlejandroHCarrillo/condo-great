import { tipoComunidadEnum } from "../../enums/tipo-comunidad.enum";

export interface Residente {
  id?: string;
  /** ID del registro Resident en el backend (para editar/eliminar). */
  residentId?: string;
  fullname: string;
  email?: string;
  phone?: string;
  number?: string;
  address: string;
  comunidades?: string[];
}

/** DTO del backend (GET /api/residents) */
export interface ResidentDto {
  id: string;
  userId: string;
  communityId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  number?: string;
  address: string;
  communityIds: string[];
  createdAt: string;
}

/** DTO para crear residente (POST /api/residents) */
export interface CreateResidentDto {
  userId: string;
  communityId?: string;
  fullName: string;
  email?: string;
  phone?: string;
  number?: string;
  address: string;
}

/** DTO para actualizar residente (PUT /api/residents/:id) */
export interface UpdateResidentDto {
  communityId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  number?: string;
  address?: string;
}

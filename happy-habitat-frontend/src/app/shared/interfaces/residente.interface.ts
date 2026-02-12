import { tipoComunidadEnum } from "../../enums/tipo-comunidad.enum";

export interface Residente {
  id?: string;
  fullname: string;
  email?: string;
  phone?: string;
  number?:string;
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

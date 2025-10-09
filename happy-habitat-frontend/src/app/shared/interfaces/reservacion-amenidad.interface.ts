import { ReservacionStatusEnum } from "../../enums/reservacion-status.enum";

export interface ReservacionAmenidad {
  id?: string;
  amenidadId: string;
  residenteId: string;
  numPersonas?: number;
  horario: Date;
  status?: ReservacionStatusEnum;
}

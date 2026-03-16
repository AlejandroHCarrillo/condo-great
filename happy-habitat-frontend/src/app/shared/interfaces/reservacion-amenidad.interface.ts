import { ReservacionStatusEnum } from "../../enums/reservacion-status.enum";

export interface ReservacionAmenidad {
  id?: string;
  amenidadId: string;
  residenteId: string;
  numPersonas?: number;
  /** Número de horas reservadas. */
  horasReservadas?: number | null;
  horario: Date | string;
  status?: ReservacionStatusEnum | string;
  /** Nombre de la amenidad (viene del API). */
  amenityName?: string;
  /** Nombre del residente (viene del API). */
  residentName?: string;
}

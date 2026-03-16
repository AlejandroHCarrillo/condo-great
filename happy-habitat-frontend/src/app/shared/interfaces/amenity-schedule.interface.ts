/**
 * Horario de una amenidad (un periodo por dia).
 * dayOfWeek: 1 = Lunes, 2 = Martes, ..., 7 = Domingo.
 * horaInicio / horaFin: formato "HH:mm" (24h).
 */
export interface AmenityScheduleDto {
  id: string;
  amenityId: string;
  dayOfWeek: number;
  horaInicio: string;
  horaFin: string;
  isOpen: boolean;
  nota: string;
}

export interface CreateAmenityScheduleDto {
  amenityId: string;
  dayOfWeek: number;
  horaInicio: string;
  horaFin: string;
  isOpen: boolean;
  nota: string;
}

export interface UpdateAmenityScheduleDto {
  dayOfWeek: number;
  horaInicio: string;
  horaFin: string;
  isOpen: boolean;
  nota: string;
}

export const DAY_OF_WEEK_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo'
};

export interface Amenidad {
  id: string;
  nombre: string;
  descripcion: string;
  reglas: string;
  costo?: number | null;
  fechaAlta: string; // ISO string from backend
  imagen?: string | null;
  communityId?: string | null;
  communityName?: string | null;
  capacidadMaxima?: number | null;
  numeroReservacionesSimultaneas?: number | null;
  /** Máximo de personas por reservación. */
  personasPorReservacion?: number | null;
  /** Máximo de horas por reservación. */
  horasPorReservacion?: number | null;
  requiereAprobacion?: boolean;
  createdAt?: string;
}

/** DTO para crear amenidad (POST /api/amenities) */
export interface CreateAmenityDto {
  nombre: string;
  descripcion: string;
  reglas: string;
  costo?: number | null;
  fechaAlta: string; // ISO date string (se asigna fecha del día en el frontend)
  imagen?: string | null;
  communityId: string;
  capacidadMaxima?: number | null;
  numeroReservacionesSimultaneas?: number | null;
  personasPorReservacion?: number | null;
  horasPorReservacion?: number | null;
  requiereAprobacion?: boolean;
  createdByUserId?: string | null;
}

/** DTO para actualizar amenidad (PUT /api/amenities/:id) */
export interface UpdateAmenityDto {
  nombre: string;
  descripcion: string;
  reglas: string;
  costo?: number | null;
  fechaAlta: string;
  imagen?: string | null;
  communityId: string;
  capacidadMaxima?: number | null;
  numeroReservacionesSimultaneas?: number | null;
  personasPorReservacion?: number | null;
  horasPorReservacion?: number | null;
  requiereAprobacion?: boolean;
}
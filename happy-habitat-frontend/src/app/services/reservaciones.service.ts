import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { ReservacionAmenidad } from '../shared/interfaces/reservacion-amenidad.interface';

/** Respuesta del API de reservaciones. */
export interface AmenityReservationDto {
  id: string;
  amenityId: string;
  amenityName: string;
  residentId: string;
  residentName: string;
  horario: string;
  numPersonas?: number;
  horasReservadas?: number | null;
  status: string;
}

/** Payload para crear una reservación (residente). */
export interface CreateAmenityReservationPayload {
  amenityId: string;
  horario: string;
  numPersonas: number;
  horasReservadas: number;
}

/** Resultado de crear reservación: creada o mensaje de error del API. */
export interface CreateReservationResult {
  created: ReservacionAmenidad | null;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservacionesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/amenityreservations`;

  /** Obtiene las reservaciones del residente logueado. */
  getMy(): Observable<ReservacionAmenidad[]> {
    return this.http.get<AmenityReservationDto[]>(`${this.API_URL}/my`).pipe(
      catchError(() => of([])),
      map((dtos) => dtos.map((d) => this.mapDtoToReservacion(d)))
    );
  }

  /** Crea una reservación (residente). El backend asigna residentId desde el token y valida capacidad/reservaciones simultáneas. */
  create(payload: CreateAmenityReservationPayload): Observable<CreateReservationResult> {
    return this.http.post<AmenityReservationDto>(this.API_URL, payload).pipe(
      map((d) => ({ created: this.mapDtoToReservacion(d) })),
      catchError((err) => {
        const message = err?.error?.message ?? 'No se pudo crear la reservación.';
        return of({ created: null, error: message });
      })
    );
  }

  /** Cancela una reservación propia (residente). */
  cancel(id: string): Observable<ReservacionAmenidad | null> {
    return this.http.patch<AmenityReservationDto>(`${this.API_URL}/${id}/cancel`, {}).pipe(
      map((d) => this.mapDtoToReservacion(d)),
      catchError(() => of(null))
    );
  }

  getByCommunityId(communityId: string): Observable<ReservacionAmenidad[]> {
    return this.http.get<AmenityReservationDto[]>(`${this.API_URL}/community/${communityId}`).pipe(
      catchError(() => of([])),
      map((dtos) => dtos.map((d) => this.mapDtoToReservacion(d)))
    );
  }

  approve(id: string): Observable<ReservacionAmenidad | null> {
    return this.updateStatus(id, 'Reservada');
  }

  updateStatus(id: string, status: string): Observable<ReservacionAmenidad | null> {
    return this.http.patch<AmenityReservationDto>(`${this.API_URL}/${id}/status`, { status }).pipe(
      map((d) => this.mapDtoToReservacion(d)),
      catchError(() => of(null))
    );
  }

  private mapDtoToReservacion(d: AmenityReservationDto): ReservacionAmenidad {
    return {
      id: d.id,
      amenidadId: d.amenityId,
      residenteId: d.residentId,
      numPersonas: d.numPersonas,
      horasReservadas: d.horasReservadas ?? undefined,
      horario: d.horario,
      status: d.status,
      amenityName: d.amenityName,
      residentName: d.residentName
    };
  }
}

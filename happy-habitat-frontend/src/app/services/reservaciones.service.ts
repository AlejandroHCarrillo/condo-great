import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { ReservacionAmenidad } from '../shared/interfaces/reservacion-amenidad.interface';

/** Respuesta del API de reservaciones por comunidad. */
export interface AmenityReservationDto {
  id: string;
  amenityId: string;
  amenityName: string;
  residentId: string;
  residentName: string;
  horario: string;
  numPersonas?: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservacionesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/amenityreservations`;

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
      horario: d.horario,
      status: d.status,
      amenityName: d.amenityName,
      residentName: d.residentName
    };
  }
}

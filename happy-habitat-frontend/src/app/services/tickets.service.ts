import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Ticket,
  CategoriaTicketDto,
  StatusTicketDto,
  ComentarioDto,
  CreateTicketDto,
  UpdateTicketDto,
  CreateComentarioDto,
  UpdateComentarioDto
} from '../shared/interfaces/ticket.interface';
import { LoggerService } from './logger.service';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private errorService = inject(ErrorService);

  private readonly API = `${environment.apiUrl}/tickets`;
  private readonly CATEGORIAS = `${environment.apiUrl}/categoriaticket`;
  private readonly STATUS = `${environment.apiUrl}/statusticket`;
  private readonly COMENTARIOS = `${environment.apiUrl}/comentarios`;

  getCategoriasTicket(): Observable<CategoriaTicketDto[]> {
    return this.http.get<CategoriaTicketDto[]>(this.CATEGORIAS).pipe(
      catchError((err) => {
        this.logger.error('Error fetching categorías ticket', err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getStatusTickets(): Observable<StatusTicketDto[]> {
    return this.http.get<StatusTicketDto[]>(this.STATUS).pipe(
      catchError((err) => {
        this.logger.error('Error fetching status tickets', err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getByCommunityId(communityId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.API}/community/${communityId}`).pipe(
      catchError((err) => {
        this.logger.error(`Error fetching tickets for community ${communityId}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  /** Tickets creados por el residente asociado al usuario logueado. */
  getMy(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.API}/my`).pipe(
      catchError((err) => {
        this.logger.error('Error fetching my tickets', err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getById(id: number): Observable<Ticket | null> {
    return this.http.get<Ticket>(`${this.API}/${id}`).pipe(
      catchError((err) => {
        if (err?.status === 404) return of(null);
        this.logger.error(`Error fetching ticket ${id}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  createTicket(dto: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.API, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating ticket', err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  updateTicket(id: number, dto: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.API}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating ticket ${id}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteTicket(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting ticket ${id}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  getComentariosByOrigen(origen: string, idOrigen: string): Observable<ComentarioDto[]> {
    return this.http.get<ComentarioDto[]>(`${this.COMENTARIOS}/origen/${encodeURIComponent(origen)}/${encodeURIComponent(idOrigen)}`).pipe(
      catchError((err) => {
        this.logger.error(`Error fetching comentarios ${origen}/${idOrigen}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  createComentario(dto: CreateComentarioDto): Observable<ComentarioDto> {
    return this.http.post<ComentarioDto>(this.COMENTARIOS, dto).pipe(
      catchError((err) => {
        this.logger.error('Error creating comentario', err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  updateComentario(id: number, dto: UpdateComentarioDto): Observable<ComentarioDto> {
    return this.http.put<ComentarioDto>(`${this.COMENTARIOS}/${id}`, dto).pipe(
      catchError((err) => {
        this.logger.error(`Error updating comentario ${id}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }

  deleteComentario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.COMENTARIOS}/${id}`).pipe(
      catchError((err) => {
        this.logger.error(`Error deleting comentario ${id}`, err, 'TicketsService');
        this.errorService.handleError(err);
        return throwError(() => err);
      })
    );
  }
}

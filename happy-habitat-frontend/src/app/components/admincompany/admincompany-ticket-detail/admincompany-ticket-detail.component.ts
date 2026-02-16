import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketsService } from '../../../services/tickets.service';
import { Ticket } from '../../../shared/interfaces/ticket.interface';
import { StatusTicketDto } from '../../../shared/interfaces/ticket.interface';
import { ComentarioDto } from '../../../shared/interfaces/ticket.interface';

@Component({
  selector: 'hh-admincompany-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admincompany-ticket-detail.component.html'
})
export class AdmincompanyTicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);

  ticket = signal<Ticket | null>(null);
  statusList = signal<StatusTicketDto[]>([]);
  comentarios = signal<ComentarioDto[]>([]);
  isLoading = signal(true);
  isSavingStatus = signal(false);
  isSavingComment = signal(false);
  errorMessage = signal<string | null>(null);
  nuevoComentario = signal('');

  ticketId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  ngOnInit(): void {
    const id = this.ticketId();
    if (id) {
      this.loadTicket(id);
      this.loadComentarios(id);
    }
    this.ticketsService.getStatusTickets().subscribe({
      next: (list) => this.statusList.set(list),
      error: () => {}
    });
  }

  loadTicket(id: number): void {
    this.isLoading.set(true);
    this.ticketsService.getById(id).subscribe({
      next: (item) => {
        this.ticket.set(item ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/residentes/tickets']);
      }
    });
  }

  loadComentarios(ticketId: number): void {
    this.ticketsService.getComentariosByOrigen('Ticket', String(ticketId)).subscribe({
      next: (list) => this.comentarios.set(list),
      error: () => this.comentarios.set([])
    });
  }

  onStatusChange(newStatusId: number): void {
    const id = this.ticketId();
    if (id == null) return;
    this.isSavingStatus.set(true);
    this.errorMessage.set(null);
    this.ticketsService.updateTicket(id, { statusId: newStatusId }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.isSavingStatus.set(false);
      },
      error: () => {
        this.isSavingStatus.set(false);
        this.errorMessage.set('No se pudo actualizar el estado.');
      }
    });
  }

  submitComentario(): void {
    const texto = this.nuevoComentario().trim();
    if (!texto) return;
    const id = this.ticketId();
    if (id == null) return;
    this.isSavingComment.set(true);
    this.errorMessage.set(null);
    this.ticketsService.createComentario({
      origen: 'Ticket',
      idOrigen: String(id),
      comentarioTexto: texto
    }).subscribe({
      next: () => {
        this.nuevoComentario.set('');
        this.loadComentarios(id);
        this.isSavingComment.set(false);
      },
      error: () => {
        this.isSavingComment.set(false);
        this.errorMessage.set('No se pudo agregar el comentario.');
      }
    });
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString('es');
    } catch {
      return value;
    }
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    this.router.navigate(['/admincompany/residentes/tickets'], {
      queryParams: comunidadId ? { comunidad: comunidadId } : {}
    });
  }
}

import { Component, input, output, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservacionesService } from '../../../../services/reservaciones.service';
import { AuthService } from '../../../../services/auth.service';
import type { ReservacionAmenidad } from '../../../../shared/interfaces/reservacion-amenidad.interface';
import type { Amenidad } from '../../../../shared/interfaces/amenidad.interface';

/** Opciones del select de estado para el administrador */
const OPCIONES_ESTADO = [
  { value: 'Reservada', label: 'Aprobar' },
  { value: 'Rechazada', label: 'Rechazar' },
  { value: 'Cancelada', label: 'Cancelar' }
] as const;

@Component({
  selector: 'hh-reservacion-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservacion-detail.component.html'
})
export class ReservacionDetailComponent {
  private reservacionesService = inject(ReservacionesService);
  private authService = inject(AuthService);

  reservacion = input.required<ReservacionAmenidad>();
  amenidad = input<Amenidad | null>(null);

  closed = output<void>();
  approved = output<ReservacionAmenidad>();
  statusUpdated = output<ReservacionAmenidad>();

  readonly opcionesEstado = OPCIONES_ESTADO;
  selectedStatus = signal<string>('');
  isUpdating = signal(false);
  statusError = '';

  constructor() {
    effect(() => {
      const r = this.reservacion();
      this.selectedStatus.set((r?.status ?? '').toString());
    });
  }

  get isCompanyAdmin(): boolean {
    return this.authService.hasAnyRole(['ADMIN_COMPANY', 'SYSTEM_ADMIN']);
  }

  get requiereAprobacion(): boolean {
    return this.amenidad()?.requiereAprobacion === true;
  }

  formatFecha(horario: Date | string | undefined): string {
    if (!horario) return '—';
    const d = typeof horario === 'string' ? new Date(horario) : horario;
    return d.toLocaleDateString('es-MX', { dateStyle: 'medium' }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  /** Clase del badge según estado: en proceso amarillo, reservada verde, cancelada gris, rechazada verde */
  getStatusBadgeClass(status?: string | null): string {
    const s = (status ?? '').toString().toLowerCase();
    if (s === 'en proceso' || s === 'pendiente') return 'badge badge-warning';
    if (s === 'reservada') return 'badge badge-success';
    if (s === 'cancelada') return 'badge badge-ghost';
    if (s === 'rechazada') return 'badge badge-success';
    return 'badge badge-ghost';
  }

  cerrar(): void {
    this.closed.emit();
  }

  onStatusChange(nuevoStatus: string): void {
    const r = this.reservacion();
    if (!r?.id || !nuevoStatus) return;
    const actual = (r.status ?? '').toString();
    if (actual === nuevoStatus) return;

    this.statusError = '';
    this.isUpdating.set(true);
    this.reservacionesService.updateStatus(r.id, nuevoStatus).subscribe({
      next: (updated) => {
        this.isUpdating.set(false);
        if (updated) {
          this.selectedStatus.set(updated.status ?? nuevoStatus);
          this.statusUpdated.emit(updated);
          this.approved.emit(updated);
          this.closed.emit();
        } else {
          this.statusError = 'No se pudo actualizar el estado.';
        }
      },
      error: () => {
        this.isUpdating.set(false);
        this.statusError = 'Error al actualizar. Intente de nuevo.';
      }
    });
  }
}

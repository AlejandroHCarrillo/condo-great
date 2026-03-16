import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReservacionesService } from '../../../services/reservaciones.service';
import { AmenidadesService } from '../../../services/amenidades.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { ReservacionDetailComponent } from './reservacion-detail/reservacion-detail.component';
import type { ReservacionAmenidad } from '../../../shared/interfaces/reservacion-amenidad.interface';
import type { Amenidad } from '../../../shared/interfaces/amenidad.interface';
import { ReservacionStatusEnum } from '../../../enums/reservacion-status.enum';

@Component({
  selector: 'hh-admincompany-reservaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, CommunityFilterComponent, ReservacionDetailComponent],
  templateUrl: './reservaciones-list.component.html'
})
export class ReservacionesListComponent implements OnInit {
  private authService = inject(AuthService);
  private reservacionesService = inject(ReservacionesService);
  private amenidadesService = inject(AmenidadesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  selectedAmenidadId = signal<string>('');
  reservaciones = signal<ReservacionAmenidad[]>([]);
  amenidades = signal<Amenidad[]>([]);
  isLoading = signal(false);
  selectedReservacion = signal<ReservacionAmenidad | null>(null);
  selectedAmenidad = signal<Amenidad | null>(null);
  private detailModalId = 'reservacionDetailModal';

  comunidadesAsociadas = computed(
    () => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]
  );

  reservacionesFiltradas = computed(() => {
    const list = this.reservaciones();
    const amenidadId = this.selectedAmenidadId();
    if (!amenidadId) return list;
    return list.filter((r) => r.amenidadId === amenidadId);
  });

  constructor() {
    effect(() => {
      const communityId = this.selectedComunidadId();
      if (communityId) {
        this.loadReservacionesForCommunity(communityId);
        this.loadAmenidadesForCommunity(communityId);
      } else {
        this.reservaciones.set([]);
        this.amenidades.set([]);
        this.selectedAmenidadId.set('');
      }
    });
  }

  ngOnInit(): void {
    const initial = this.route.snapshot.queryParams['comunidad'];
    if (initial) this.selectedComunidadId.set(initial);
    this.route.queryParams.subscribe((params) => {
      this.selectedComunidadId.set(params['comunidad'] ?? '');
    });
  }

  onComunidadChange(comunidadId: string): void {
    this.selectedComunidadId.set(comunidadId);
    this.selectedAmenidadId.set('');
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  onAmenidadFilterChange(amenidadId: string): void {
    this.selectedAmenidadId.set(amenidadId ?? '');
  }

  private loadReservacionesForCommunity(communityId: string): void {
    this.isLoading.set(true);
    this.reservacionesService.getByCommunityId(communityId).subscribe((list) => {
      this.reservaciones.set(list);
      this.isLoading.set(false);
    });
  }

  private loadAmenidadesForCommunity(communityId: string): void {
    this.amenidadesService.getAmenitiesByCommunityId(communityId).subscribe((list) => {
      this.amenidades.set(list ?? []);
    });
  }

  getAmenidadNombre(r: ReservacionAmenidad): string {
    return r.amenityName ?? '—';
  }

  getResidenteNombre(r: ReservacionAmenidad): string {
    return r.residentName ?? '—';
  }

  formatFecha(horario: Date | string): string {
    if (!horario) return '—';
    const d = typeof horario === 'string' ? new Date(horario) : horario;
    return d.toLocaleDateString('es-MX', { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  getStatusLabel(status?: ReservacionStatusEnum | string | null): string {
    if (!status) return '—';
    return typeof status === 'string' ? status : (status as ReservacionStatusEnum);
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

  openDetail(reservacion: ReservacionAmenidad): void {
    const amenidad = this.amenidades().find((a) => a.id === reservacion.amenidadId) ?? null;
    this.selectedReservacion.set(reservacion);
    this.selectedAmenidad.set(amenidad);
    (document.getElementById(this.detailModalId) as HTMLDialogElement)?.showModal();
  }

  closeDetail(): void {
    this.selectedReservacion.set(null);
    this.selectedAmenidad.set(null);
    (document.getElementById(this.detailModalId) as HTMLDialogElement)?.close();
  }

  onReservacionStatusUpdated(): void {
    const communityId = this.selectedComunidadId();
    if (communityId) this.loadReservacionesForCommunity(communityId);
    this.closeDetail();
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProveedorServicioService } from '../../../services/proveedor-servicio.service';
import { AuthService } from '../../../services/auth.service';
import type { ProveedorServicio } from '../../../shared/interfaces/proveedor-servicio.interface';

@Component({
  selector: 'hh-directorio-servicios-resident',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './directorio-servicios-resident.component.html'
})
export class DirectorioServiciosResidentComponent {
  private service = inject(ProveedorServicioService);
  private authService = inject(AuthService);

  list = signal<ProveedorServicio[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  ratingInProgress = signal<string | null>(null);

  communityId = computed(() => {
    const user = this.authService.currentUser();
    return user?.communities?.length ? user.communities[0].id : null;
  });

  groupedByGiro = computed(() => {
    const items = this.list();
    const map = new Map<string, ProveedorServicio[]>();
    for (const p of items) {
      const giro = p.giro || 'Otros';
      if (!map.has(giro)) map.set(giro, []);
      map.get(giro)!.push(p);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  });

  constructor() {
    const cid = this.communityId();
    if (cid) {
      this.service.getByCommunityId(cid).subscribe({
        next: (data) => { this.list.set(data); this.isLoading.set(false); },
        error: () => { this.errorMessage.set('No se pudo cargar el directorio.'); this.isLoading.set(false); }
      });
    } else {
      this.errorMessage.set('No tienes una comunidad asignada.');
      this.isLoading.set(false);
    }
  }

  getRatingStars(rating: number | null | undefined): { full: number; half: boolean } {
    if (rating == null || rating < 0) return { full: 0, half: false };
    const clamped = Math.min(5, Math.max(0, rating));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5;
    return { full, half };
  }

  calificar(item: ProveedorServicio, puntuacion: number): void {
    if (this.ratingInProgress()) return;
    this.ratingInProgress.set(item.id);
    this.service.calificar(item.id, puntuacion).subscribe({
      next: (updated) => {
        this.list.update((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        this.ratingInProgress.set(null);
      },
      error: () => this.ratingInProgress.set(null)
    });
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProveedorServicioService } from '../../../services/proveedor-servicio.service';
import type { ProveedorServicio } from '../../../shared/interfaces/proveedor-servicio.interface';

@Component({
  selector: 'hh-proveedor-servicio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proveedor-servicio-detail.component.html'
})
export class ProveedorServicioDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(ProveedorServicioService);

  item = signal<ProveedorServicio | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadItem(id);
      }
    });
  }

  loadItem(id: string): void {
    this.isLoading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.item.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/proveedores-servicios']);
      }
    });
  }

  getRatingStars(rating: number | null | undefined): { full: number; half: boolean } {
    if (rating == null || rating < 0) return { full: 0, half: false };
    const clamped = Math.min(5, Math.max(0, rating));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5;
    return { full, half };
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/proveedores-servicios'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/proveedores-servicios']);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AmenidadesService } from '../../../services/amenidades.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { Amenidad } from '../../../shared/interfaces/amenidad.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-amenidad-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './amenidad-detail.component.html'
})
export class AmenidadDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private amenidadesService = inject(AmenidadesService);
  private authService = inject(AuthService);
  private imageUrlService = inject(ImageUrlService);

  amenidad = signal<Amenidad | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadAmenidad(id);
      }
    });
  }

  loadAmenidad(id: string): void {
    this.isLoading.set(true);
    this.amenidadesService.getAmenityById(id).subscribe({
      next: (item) => {
        this.amenidad.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/amenidades']);
      }
    });
  }

  getComunidadNombre(amenidad: Amenidad): string {
    return amenidad.communityName ?? this.authService.currentUser()?.communities?.find(c => c.id === amenidad.communityId)?.nombre ?? 'Sin comunidad';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    try {
      const d = new Date(fecha);
      return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fecha;
    }
  }

  formatCosto(costo: number | null | undefined): string {
    if (costo == null) return '-';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(costo);
  }

  getImagenUrl(relativePath: string | null | undefined): string {
    if (!relativePath?.trim()) return '';
    return this.imageUrlService.getImageUrl(relativePath);
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/amenidades'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/amenidades']);
    }
  }
}

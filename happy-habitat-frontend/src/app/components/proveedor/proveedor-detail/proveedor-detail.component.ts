import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommunityProvidersService } from '../../../services/community-providers.service';
import { CommunityProvider } from '../../../shared/interfaces/community-provider.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-proveedor-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proveedor-detail.component.html'
})
export class ProveedorDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providersService = inject(CommunityProvidersService);
  private authService = inject(AuthService);

  provider = signal<CommunityProvider | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProvider(id);
      }
    });
  }

  loadProvider(id: string): void {
    this.isLoading.set(true);
    this.providersService.getById(id).subscribe({
      next: (item) => {
        this.provider.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/proveedores']);
      }
    });
  }

  getComunidadNombre(provider: CommunityProvider): string {
    return (
      provider.communityName ??
      this.authService.currentUser()?.communities?.find((c) => c.id === provider.communityId)?.nombre ??
      'Sin comunidad'
    );
  }

  /** Teléfono en formato XXXX-XX-XXXX. */
  formatPhone(phone: string | null | undefined): string {
    if (phone == null || phone === '') return '—';
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 10)}`;
    }
    return phone;
  }

  /** Calificación: estrellas llenas y media. */
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
      this.router.navigate(['/admincompany/proveedores'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/proveedores']);
    }
  }
}

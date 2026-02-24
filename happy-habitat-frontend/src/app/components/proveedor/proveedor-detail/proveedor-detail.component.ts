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

  formatRating(rating: number | null | undefined): string {
    if (rating == null) return '-';
    return rating.toFixed(1);
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

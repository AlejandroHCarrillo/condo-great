import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommunityPricesService } from '../../../services/community-prices.service';
import { CommunityPrice } from '../../../shared/interfaces/community-price.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-precio-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './precio-detail.component.html'
})
export class PrecioDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pricesService = inject(CommunityPricesService);
  private authService = inject(AuthService);

  price = signal<CommunityPrice | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadPrice(id);
      }
    });
  }

  loadPrice(id: string): void {
    this.isLoading.set(true);
    this.pricesService.getById(id).subscribe({
      next: (item) => {
        this.price.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/precios']);
      }
    });
  }

  getComunidadNombre(p: CommunityPrice): string {
    return (
      p.communityName ??
      this.authService.currentUser()?.communities?.find((com) => com.id === p.communityId)?.nombre ??
      'Sin comunidad'
    );
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/precios'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/precios']);
    }
  }
}

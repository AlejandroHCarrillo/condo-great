import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';

@Component({
  selector: 'hh-resident-pago-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resident-pago-detail.component.html'
})
export class ResidentPagoDetailComponent {
  route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagosService = inject(PagosResidenteService);
  private imageUrlService = inject(ImageUrlService);

  pago = signal<PagosResidente | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.loadPago(id);
    });
  }

  loadPago(id: string): void {
    this.isLoading.set(true);
    this.pagosService.getById(id).subscribe({
      next: (item) => {
        this.pago.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/resident/pagos']);
      }
    });
  }

  formatDate(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { dateStyle: 'medium' });
  }

  getComprobanteUrl(url: string | null | undefined): string {
    if (!url?.trim()) return '';
    return this.imageUrlService.getImageUrl(url);
  }

  goBack(): void {
    this.router.navigate(['/resident/pagos']);
  }
}

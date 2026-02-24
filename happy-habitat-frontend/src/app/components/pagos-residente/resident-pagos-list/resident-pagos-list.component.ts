import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '../../../utils/rx-resource.util';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';

@Component({
  selector: 'hh-resident-pagos-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './resident-pagos-list.component.html'
})
export class ResidentPagosListComponent {
  private pagosService = inject(PagosResidenteService);
  private imageUrlService = inject(ImageUrlService);
  private router = inject(Router);

  private pagosResource = rxResource({
    request: () => ({}),
    loader: () => this.pagosService.getMy()
  });

  pagos = computed(() => this.pagosResource.value() ?? []);
  isLoading = computed(() => this.pagosResource.isLoading());

  formatDate(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { dateStyle: 'short' });
  }

  getComprobanteUrl(url: string | null | undefined): string {
    if (!url?.trim()) return '';
    return this.imageUrlService.getImageUrl(url);
  }

  viewDetail(pago: PagosResidente): void {
    if (pago?.id) {
      this.router.navigate(['/resident', 'pagos', pago.id]);
    }
  }
}

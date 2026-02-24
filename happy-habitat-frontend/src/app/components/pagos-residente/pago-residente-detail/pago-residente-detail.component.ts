import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';

@Component({
  selector: 'hh-pago-residente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-residente-detail.component.html'
})
export class PagoResidenteDetailComponent {
  route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagosService = inject(PagosResidenteService);

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
        this.router.navigate(['/admincompany/pagos-residente']);
      }
    });
  }

  formatDate(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { dateStyle: 'medium' });
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    const residenteId = this.route.snapshot.queryParams['residente'];
    const q: { comunidad?: string; residente?: string } = {};
    if (comunidadId) q.comunidad = comunidadId;
    if (residenteId) q.residente = residenteId;
    this.router.navigate(['/admincompany/pagos-residente'], Object.keys(q).length ? { queryParams: q } : {});
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CargosResidenteService } from '../../../services/cargos-residente.service';
import { AuthService } from '../../../services/auth.service';
import { CargoResidente } from '../../../shared/interfaces/cargo-residente.interface';
import { RolesEnum } from '../../../enums/roles.enum';

@Component({
  selector: 'hh-cargo-residente-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cargo-residente-detail.component.html'
})
export class CargoResidenteDetailComponent {
  route = inject(ActivatedRoute);
  private router = inject(Router);
  private cargosService = inject(CargosResidenteService);
  private authService = inject(AuthService);

  cargo = signal<CargoResidente | null>(null);
  isLoading = signal<boolean>(true);

  isAdminCompany = computed(() => this.authService.currentUser()?.selectedRole === RolesEnum.ADMIN_COMPANY);

  canShowGenerarPago = computed(() => {
    const c = this.cargo();
    if (!c || !this.isAdminCompany()) return false;
    return c.estatus !== 'Pagado' && c.estatus !== 'Cancelado';
  });

  constructor() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) this.loadCargo(id);
    });
  }

  loadCargo(id: string): void {
    this.isLoading.set(true);
    this.cargosService.getById(id).subscribe({
      next: (item) => {
        this.cargo.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/cargos-residente']);
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
    this.router.navigate(['/admincompany/cargos-residente'], Object.keys(q).length ? { queryParams: q } : {});
  }
}

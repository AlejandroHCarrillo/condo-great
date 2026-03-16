import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommunityProvidersService } from '../../../../services/community-providers.service';
import { CommunityFilterComponent } from '../../../../shared/components/community-filter/community-filter.component';
import { ReportPeriodFilterComponent } from '../../../../shared/components/report-period-filter/report-period-filter.component';
import type { CommunityProvider } from '../../../../shared/interfaces/community-provider.interface';
import { REPORT_PERIOD_OPTIONS, type ReportPeriodKey } from '../../../../shared/data/report-period.data';

@Component({
  selector: 'hh-reportes-pago-proveedores',
  standalone: true,
  imports: [CommonModule, RouterLink, CommunityFilterComponent, ReportPeriodFilterComponent],
  templateUrl: './reportes-pago-proveedores.component.html'
})
export class ReportesPagoProveedoresComponent implements OnInit {
  private authService = inject(AuthService);
  private providersService = inject(CommunityProvidersService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  selectedPeriod = signal<ReportPeriodKey>('este_anio');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  providers = signal<CommunityProvider[]>([]);

  comunidadesAsociadas = computed(() => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]);

  ngOnInit(): void {
    const initial = this.route.snapshot.queryParams['comunidad'];
    if (initial) this.selectedComunidadId.set(initial);
    const periodo = this.route.snapshot.queryParams['periodo'] as ReportPeriodKey | undefined;
    if (periodo && REPORT_PERIOD_OPTIONS.some((o) => o.value === periodo)) this.selectedPeriod.set(periodo);
    this.route.queryParams.subscribe((params) => {
      this.selectedComunidadId.set(params['comunidad'] ?? '');
      const p = params['periodo'] as ReportPeriodKey | undefined;
      if (p && REPORT_PERIOD_OPTIONS.some((o) => o.value === p)) this.selectedPeriod.set(p);
    });
    const q = this.route.snapshot.queryParams['comunidad'] ?? this.selectedComunidadId();
    if (q) this.load(q);
  }

  onComunidadChange(comunidadId: string): void {
    this.selectedComunidadId.set(comunidadId);
    if (comunidadId) this.load(comunidadId);
    else this.providers.set([]);
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  onPeriodChange(period: ReportPeriodKey): void {
    this.selectedPeriod.set(period);
    this.router.navigate([], { queryParams: { periodo: period }, queryParamsHandling: 'merge' });
  }

  private load(communityId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.providersService.getByCommunityId(communityId).subscribe({
      next: (list) => { this.providers.set(list); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar proveedores.'); this.isLoading.set(false); }
    });
  }
}

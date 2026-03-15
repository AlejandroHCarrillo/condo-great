import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { DashboardService } from '../../../../services/dashboard.service';
import { CommunityFilterComponent } from '../../../../shared/components/community-filter/community-filter.component';
import { ReportPeriodFilterComponent } from '../../../../shared/components/report-period-filter/report-period-filter.component';
import type { DashboardDto, MontoPorMesDto } from '../../../../shared/interfaces/dashboard.interface';
import { REPORT_PERIOD_OPTIONS, getYearForPeriod, type ReportPeriodKey } from '../../../../shared/data/report-period.data';

@Component({
  selector: 'hh-reportes-gastos',
  standalone: true,
  imports: [CommonModule, CommunityFilterComponent, ReportPeriodFilterComponent],
  templateUrl: './reportes-gastos.component.html'
})
export class ReportesGastosComponent implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  selectedPeriod = signal<ReportPeriodKey>('este_anio');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  data = signal<DashboardDto | null>(null);

  comunidadesAsociadas = computed(() => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]);

  selectedYear = computed(() => getYearForPeriod(this.selectedPeriod()));

  private filterByYear(items: MontoPorMesDto[] | null | undefined, year: number): MontoPorMesDto[] {
    const list = items ?? [];
    const y = Number(year);
    return list.filter((m) => Number(m.anio) === y);
  }

  filteredGastos = computed(() => {
    const d = this.data();
    return d ? this.filterByYear(d.gastosMensuales, this.selectedYear()) : [];
  });

  isCurrentYear = computed(() => this.selectedYear() === new Date().getFullYear());

  egresosDisplay = computed(() => {
    const d = this.data();
    if (!d) return 0;
    if (this.isCurrentYear()) return d.egresosDelMes;
    return this.filteredGastos().reduce((s, m) => s + m.total, 0);
  });

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
    else this.data.set(null);
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  onPeriodChange(period: ReportPeriodKey): void {
    this.selectedPeriod.set(period);
    this.router.navigate([], { queryParams: { periodo: period }, queryParamsHandling: 'merge' });
  }

  private load(communityId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dashboardService.getDashboard(communityId, 12).subscribe({
      next: (d) => { this.data.set(d); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar datos.'); this.isLoading.set(false); }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  }

  monthLabel(d: { anio: number; mes: number }): string {
    return new Date(d.anio, d.mes - 1, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { TicketsService } from '../../../../services/tickets.service';
import { CommunityFilterComponent } from '../../../../shared/components/community-filter/community-filter.component';
import { ReportPeriodFilterComponent } from '../../../../shared/components/report-period-filter/report-period-filter.component';
import type { Ticket } from '../../../../shared/interfaces/ticket.interface';
import { REPORT_PERIOD_OPTIONS, getYearForPeriod, type ReportPeriodKey } from '../../../../shared/data/report-period.data';

@Component({
  selector: 'hh-reportes-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink, CommunityFilterComponent, ReportPeriodFilterComponent],
  templateUrl: './reportes-tickets.component.html'
})
export class ReportesTicketsComponent implements OnInit {
  private authService = inject(AuthService);
  private ticketsService = inject(TicketsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  selectedPeriod = signal<ReportPeriodKey>('este_anio');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  tickets = signal<Ticket[]>([]);

  comunidadesAsociadas = computed(() => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]);

  selectedYear = computed(() => getYearForPeriod(this.selectedPeriod()));

  filteredTickets = computed(() => {
    const list = this.tickets();
    const year = this.selectedYear();
    return list.filter((t) => {
      const dateStr = t.fechaReporte ?? t.createdAt;
      if (!dateStr) return false;
      return new Date(dateStr).getFullYear() === year;
    });
  });

  ticketsPorEstado = computed(() => {
    const list = this.filteredTickets();
    const map = new Map<string, number>();
    for (const t of list) {
      const key = t.statusDescripcion ?? t.statusCode ?? 'Sin estado';
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
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
    else this.tickets.set([]);
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  onPeriodChange(period: ReportPeriodKey): void {
    this.selectedPeriod.set(period);
    this.router.navigate([], { queryParams: { periodo: period }, queryParamsHandling: 'merge' });
  }

  private load(communityId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.ticketsService.getByCommunityId(communityId).subscribe({
      next: (list) => { this.tickets.set(list); this.isLoading.set(false); },
      error: () => { this.errorMessage.set('Error al cargar tickets.'); this.isLoading.set(false); }
    });
  }

  formatDate(s: string | undefined): string {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('es-MX', { dateStyle: 'short' });
  }
}

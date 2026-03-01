import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { BarChartComponent } from '../../shared/charts/bar-chart.component';
import { LineData } from 'lightweight-charts';
import { AreaChartComponent } from '../../shared/charts/area-chart.component';
import { CommunityFilterComponent } from '../../shared/components/community-filter/community-filter.component';
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { CommunitiesService, type CommunityDto } from '../../services/communities.service';
import { DashboardService } from '../../services/dashboard.service';
import { Comunidad } from '../../interfaces/comunidad.interface';
import { RolesEnum } from '../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../shared/mappers/community.mapper';
import type { DashboardDto } from '../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    CommonModule,
    FormsModule,
    BarChartComponent,
    AreaChartComponent,
    CommunityFilterComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css'
})
export class DashboardPageComponent implements OnInit {
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  readonly ULTIMOS_MESES = 6;

  // Datos del dashboard (actualizados desde la API)
  totalIngresosMes = signal<number>(0);
  totalEgresosMes = signal<number>(0);
  numeroMorososMes = signal<number>(0);
  montoEnMora = signal<number>(0);
  ticketsLevantados = signal<number>(0);
  ticketsResueltos = signal<number>(0);
  saldoActualEnBanco = signal<number>(0);
  recaudacionMensual = signal<LineData[]>([]);
  gastosMensuales = signal<LineData[]>([]);
  saldoBancoMeses = signal<LineData[]>([]);

  // Gráficas que no vienen del API (placeholder o derivadas)
  cobranzaDelMes = signal<LineData[]>([]);
  morosidadUltimosMeses = signal<LineData[]>([]);
  ticketsLevantadosPorMes = signal<LineData[]>([]);
  tiempoRespuestaPromedioHoras = signal<number>(0);
  porcentajeResolucion = signal<number>(0);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.loadDashboard(comunidadId);
      } else {
        const first = this.comunidadesAsociadas()[0];
        if (first?.id) {
          this.selectedComunidadId.set(first.id);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { comunidad: first.id },
            queryParamsHandling: 'merge'
          });
        }
      }
    });

    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService
      .getUserById(userId)
      .pipe(
        switchMap((userDto: { userCommunityIds?: string[] }) => {
          const ids = userDto.userCommunityIds;
          if (!ids?.length) return of([]);
          return forkJoin(ids.map((id: string) => this.communitiesService.getCommunityById(id)));
        }),
        catchError(() => of([]))
      )
      .subscribe((communityDtos: CommunityDto[]) => {
        this.loadedCommunitiesForAdmin.set(communityDtos.map((dto) => mapCommunityDtoToComunidad(dto)));
        const cid = this.selectedComunidadId();
        if (!cid && communityDtos.length > 0 && communityDtos[0].id) {
          this.selectedComunidadId.set(communityDtos[0].id);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { comunidad: communityDtos[0].id },
            queryParamsHandling: 'merge'
          });
        }
      });
  }

  onComunidadChange(value: string): void {
    this.selectedComunidadId.set(value);
    if (value) {
      this.loadDashboard(value);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { comunidad: value },
        queryParamsHandling: 'merge'
      });
    } else {
      this.errorMessage.set(null);
      this.totalIngresosMes.set(0);
      this.totalEgresosMes.set(0);
      this.numeroMorososMes.set(0);
      this.montoEnMora.set(0);
      this.ticketsLevantados.set(0);
      this.ticketsResueltos.set(0);
      this.saldoActualEnBanco.set(0);
      this.recaudacionMensual.set([]);
      this.gastosMensuales.set([]);
      this.saldoBancoMeses.set([]);
    }
  }

  private loadDashboard(communityId: string): void {
    if (!communityId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.dashboardService.getDashboard(communityId, this.ULTIMOS_MESES).subscribe({
      next: (data: DashboardDto) => {
        this.totalIngresosMes.set(data.ingresosDelMes ?? 0);
        this.totalEgresosMes.set(data.egresosDelMes ?? 0);
        this.numeroMorososMes.set(data.cantidadMorosos ?? 0);
        this.montoEnMora.set(data.montoEnMora ?? 0);
        this.ticketsLevantados.set(data.ticketsLevantados ?? 0);
        this.ticketsResueltos.set(data.ticketsResueltos ?? 0);
        this.saldoActualEnBanco.set(data.saldoActualEnBanco ?? 0);

        this.recaudacionMensual.set(this.mapMontoPorMesToLineData(data.recaudacionMensual ?? []));
        this.gastosMensuales.set(this.mapMontoPorMesToLineData(data.gastosMensuales ?? []));
        this.saldoBancoMeses.set(this.mapMontoPorMesToLineData(data.saldosMensualesEnBanco ?? []));

        this.morosidadUltimosMeses.set(this.saldoBancoMeses().length ? [] : []);
        const total = data.ticketsLevantados ?? 0;
        this.porcentajeResolucion.set(total > 0 ? Math.round(((data.ticketsResueltos ?? 0) / total) * 100) : 0);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el dashboard de la comunidad.');
        this.isLoading.set(false);
      }
    });
  }

  private mapMontoPorMesToLineData(list: { anio: number; mes: number; total: number }[]): LineData[] {
    return list.map((m) => ({
      time: `${m.anio}-${String(m.mes).padStart(2, '0')}-01`,
      value: Number(m.total)
    }));
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { ResidentsService } from '../../../services/residents.service';
import { CargosResidenteService } from '../../../services/cargos-residente.service';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { CommunityConfigurationsService } from '../../../services/community-configurations.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';

/** Código de configuración para el monto de un mantenimiento mensual (umbral moroso = 2 × este valor). */
const CONFIG_CODIGO_MONTO_MANTENIMIENTO = 'MONTO_MANT';
const MONTO_MANTENIMIENTO_DEFAULT = 800;
import { Residente } from '../../../shared/interfaces/residente.interface';
import { CargoResidente } from '../../../shared/interfaces/cargo-residente.interface';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';

export interface MorosoItem {
  residentId: string;
  userId: string;
  fullname: string;
  number?: string;
  totalCargos: number;
  totalPagos: number;
  balance: number;
}

@Component({
  selector: 'hh-morosos-list',
  standalone: true,
  imports: [CommonModule, CommunityFilterComponent],
  templateUrl: './morosos-list.component.html'
})
export class MorososListComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private residentsService = inject(ResidentsService);
  private cargosService = inject(CargosResidenteService);
  private pagosService = inject(PagosResidenteService);
  private configsService = inject(CommunityConfigurationsService);
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

  /** Morosos: residentes con balance >= umbral (2 × mensualidad). */
  morosos = signal<MorosoItem[]>([]);

  /** Monto de una mensualidad (mantenimiento) usado para el umbral; null si no hay comunidad cargada. */
  montoMantenimientoUsado = signal<number | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.loadMorosos(comunidadId);
      } else {
        const stored = this.adminContext.getSelectedCommunityId();
        if (stored) {
          this.selectedComunidadId.set(stored);
          this.loadMorosos(stored);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { comunidad: stored },
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
        switchMap((userDto) => {
          const ids = userDto.userCommunityIds;
          if (!ids?.length) return of([]);
          return forkJoin(ids.map((id) => this.communitiesService.getCommunityById(id)));
        }),
        catchError(() => of([]))
      )
      .subscribe((communityDtos) => {
        this.loadedCommunitiesForAdmin.set(communityDtos.map((dto) => mapCommunityDtoToComunidad(dto)));
      });
  }

  private loadMorosos(communityId: string): void {
    if (!communityId) {
      this.morosos.set([]);
      this.montoMantenimientoUsado.set(null);
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      residents: this.residentsService.getResidentsByCommunityId(communityId).pipe(catchError(() => of([]))),
      cargos: this.cargosService.getByCommunityId(communityId).pipe(catchError(() => of([]))),
      pagos: this.pagosService.getByCommunityId(communityId).pipe(catchError(() => of([]))),
      configs: this.configsService.getByCommunityId(communityId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ residents, cargos, pagos, configs }) => {
        const { monto, umbral } = this.getMontoYUmbralDesdeConfig(configs);
        this.montoMantenimientoUsado.set(monto);
        const morososList = this.computeMorosos(residents, cargos, pagos, umbral);
        this.morosos.set(morososList);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la información de morosos.');
        this.morosos.set([]);
        this.montoMantenimientoUsado.set(null);
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Obtiene el monto de una mensualidad y el umbral (2 × mensualidad) desde la configuración.
   * Lee MONTO_MANT de la comunidad; si no existe o no es válido, usa default.
   */
  private getMontoYUmbralDesdeConfig(configs: { codigo?: string | null; valor?: string | null }[]): { monto: number; umbral: number } {
    const config = configs.find((c) => (c.codigo ?? '').trim() === CONFIG_CODIGO_MONTO_MANTENIMIENTO);
    const valor = config?.valor?.trim();
    if (valor == null || valor === '') {
      const monto = MONTO_MANTENIMIENTO_DEFAULT;
      return { monto, umbral: 2 * monto };
    }
    const num = Number.parseFloat(valor.replace(',', '.'));
    if (!Number.isFinite(num) || num < 0) {
      const monto = MONTO_MANTENIMIENTO_DEFAULT;
      return { monto, umbral: 2 * monto };
    }
    return { monto: num, umbral: 2 * num };
  }

  /**
   * Por cada residente: total cargos (solo anteriores al día actual), total pagos (solo status Aplicado).
   * Moroso = balance >= umbralMoroso (equivalente a 2 mantenimientos según configuración).
   */
  private computeMorosos(
    residents: Residente[],
    cargos: CargoResidente[],
    pagos: PagosResidente[],
    umbralMoroso: number
  ): MorosoItem[] {
    const todayStr = this.getTodayDateString();
    const result: MorosoItem[] = [];
    for (const resident of residents) {
      const rid = resident.residentId ?? resident.id;
      if (!rid) continue;

      const totalCargos = cargos
        .filter((c) => c.residentId === rid)
        .filter((c) => {
          const cargoDateStr = (c.fecha ?? '').split('T')[0];
          return cargoDateStr && cargoDateStr < todayStr;
        })
        .reduce((sum, c) => sum + (c.monto ?? 0), 0);

      const totalPagos = pagos
        .filter((p) => p.residenteId === rid && p.status === 'Aplicado')
        .reduce((sum, p) => sum + (p.monto ?? 0), 0);

      const balance = totalCargos - totalPagos;
      if (balance < umbralMoroso) continue;

      result.push({
        residentId: rid,
        userId: resident.id ?? rid,
        fullname: resident.fullname ?? '—',
        number: resident.number,
        totalCargos,
        totalPagos,
        balance
      });
    }
    return result.sort((a, b) => b.balance - a.balance);
  }

  /** Fecha de hoy en formato YYYY-MM-DD para comparar. */
  private getTodayDateString(): string {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  onComunidadChange(value: string): void {
    this.adminContext.setSelectedCommunityId(value);
    this.selectedComunidadId.set(value);
    if (value) {
      this.loadMorosos(value);
    } else {
      this.morosos.set([]);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: value || null },
      queryParamsHandling: 'merge'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goToResident(userId: string): void {
    this.router.navigate(['/admincompany/residentes', userId], {
      queryParams: this.selectedComunidadId() ? { comunidad: this.selectedComunidadId() } : {}
    });
  }

  goToHistorial(residentId: string): void {
    this.router.navigate(['/admincompany/historial-pagos-residente', residentId], {
      queryParams: this.selectedComunidadId() ? { comunidad: this.selectedComunidadId() } : {}
    });
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { ResidentsService } from '../../../services/residents.service';
import { CargosResidenteService } from '../../../services/cargos-residente.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { CargoResidente } from '../../../shared/interfaces/cargo-residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';

@Component({
  selector: 'hh-cargos-residente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './cargos-residente-list.component.html'
})
export class CargosResidenteListComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private residentsService = inject(ResidentsService);
  private cargosService = inject(CargosResidenteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  selectedResidentId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  private residentsForCommunity = signal<Residente[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  cargoToDelete = signal<CargoResidente | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private cargosResource = rxResource({
    request: () => ({
      residentId: this.selectedResidentId(),
      communityId: this.selectedComunidadId(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (request.residentId === 'all' && request.communityId) {
        return this.cargosService.getByCommunityId(request.communityId).pipe(catchError(() => of([])));
      }
      if (request.residentId && request.residentId !== 'all') {
        return this.cargosService.getByResidentId(request.residentId).pipe(catchError(() => of([])));
      }
      return of([]);
    }
  });

  private allCargos = computed(() => this.cargosResource.value() ?? []);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  cargosOrdenados = computed(() => {
    const list = this.allCargos();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'residente':
          cmp = (a.residentName ?? '').localeCompare(b.residentName ?? '');
          break;
        case 'fecha':
          cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
          break;
        case 'descripcion':
          cmp = (a.descripcion ?? '').localeCompare(b.descripcion ?? '');
          break;
        case 'monto':
          cmp = (a.monto ?? 0) - (b.monto ?? 0);
          break;
        case 'estatus':
          cmp = (a.estatus ?? '').localeCompare(b.estatus ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.cargosOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  cargosPaginados = computed(() => {
    const list = this.cargosOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  isLoading = computed(() => this.cargosResource.isLoading());

  paginasVisibles = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 0) return [];
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  residentsOptions = computed(() => this.residentsForCommunity());

  setSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.loadResidents(comunidadId);
      } else {
        const stored = this.adminContext.getSelectedCommunityId();
        if (stored) {
          this.selectedComunidadId.set(stored);
          this.loadResidents(stored);
          this.router.navigate([], { relativeTo: this.route, queryParams: { comunidad: stored }, queryParamsHandling: 'merge' });
        }
      }
      const residentId = params['residente'];
      if (residentId !== undefined && residentId !== null) this.selectedResidentId.set(residentId === 'all' ? 'all' : residentId);
      const page = params['page'];
      if (page != null) {
        const p = Number(page);
        if (p >= 1) this.currentPage.set(p);
      }
      const pageSizeParam = params['pageSize'];
      if (pageSizeParam != null) {
        const ps = Number(pageSizeParam);
        if (isPageSizeOption(ps)) this.pageSize.set(ps);
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

  private loadResidents(communityId: string): void {
    if (!communityId) {
      this.residentsForCommunity.set([]);
      this.selectedResidentId.set('');
      return;
    }
    this.residentsService.getResidentsByCommunityId(communityId).subscribe({
      next: (list) => {
        this.residentsForCommunity.set(list);
        const current = this.selectedResidentId();
        if (current && current !== 'all' && !list.some((r) => r.id === current)) this.selectedResidentId.set('');
      },
      error: () => this.residentsForCommunity.set([])
    });
  }

  onComunidadChange(value: string): void {
    this.adminContext.setSelectedCommunityId(value);
    this.selectedComunidadId.set(value);
    this.selectedResidentId.set('');
    this.residentsForCommunity.set([]);
    if (value) this.loadResidents(value);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: value || null, residente: null, page: null },
      queryParamsHandling: 'merge'
    });
  }

  onResidentChange(value: string): void {
    this.selectedResidentId.set(value || '');
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { residente: value || null, page: null },
      queryParamsHandling: 'merge'
    });
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || page > total) return;
    this.currentPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: page === 1 ? null : page },
      queryParamsHandling: 'merge'
    });
  }

  onPageSizeChange(value: string | number): void {
    const n = typeof value === 'string' ? Number(value) : value;
    if (!isPageSizeOption(n)) return;
    this.pageSize.set(n);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: null, pageSize: n },
      queryParamsHandling: 'merge'
    });
  }

  formatDate(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { dateStyle: 'short' });
  }

  viewCargoDetail(cargo: CargoResidente): void {
    if (cargo.id) {
      this.router.navigate(['/admincompany/cargos-residente', cargo.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null, residente: this.selectedResidentId() || null }
      });
    }
  }

  openDeleteModal(cargo: CargoResidente): void {
    this.cargoToDelete.set(cargo);
    setTimeout(() => {
      const modal = document.getElementById('deleteCargoModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteCargoModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.cargoToDelete.set(null);
  }

  confirmDeleteCargo(): void {
    const cargo = this.cargoToDelete();
    if (!cargo?.id) return;
    this.cargosService.delete(cargo.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {}
    });
  }
}

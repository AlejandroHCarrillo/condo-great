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
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { PagosResidente } from '../../../shared/interfaces/pagos-residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';

@Component({
  selector: 'hh-pagos-residente-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './pagos-residente-list.component.html'
})
export class PagosResidenteListComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private residentsService = inject(ResidentsService);
  private pagosService = inject(PagosResidenteService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private readonly PAGE_SIZE_STORAGE_KEY = 'hh_pagos_residente_pageSize';

  selectedComunidadId = signal<string>('');
  selectedResidentId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  private residentsForCommunity = signal<Residente[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  pagoToDelete = signal<PagosResidente | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private pagosResource = rxResource({
    request: () => ({
      residentId: this.selectedResidentId(),
      communityId: this.selectedComunidadId(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (request.residentId === 'all' && request.communityId) {
        return this.pagosService.getByCommunityId(request.communityId).pipe(catchError(() => of([])));
      }
      if (request.residentId && request.residentId !== 'all') {
        return this.pagosService.getByResidentId(request.residentId).pipe(catchError(() => of([])));
      }
      return of([]);
    }
  });

  private allPagos = computed(() => this.pagosResource.value() ?? []);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  pagosOrdenados = computed(() => {
    const list = this.allPagos();
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
          cmp = new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime();
          break;
        case 'monto':
          cmp = (a.monto ?? 0) - (b.monto ?? 0);
          break;
        case 'status':
          cmp = (a.status ?? '').localeCompare(b.status ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.pagosOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  pagosPaginados = computed(() => {
    const list = this.pagosOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  isLoading = computed(() => this.pagosResource.isLoading());

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
        if (isPageSizeOption(ps)) {
          this.pageSize.set(ps);
          try {
            localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, String(ps));
          } catch {}
        }
      } else {
        const stored = this.getStoredPageSize();
        if (stored != null) {
          this.pageSize.set(stored);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { pageSize: stored },
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
    try {
      localStorage.setItem(this.PAGE_SIZE_STORAGE_KEY, String(n));
    } catch {}
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: null, pageSize: n },
      queryParamsHandling: 'merge'
    });
  }

  private getStoredPageSize(): number | null {
    try {
      const raw = localStorage.getItem(this.PAGE_SIZE_STORAGE_KEY);
      if (raw == null) return null;
      const n = Number(raw);
      return isPageSizeOption(n) ? n : null;
    } catch {
      return null;
    }
  }

  formatDate(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { dateStyle: 'short' });
  }

  viewPagoDetail(pago: PagosResidente): void {
    if (pago.id) {
      this.router.navigate(['/admincompany/pagos-residente', pago.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null, residente: this.selectedResidentId() || null }
      });
    }
  }

  openDeleteModal(pago: PagosResidente): void {
    this.pagoToDelete.set(pago);
    setTimeout(() => {
      const modal = document.getElementById('deletePagoModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deletePagoModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.pagoToDelete.set(null);
  }

  confirmDeletePago(): void {
    const pago = this.pagoToDelete();
    if (!pago?.id) return;
    this.pagosService.delete(pago.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {}
    });
  }
}

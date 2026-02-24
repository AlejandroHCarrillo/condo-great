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
import { ResidentsService, PagedResidentsResult } from '../../../services/residents.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';

@Component({
  selector: 'hh-residentes',
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './residentes.component.html'
})
export class ResidentesComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private residentsService = inject(ResidentsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  /** Incrementar para forzar recarga del resource tras eliminar. */
  private refreshTrigger = signal(0);
  /** Residente seleccionado para mostrar en el modal de confirmación de eliminación. */
  residentToDelete = signal<Residente | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    const loaded = this.loadedCommunitiesForAdmin();
    return loaded.length ? loaded : [];
  });

  private residentsResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId(),
      comunidades: this.comunidadesAsociadas(),
      page: this.currentPage(),
      pageSize: this.pageSize(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (!request.comunidadId) return of({ items: [], totalCount: 0, page: 1, pageSize: request.pageSize, totalPages: 0 });
      const communityIds =
        request.comunidadId === 'all'
          ? request.comunidades.map(c => c.id ?? '').filter(Boolean)
          : [request.comunidadId];
      if (!communityIds.length) return of({ items: [], totalCount: 0, page: 1, pageSize: request.pageSize, totalPages: 0 });
      return communityIds.length === 1
        ? this.residentsService.getResidentsByCommunityIdPaged(communityIds[0], request.page, request.pageSize)
        : this.residentsService.getResidentsByCommunitiesPaged(communityIds, request.page, request.pageSize);
    }
  });

  private pagedResult = computed(() => this.residentsResource.value());
  residentesFiltrados = computed(() => this.pagedResult()?.items ?? []);
  totalCount = computed(() => this.pagedResult()?.totalCount ?? 0);
  totalPages = computed(() => this.pagedResult()?.totalPages ?? 0);
  isLoading = computed(() => this.residentsResource.isLoading());

  /** Números de página a mostrar en el paginador (alrededor de la actual). */
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

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  residentesOrdenados = computed(() => {
    const list = this.residentesFiltrados();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'comunidad':
          cmp = this.getComunidadNombre(a.comunidades?.[0] ?? '').localeCompare(this.getComunidadNombre(b.comunidades?.[0] ?? ''));
          break;
        case 'number':
          cmp = (a.number ?? '').localeCompare(b.number ?? '', undefined, { numeric: true, sensitivity: 'base' });
          break;
        case 'fullname':
          cmp = (a.fullname ?? '').localeCompare(b.fullname ?? '');
          break;
        case 'email':
          cmp = (a.email ?? '').localeCompare(b.email ?? '');
          break;
        case 'phone':
          cmp = (a.phone ?? '').localeCompare(b.phone ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  setSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getComunidadNombre(comunidadId: string): string {
    return this.comunidadesAsociadas().find(c => c.id === comunidadId)?.nombre ?? 'Sin comunidad';
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
      } else {
        const stored = this.adminContext.getSelectedCommunityId();
        if (stored) {
          this.selectedComunidadId.set(stored);
          this.router.navigate([], { relativeTo: this.route, queryParams: { comunidad: stored }, queryParamsHandling: 'merge' });
        }
      }
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
    this.usersService.getUserById(userId).pipe(
      switchMap(userDto => {
        const ids = userDto.userCommunityIds;
        if (!ids?.length) return of([]);
        return forkJoin(ids.map(id => this.communitiesService.getCommunityById(id)));
      }),
      catchError(() => of([]))
    ).subscribe(communityDtos => {
      const comunidades = communityDtos.map(dto => mapCommunityDtoToComunidad(dto));
      this.loadedCommunitiesForAdmin.set(comunidades);
    });
  }

  onComunidadChange(value: string | Event): void {
    const comunidadId = typeof value === 'string' ? value : (value.target as HTMLSelectElement).value;
    this.adminContext.setSelectedCommunityId(comunidadId);
    this.selectedComunidadId.set(comunidadId);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: comunidadId || null, page: null },
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

  viewResidentDetail(residente: Residente): void {
    if (residente.id) {
      this.router.navigate(['/admincompany/residentes', residente.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(residente: Residente): void {
    if (!residente.residentId) return;
    this.residentToDelete.set(residente);
    setTimeout(() => {
      const modal = document.getElementById('deleteResidentModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteResidentModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.residentToDelete.set(null);
  }

  confirmDeleteResident(): void {
    const residente = this.residentToDelete();
    if (!residente?.residentId) return;
    this.residentsService.deleteResident(residente.residentId).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update(v => v + 1);
      },
      error: () => {}
    });
  }
}

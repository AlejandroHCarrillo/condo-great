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
import { CommunityProvidersService } from '../../../services/community-providers.service';
import { CommunitiesService } from '../../../services/communities.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { CommunityProvider } from '../../../shared/interfaces/community-provider.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';

@Component({
  selector: 'hh-proveedores',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './proveedores.component.html'
})
export class ProveedoresComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private providersService = inject(CommunityProvidersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  providerToDelete = signal<CommunityProvider | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private providersResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (!request.comunidadId) return of([]);
      return this.providersService.getByCommunityId(request.comunidadId).pipe(catchError(() => of([])));
    }
  });

  private allProviders = computed(() => this.providersResource.value() ?? []);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  providersOrdenados = computed(() => {
    const list = this.allProviders();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'nombre':
          cmp = (a.businessName ?? '').localeCompare(b.businessName ?? '');
          break;
        case 'categoria':
          cmp = (a.categoryOrIndustry ?? '').localeCompare(b.categoryOrIndustry ?? '');
          break;
        case 'contacto':
          cmp = (a.primaryContactName ?? a.primaryEmail ?? '').localeCompare(b.primaryContactName ?? b.primaryEmail ?? '');
          break;
        case 'rating':
          cmp = (a.rating ?? 0) - (b.rating ?? 0);
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.providersOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  providersPaginados = computed(() => {
    const list = this.providersOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  isLoading = computed(() => this.providersResource.isLoading());

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

  setSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  formatRating(rating: number | null | undefined): string {
    if (rating == null) return '-';
    return rating.toFixed(1);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
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

  onComunidadChange(value: string): void {
    this.adminContext.setSelectedCommunityId(value);
    this.selectedComunidadId.set(value);
    this.currentPage.set(1);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: value || null, page: null },
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

  viewProviderDetail(provider: CommunityProvider): void {
    if (provider.id) {
      this.router.navigate(['/admincompany/proveedores', provider.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(provider: CommunityProvider): void {
    this.providerToDelete.set(provider);
    setTimeout(() => {
      const modal = document.getElementById('deleteProveedorModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteProveedorModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.providerToDelete.set(null);
  }

  confirmDeleteProvider(): void {
    const provider = this.providerToDelete();
    if (!provider?.id) return;
    this.providersService.delete(provider.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {}
    });
  }
}

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
import { CommunityConfigurationsService } from '../../../services/community-configurations.service';
import { CommunitiesService } from '../../../services/communities.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { CommunityConfiguration } from '../../../shared/interfaces/community-configuration.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';

@Component({
  selector: 'hh-configuraciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './configuraciones.component.html'
})
export class ConfiguracionesComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private configsService = inject(CommunityConfigurationsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  configToDelete = signal<CommunityConfiguration | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private configsResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (!request.comunidadId) return of([]);
      return this.configsService.getByCommunityId(request.comunidadId).pipe(catchError(() => of([])));
    }
  });

  private allConfigs = computed(() => this.configsResource.value() ?? []);

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  configsOrdenados = computed(() => {
    const list = this.allConfigs();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'titulo':
          cmp = (a.titulo ?? '').localeCompare(b.titulo ?? '');
          break;
        case 'tipoDato':
          cmp = (a.tipoDato ?? '').localeCompare(b.tipoDato ?? '');
          break;
        case 'valor':
          cmp = (a.valor ?? '').localeCompare(b.valor ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.configsOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  configsPaginados = computed(() => {
    const list = this.configsOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  isLoading = computed(() => this.configsResource.isLoading());

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

  viewConfigDetail(config: CommunityConfiguration): void {
    if (config.id) {
      this.router.navigate(['/admincompany/configuracion', config.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(config: CommunityConfiguration): void {
    this.configToDelete.set(config);
    setTimeout(() => {
      const modal = document.getElementById('deleteConfigModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteConfigModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.configToDelete.set(null);
  }

  confirmDeleteConfig(): void {
    const config = this.configToDelete();
    if (!config?.id) return;
    this.configsService.delete(config.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {}
    });
  }
}

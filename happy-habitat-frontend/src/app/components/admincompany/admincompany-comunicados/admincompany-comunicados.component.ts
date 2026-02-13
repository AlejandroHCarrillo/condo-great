import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { ComunicadosService } from '../../../services/comunicados.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunicado } from '../../../shared/interfaces/comunicado.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';

@Component({
  selector: 'hh-admincompany-comunicados',
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './admincompany-comunicados.component.html'
})
export class AdmincompanyComunicadosComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private comunicadosService = inject(ComunicadosService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  comunicadoToDelete = signal<Comunicado | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private comunicadosResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId(),
      comunidades: this.comunidadesAsociadas(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      const comunidadId = request.comunidadId;
      const comunidades = request.comunidades || [];
      const ids = comunidades.map(c => c.id ?? '').filter(Boolean);

      if (!comunidadId && ids.length === 0) return of([]);
      if (!comunidadId) return of([]); // "Seleccione una comunidad" por defecto: no cargar hasta elegir
      if (comunidadId === 'all') {
        if (ids.length === 0) return of([]);
        return forkJoin(ids.map(id => this.comunicadosService.getComunicadosByCommunityId(id))).pipe(
          map(arrays => (arrays as Comunicado[][]).flat()),
          catchError(() => of([]))
        );
      }
      return this.comunicadosService.getComunicadosByCommunityId(comunidadId).pipe(
        catchError(() => of([]))
      );
    }
  });

  private allComunicados = computed(() => {
    const list = this.comunicadosResource.value() ?? [];
    return [...list].sort((a, b) => {
      const dateA = new Date(a.fecha || 0).getTime();
      const dateB = new Date(b.fecha || 0).getTime();
      return dateB - dateA;
    });
  });

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('desc');

  comunicadosOrdenados = computed(() => {
    const list = this.allComunicados();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'comunidad':
          cmp = (a.communityName ?? '').localeCompare(b.communityName ?? '');
          break;
        case 'titulo':
          cmp = (a.titulo ?? '').localeCompare(b.titulo ?? '');
          break;
        case 'fecha':
          cmp = new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime();
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.comunicadosOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  comunicadosPaginados = computed(() => {
    const list = this.comunicadosOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
  isLoading = computed(() => this.comunicadosResource.isLoading());

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
      this.sortDirection.set(column === 'fecha' ? 'desc' : 'asc');
    }
  }

  getComunidadNombre(comunicado: Comunicado): string {
    return comunicado.communityName ?? this.comunidadesAsociadas().find(c => c.id === comunicado.communityId)?.nombre ?? 'Sin comunidad';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    try {
      const d = new Date(fecha);
      return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fecha;
    }
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
      this.loadedCommunitiesForAdmin.set(communityDtos.map(dto => mapCommunityDtoToComunidad(dto)));
      // Por defecto se mantiene "Seleccione una comunidad"; no auto-seleccionar 'all'
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

  viewComunicadoDetail(comunicado: Comunicado): void {
    if (comunicado.id) {
      this.router.navigate(['/admincompany/comunicados', comunicado.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(comunicado: Comunicado): void {
    this.comunicadoToDelete.set(comunicado);
    setTimeout(() => {
      const modal = document.getElementById('deleteComunicadoModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteComunicadoModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.comunicadoToDelete.set(null);
  }

  confirmDeleteComunicado(): void {
    const comunicado = this.comunicadoToDelete();
    if (!comunicado?.id) return;
    this.comunicadosService.deleteComunicado(comunicado.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update(v => v + 1);
      },
      error: () => {}
    });
  }
}

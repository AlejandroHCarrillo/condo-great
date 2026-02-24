import { Component, inject, signal, computed, OnInit, DestroyRef, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { TicketsService } from '../../../services/tickets.service';
import { CommunitiesService } from '../../../services/communities.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { Ticket, StatusTicketDto } from '../../../shared/interfaces/ticket.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { PAGE_SIZE_OPTIONS, isPageSizeOption } from '../../../constants/pagination.constants';

/** 'admin' = gestión por comunidad (admin company); 'resident' = solo tickets del residente logueado. */
export type TicketsViewMode = 'admin' | 'resident';

@Component({
  selector: 'hh-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './tickets.component.html'
})
export class TicketsComponent implements OnInit {
  /** Cuando es 'resident' se muestran solo los tickets del residente logueado y se oculta el filtro de comunidad. Por defecto se infiere desde la URL (/resident/tickets). */
  mode = input<TicketsViewMode | undefined>(undefined);

  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private ticketsService = inject(TicketsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  /** Lista de estados para resolver color del badge si la API no envía statusColor. */
  statusList = signal<StatusTicketDto[]>([]);
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);

  /** true si la ruta es /resident/tickets (o se pasó mode='resident'). */
  isResidentView = computed(() => {
    const m = this.mode();
    if (m !== undefined) return m === 'resident';
    const url = this.router.url;
    return url.startsWith('/resident/tickets');
  });

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private ticketsResource = rxResource({
    request: () => ({
      residentView: this.isResidentView(),
      comunidadId: this.selectedComunidadId(),
      refresh: this.refreshTrigger()
    }),
    loader: ({ request }) => {
      if (request.residentView) {
        return this.ticketsService.getMy().pipe(catchError(() => of([])));
      }
      if (!request.comunidadId) return of([]);
      return this.ticketsService.getByCommunityId(request.comunidadId).pipe(catchError(() => of([])));
    }
  });

  tickets = computed(() => this.ticketsResource.value() ?? []);
  isLoading = computed(() => this.ticketsResource.isLoading());

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('desc');

  ticketsOrdenados = computed(() => {
    const list = this.tickets();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'fechaReporte':
          cmp = (a.fechaReporte ?? '').localeCompare(b.fechaReporte ?? '');
          break;
        case 'residentName':
          cmp = (a.residentName ?? '').localeCompare(b.residentName ?? '');
          break;
        case 'categoriaTicketNombre':
          cmp = (a.categoriaTicketNombre ?? '').localeCompare(b.categoriaTicketNombre ?? '');
          break;
        case 'statusCode':
          cmp = (a.statusCode ?? '').localeCompare(b.statusCode ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.ticketsOrdenados().length);
  totalPages = computed(() => {
    const total = this.totalCount();
    const size = this.pageSize();
    return size > 0 ? Math.max(1, Math.ceil(total / size)) : 0;
  });
  ticketsPaginados = computed(() => {
    const list = this.ticketsOrdenados();
    const page = this.currentPage();
    const size = this.pageSize();
    const start = (page - 1) * size;
    return list.slice(start, start + size);
  });
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
      this.sortDirection.set(column === 'fechaReporte' ? 'desc' : 'asc');
    }
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleDateString('es', { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return value;
    }
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
      } else if (!this.isResidentView()) {
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

    this.ticketsService.getStatusTickets().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list) => this.statusList.set(list),
      error: () => {}
    });

    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
  }

  /** Ruta base para ver detalle (según modo admin o resident). */
  detailPath = computed(() => (this.isResidentView() ? '/resident/tickets' : '/admincompany/residentes/tickets'));
  /** Ruta para crear ticket (solo en modo resident; en admin el link lleva communityId). */
  newTicketPath = computed(() => (this.isResidentView() ? '/resident/tickets/nuevo' : null));

  /** Color del badge del estado: usa statusColor del ticket o lo resuelve por statusId. */
  getStatusColor(ticket: Ticket): string {
    const t = ticket as Ticket & { StatusColor?: string };
    const color = t.statusColor ?? t.StatusColor;
    if (color) return color;
    const status = this.statusList().find(s => s.id === ticket.statusId) as StatusTicketDto & { Color?: string } | undefined;
    return status?.color ?? status?.Color ?? '#6b7280';
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService.getUserById(userId).pipe(
      switchMap(userDto => {
        const ids = userDto.userCommunityIds;
        if (!ids?.length) return of([]);
        return forkJoin(ids.map(id => this.communitiesService.getCommunityById(id)));
      }),
      catchError(() => of([])),
      takeUntilDestroyed(this.destroyRef)
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

  viewTicket(ticket: Ticket): void {
    const base = this.detailPath();
    this.router.navigate([base, ticket.id], {
      queryParams: this.isResidentView() ? {} : { comunidad: this.selectedComunidadId() || null }
    });
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Ticket } from '../../../shared/interfaces/ticket.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';

@Component({
  selector: 'hh-admincompany-tickets',
  standalone: true,
  imports: [CommonModule, RouterLink, CommunityFilterComponent],
  templateUrl: './admincompany-tickets.component.html'
})
export class AdmincompanyTicketsComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private ticketsService = inject(TicketsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private ticketsResource = rxResource({
    request: () => ({
      comunidadId: this.selectedComunidadId()
    }),
    loader: ({ request }) => {
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
        case 'tipoReporteNombre':
          cmp = (a.tipoReporteNombre ?? '').localeCompare(b.tipoReporteNombre ?? '');
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: comunidadId || null },
      queryParamsHandling: 'merge'
    });
  }

  viewTicket(ticket: Ticket): void {
    this.router.navigate(['/admincompany/residentes/tickets', ticket.id], {
      queryParams: { comunidad: this.selectedComunidadId() || null }
    });
  }
}

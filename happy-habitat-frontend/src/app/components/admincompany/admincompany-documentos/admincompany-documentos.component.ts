import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { DocumentsService } from '../../../services/documents.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Documento } from '../../../shared/interfaces/documento.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';

@Component({
  selector: 'hh-admincompany-documentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './admincompany-documentos.component.html'
})
export class AdmincompanyDocumentosComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private documentsService = inject(DocumentsService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  private refreshTrigger = signal(0);
  documentToDelete = signal<Documento | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  private documentsResource = rxResource({
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
      if (!comunidadId) return of([]);
      if (comunidadId === 'all') {
        if (ids.length === 0) return of([]);
        return forkJoin(ids.map(id => this.documentsService.getByCommunityId(id))).pipe(
          map(arrays => (arrays as Documento[][]).flat()),
          catchError(() => of([]))
        );
      }
      return this.documentsService.getByCommunityId(comunidadId).pipe(
        catchError(() => of([]))
      );
    }
  });

  private allDocuments = computed(() => {
    const list = this.documentsResource.value() ?? [];
    return [...list].sort((a, b) => {
      const dateA = new Date(a.fecha || 0).getTime();
      const dateB = new Date(b.fecha || 0).getTime();
      return dateB - dateA;
    });
  });

  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('desc');

  documentsOrdenados = computed(() => {
    const list = this.allDocuments();
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
        case 'userCreated':
          cmp = (a.userCreated ?? '').localeCompare(b.userCreated ?? '');
          break;
        default:
          return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  isLoading = computed(() => this.documentsResource.isLoading());

  setSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('desc');
    }
  }

  getComunidadNombre(doc: Documento): string {
    return doc.communityName ?? 'Sin comunidad';
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
    });

    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService.getUserById(userId).pipe(
      map(userDto => userDto.userCommunityIds ?? []),
      catchError(() => of([]))
    ).subscribe(ids => {
      if (!ids.length) return;
      forkJoin(ids.map(id => this.communitiesService.getCommunityById(id))).pipe(
        catchError(() => of([]))
      ).subscribe(dtos => {
        this.loadedCommunitiesForAdmin.set(dtos.map(dto => mapCommunityDtoToComunidad(dto)));
      });
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

  viewDocumentDetail(doc: Documento): void {
    if (doc.id) {
      this.router.navigate(['/admincompany/documentos', doc.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(doc: Documento): void {
    this.documentToDelete.set(doc);
    setTimeout(() => {
      const modal = document.getElementById('deleteDocumentModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteDocumentModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.documentToDelete.set(null);
  }

  confirmDeleteDocument(): void {
    const doc = this.documentToDelete();
    if (!doc?.id) return;
    this.documentsService.delete(doc.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update(v => v + 1);
      },
      error: () => {}
    });
  }
}

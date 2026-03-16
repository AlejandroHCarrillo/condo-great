import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { rxResource } from '../../../utils/rx-resource.util';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { ProveedorServicioService } from '../../../services/proveedor-servicio.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import type { ProveedorServicio as ProveedorServicioModel } from '../../../shared/interfaces/proveedor-servicio.interface';
import { PAGE_SIZE_OPTIONS } from '../../../constants/pagination.constants';

@Component({
  selector: 'hh-proveedores-servicios-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CommunityFilterComponent],
  templateUrl: './proveedores-servicios-list.component.html'
})
export class ProveedoresServiciosListComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private service = inject(ProveedorServicioService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  currentPage = signal(1);
  pageSize = signal(10);
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  private refreshTrigger = signal(0);
  itemToDelete = signal<ProveedorServicioModel | null>(null);

  /** Comunidades para el filtro; siempre array (nunca undefined). */
  comunidadesAsociadas = computed((): { id?: string; nombre: string }[] => {
    const user = this.authService.currentUser();
    if (!user?.communities?.length) return [];
    return user.communities;
  });

  private resource = rxResource<{ comunidadId: string; refresh: number }, ProveedorServicioModel[]>({
    request: () => ({ comunidadId: this.selectedComunidadId(), refresh: this.refreshTrigger() }),
    loader: ({ request }: { request: { comunidadId: string; refresh: number } }) => {
      if (!request.comunidadId) return of([]);
      return this.service.getByCommunityId(request.comunidadId).pipe(catchError(() => of([])));
    }
  });

  private allItems = computed(() => this.resource.value() ?? []);
  sortColumn = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  itemsOrdenados = computed(() => {
    const list = this.allItems();
    const col = this.sortColumn();
    const dir = this.sortDirection();
    if (!col) return list;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (col) {
        case 'giro': cmp = (a.giro ?? '').localeCompare(b.giro ?? ''); break;
        case 'nombre': cmp = (a.nombre ?? '').localeCompare(b.nombre ?? ''); break;
        case 'rating': cmp = (a.rating ?? 0) - (b.rating ?? 0); break;
        default: return 0;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalCount = computed(() => this.itemsOrdenados().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize())));
  itemsPaginados = computed(() => {
    const list = this.itemsOrdenados();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });
  isLoading = computed(() => this.resource.isLoading());
  paginasVisibles = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const start = Math.max(1, current - delta);
    const end = Math.min(total, current + delta);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        const name = this.comunidadesAsociadas().find(c => (c.id ?? '') === comunidadId)?.nombre ?? '';
        this.adminContext.setSelectedCommunityId(comunidadId, name);
      } else {
        const stored = this.adminContext.getSelectedCommunityId();
        if (stored) {
          this.selectedComunidadId.set(stored);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { comunidad: stored },
            queryParamsHandling: 'merge'
          });
        } else {
          this.selectedComunidadId.set('');
        }
      }
    });
  }

  onComunidadChange(comunidadId: string): void {
    const name = this.comunidadesAsociadas().find(c => (c.id ?? '') === comunidadId)?.nombre ?? '';
    this.adminContext.setSelectedCommunityId(comunidadId, name);
    this.selectedComunidadId.set(comunidadId);
    this.currentPage.set(1);
    this.refreshTrigger.update((v) => v + 1);
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  setSort(col: string): void {
    if (this.sortColumn() === col) this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  goToPage(p: number): void {
    this.currentPage.set(p);
  }

  onPageSizeChange(value: unknown): void {
    const n = Number(value);
    if (!isNaN(n) && n > 0) {
      this.pageSize.set(n);
      this.currentPage.set(1);
    }
  }

  viewDetail(item: ProveedorServicioModel): void {
    this.router.navigate(['/admincompany/proveedores-servicios', item.id], {
      queryParams: this.selectedComunidadId() ? { comunidad: this.selectedComunidadId() } : {}
    });
  }

  openDeleteModal(item: ProveedorServicioModel): void {
    this.itemToDelete.set(item);
    (document.getElementById('deleteProveedorServicioModal') as HTMLDialogElement)?.showModal();
  }

  closeDeleteModal(): void {
    this.itemToDelete.set(null);
    (document.getElementById('deleteProveedorServicioModal') as HTMLDialogElement)?.close();
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.refreshTrigger.update((v) => v + 1);
      },
      error: () => {}
    });
  }

  getRatingStars(rating: number | null | undefined): { full: number; half: boolean } {
    if (rating == null || rating < 0) return { full: 0, half: false };
    const clamped = Math.min(5, Math.max(0, rating));
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5;
    return { full, half };
  }
}

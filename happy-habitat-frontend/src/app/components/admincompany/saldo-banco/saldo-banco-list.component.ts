import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { SaldoCuentaBancariaService } from '../../../services/saldo-cuenta-bancaria.service';
import { CommunityFilterComponent } from '../../../shared/components/community-filter/community-filter.component';
import { SaldoCuentaBancaria } from '../../../shared/interfaces/saldo-cuenta-bancaria.interface';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';

@Component({
  selector: 'hh-saldo-banco-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CommunityFilterComponent],
  templateUrl: './saldo-banco-list.component.html'
})
export class SaldoBancoListComponent implements OnInit {
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private saldoService = inject(SaldoCuentaBancariaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private loadedCommunitiesForAdmin = signal<Comunidad[]>([]);
  saldos = signal<SaldoCuentaBancaria[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  saldoToDelete = signal<SaldoCuentaBancaria | null>(null);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunitiesForAdmin().length ? this.loadedCommunitiesForAdmin() : [];
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const comunidadId = params['comunidad'];
      if (comunidadId) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.loadSaldos(comunidadId);
      } else {
        const stored = this.adminContext.getSelectedCommunityId();
        if (stored) {
          this.selectedComunidadId.set(stored);
          this.loadSaldos(stored);
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { comunidad: stored },
            queryParamsHandling: 'merge'
          });
        } else {
          this.saldos.set([]);
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

  private loadSaldos(communityId: string): void {
    if (!communityId) {
      this.saldos.set([]);
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.saldoService
      .getByCommunityId(communityId)
      .pipe(catchError(() => of([])))
      .subscribe({
        next: (list) => {
          this.saldos.set(list);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('No se pudieron cargar los saldos.');
          this.saldos.set([]);
          this.isLoading.set(false);
        }
      });
  }

  onComunidadChange(value: string): void {
    this.adminContext.setSelectedCommunityId(value);
    this.selectedComunidadId.set(value);
    if (value) {
      this.loadSaldos(value);
    } else {
      this.saldos.set([]);
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { comunidad: value || null },
      queryParamsHandling: 'merge'
    });
  }

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, '0');
    const monthShort = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
    const month = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  goToNew(): void {
    const cid = this.selectedComunidadId();
    if (cid) {
      this.router.navigate(['/admincompany/saldo-banco/nuevo', cid], {
        queryParams: { comunidad: cid }
      });
    }
  }

  goToEdit(saldo: SaldoCuentaBancaria): void {
    if (saldo.id != null) {
      this.router.navigate(['/admincompany/saldo-banco/editar', saldo.id], {
        queryParams: { comunidad: this.selectedComunidadId() || null }
      });
    }
  }

  openDeleteModal(saldo: SaldoCuentaBancaria): void {
    this.saldoToDelete.set(saldo);
    setTimeout(() => {
      const modal = document.getElementById('deleteSaldoModal') as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  }

  closeDeleteModal(): void {
    const modal = document.getElementById('deleteSaldoModal') as HTMLDialogElement;
    if (modal) modal.close();
    this.saldoToDelete.set(null);
  }

  confirmDelete(): void {
    const saldo = this.saldoToDelete();
    if (!saldo?.id) return;
    this.saldoService.delete(saldo.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        const cid = this.selectedComunidadId();
        if (cid) this.loadSaldos(cid);
      },
      error: () => {
        this.errorMessage.set('No se pudo eliminar el registro.');
      }
    });
  }
}

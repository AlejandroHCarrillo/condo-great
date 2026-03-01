import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { SaldoCuentaBancariaService } from '../../../services/saldo-cuenta-bancaria.service';
import { CommunityConfigurationsService } from '../../../services/community-configurations.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import {
  CreateSaldoCuentaBancariaDto,
  UpdateSaldoCuentaBancariaDto
} from '../../../shared/interfaces/saldo-cuenta-bancaria.interface';

@Component({
  selector: 'hh-saldo-banco-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './saldo-banco-form.component.html'
})
export class SaldoBancoFormComponent implements OnInit, OnDestroy {
  private saldoService = inject(SaldoCuentaBancariaService);
  private configsService = inject(CommunityConfigurationsService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  saldoId = signal<number | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  displayedCommunityName = signal<string>('');
  /** True si en modo crear la comunidad no tiene Banco y/o Cuenta configurados. */
  configBancoCuentaFaltante = signal<boolean>(false);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  form = {
    communityId: '' as string,
    banco: '',
    cuenta: '',
    fechaSaldo: '' as string,
    monto: 0 as number
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const communityId = paramMap.get('communityId');
      const idParam = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.saldoId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
        this.loadBancoYCuentaFromConfig(communityId);
      } else if (idParam) {
        const id = Number(idParam);
        if (!Number.isNaN(id)) {
          this.isEditMode.set(true);
          this.saldoId.set(id);
          this.loadSaldo(id);
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.banco = '';
    this.form.cuenta = '';
    this.form.fechaSaldo = this.getTodayDateString();
    this.form.monto = 0;
  }

  /**
   * Carga Banco y Cuenta desde la configuración de la comunidad (BANCO, CTA_BANCO)
   * y pre-rellena el formulario al crear un nuevo saldo.
   */
  private loadBancoYCuentaFromConfig(communityId: string): void {
    if (!communityId?.trim()) {
      this.configBancoCuentaFaltante.set(false);
      return;
    }
    this.configsService.getByCommunityId(communityId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (configs) => {
        const bancoConfig = configs.find(c => (c.codigo ?? '').trim() === 'BANCO');
        const ctaConfig = configs.find(c => (c.codigo ?? '').trim() === 'CTA_BANCO');
        const bancoValor = bancoConfig?.valor?.trim() ?? '';
        const cuentaValor = ctaConfig?.valor?.trim() ?? '';
        this.form.banco = bancoValor;
        this.form.cuenta = cuentaValor;
        this.configBancoCuentaFaltante.set(!bancoValor || !cuentaValor);
      },
      error: () => {
        this.configBancoCuentaFaltante.set(false);
      }
    });
  }

  /** Al cambiar la comunidad en el formulario (modo crear), actualizar banco y cuenta desde configuración. */
  onCommunityChange(communityId: string): void {
    if (this.isEditMode()) return;
    this.loadBancoYCuentaFromConfig(communityId ?? '');
  }

  private getTodayDateString(): string {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
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
      .subscribe((dtos) => {
        this.loadedCommunities.set(dtos.map((dto) => mapCommunityDtoToComunidad(dto)));
      });
  }

  private loadSaldo(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.saldoService.getById(id).subscribe({
      next: (saldo) => {
        if (saldo) {
          this.form.communityId = saldo.communityId ?? '';
          this.form.banco = saldo.banco ?? '';
          this.form.cuenta = saldo.cuenta ?? '';
          this.form.fechaSaldo = saldo.fechaSaldo ? saldo.fechaSaldo.split('T')[0] : this.getTodayDateString();
          this.form.monto = saldo.monto ?? 0;
          this.displayedCommunityName.set(
            saldo.communityName?.trim() || this.getCommunityNameById(saldo.communityId) || '—'
          );
        } else {
          this.errorMessage.set('No se encontró el registro.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el registro.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar saldo de cuenta bancaria' : 'Nuevo saldo de cuenta bancaria';
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim();
    if (!communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    if (!this.form.banco?.trim()) {
      this.errorMessage.set('El banco es obligatorio.');
      return;
    }
    if (!this.form.cuenta?.trim()) {
      this.errorMessage.set('La cuenta es obligatoria.');
      return;
    }
    if (!this.form.fechaSaldo?.trim()) {
      this.errorMessage.set('La fecha de saldo es obligatoria.');
      return;
    }
    this.isSaving.set(true);
    const fechaSaldoIso = new Date(this.form.fechaSaldo + 'T12:00:00').toISOString();

    if (this.isEditMode()) {
      const id = this.saldoId();
      if (id == null) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateSaldoCuentaBancariaDto = {
        communityId,
        banco: this.form.banco.trim(),
        cuenta: this.form.cuenta.trim(),
        fechaSaldo: fechaSaldoIso,
        monto: Number(this.form.monto)
      };
      this.saldoService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/saldo-banco'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateSaldoCuentaBancariaDto = {
        communityId,
        banco: this.form.banco.trim(),
        cuenta: this.form.cuenta.trim(),
        fechaSaldo: fechaSaldoIso,
        monto: Number(this.form.monto)
      };
      this.saldoService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/saldo-banco'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear el registro.');
          this.isSaving.set(false);
        }
      });
    }
  }

  private getCommunityNameById(communityId: string): string {
    if (!communityId) return '';
    const list = this.comunidadesAsociadas();
    const found = list.find((c) => c.id === communityId);
    return found?.nombre ?? '';
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/saldo-banco'], this.getNavigateBackOptions());
  }
}

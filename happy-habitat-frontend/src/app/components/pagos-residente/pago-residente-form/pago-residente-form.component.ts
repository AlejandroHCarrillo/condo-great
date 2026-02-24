import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PagosResidenteService } from '../../../services/pagos-residente.service';
import { ResidentsService } from '../../../services/residents.service';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { STATUS_PAGO_OPCIONES } from '../../../shared/interfaces/pagos-residente.interface';
import type { CreatePagosResidenteDto, UpdatePagosResidenteDto } from '../../../shared/interfaces/pagos-residente.interface';

@Component({
  selector: 'hh-pago-residente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pago-residente-form.component.html'
})
export class PagoResidenteFormComponent implements OnInit, OnDestroy {
  private pagosService = inject(PagosResidenteService);
  private residentsService = inject(ResidentsService);
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  pagoId = signal<string | null>(null);
  residentIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  private residentsList = signal<Residente[]>([]);
  displayedResidentName = signal<string>('');
  selectedComunidadId = signal<string>('');
  selectedComunidadName = signal<string>('');

  readonly statusOpciones = STATUS_PAGO_OPCIONES;

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  residentsOptions = computed(() => this.residentsList());

  form = {
    residenteId: '' as string,
    fechaPago: '' as string,
    monto: 0 as number,
    status: 'PorConfirmar' as string,
    concepto: '' as string,
    urlComprobante: '' as string,
    nota: '' as string
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const residentId = paramMap.get('residentId');
      const id = paramMap.get('id');
      const qp = this.route.snapshot.queryParams;
      const comunidadId = qp['comunidad'];
      const residenteQuery = qp['residente'];

      if (id) {
        this.isEditMode.set(true);
        this.pagoId.set(id);
        this.residentIdFromRoute.set(null);
        this.loadPago(id);
      } else if (residentId) {
        this.isEditMode.set(false);
        this.pagoId.set(null);
        this.residentIdFromRoute.set(residentId);
        this.form.residenteId = residentId;
        this.form.fechaPago = new Date().toISOString().slice(0, 10);
        this.form.monto = 0;
        this.form.status = 'PorConfirmar';
        this.form.concepto = '';
        this.form.urlComprobante = '';
        this.form.nota = '';
        if (comunidadId) {
          this.selectedComunidadId.set(comunidadId);
          this.loadCommunityName(comunidadId);
        }
        this.loadResidentName(residentId);
        this.loadResidentsForCommunity();
      } else if (residenteQuery === 'all' && comunidadId) {
        this.isEditMode.set(false);
        this.pagoId.set(null);
        this.residentIdFromRoute.set(null);
        this.form.residenteId = 'all';
        this.form.fechaPago = new Date().toISOString().slice(0, 10);
        this.form.monto = 0;
        this.form.status = 'PorConfirmar';
        this.form.concepto = '';
        this.form.urlComprobante = '';
        this.form.nota = '';
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.loadCommunityName(comunidadId);
        this.loadResidentsForCommunityFromId(comunidadId);
      } else {
        const cid = comunidadId || this.adminContext.getSelectedCommunityId() || this.comunidadesAsociadas()[0]?.id;
        if (cid) {
          this.selectedComunidadId.set(cid);
          this.loadCommunityName(cid);
          this.loadResidentsForCommunityFromId(cid);
        }
      }
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qp) => {
      const comunidadId = qp['comunidad'];
      const residenteQuery = qp['residente'];
      const isEdit = !!this.route.snapshot.paramMap.get('id');
      if (comunidadId && !isEdit) {
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.loadCommunityName(comunidadId);
        this.loadResidentsForCommunityFromId(comunidadId);
        if (residenteQuery === 'all') {
          this.form.residenteId = 'all';
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  private loadResidentName(residentId: string): void {
    this.residentsService.getResidentById(residentId).subscribe({
      next: (r) => this.displayedResidentName.set(r?.fullname ? `${r.fullname} ${r.number ? '(' + r.number + ')' : ''}` : '—'),
      error: () => this.displayedResidentName.set('—')
    });
  }

  private loadResidentsForCommunity(): void {
    const communityId = this.route.snapshot.queryParams['comunidad'] || this.adminContext.getSelectedCommunityId() || this.loadedCommunities()[0]?.id;
    if (!communityId) return;
    if (!this.selectedComunidadId()) this.selectedComunidadId.set(communityId);
    this.residentsService.getResidentsByCommunityId(communityId).subscribe({
      next: (list) => this.residentsList.set(list),
      error: () => this.residentsList.set([])
    });
  }

  private loadResidentsForCommunityFromId(communityId: string): void {
    if (!communityId) return;
    this.residentsService.getResidentsByCommunityId(communityId).subscribe({
      next: (list) => this.residentsList.set(list),
      error: () => this.residentsList.set([])
    });
  }

  private loadCommunityName(communityId: string): void {
    if (!communityId) return;
    const fromList = this.comunidadesAsociadas().find((c) => c.id === communityId)?.nombre;
    if (fromList) {
      this.selectedComunidadName.set(fromList);
      return;
    }
    this.communitiesService.getCommunityById(communityId).subscribe({
      next: (dto) => this.selectedComunidadName.set(dto?.nombre ?? ''),
      error: () => this.selectedComunidadName.set('')
    });
  }

  private loadPago(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.pagosService.getById(id).subscribe({
      next: (pago) => {
        if (pago) {
          this.form.residenteId = pago.residenteId ?? '';
          this.form.fechaPago = pago.fechaPago ? pago.fechaPago.slice(0, 10) : new Date().toISOString().slice(0, 10);
          this.form.monto = pago.monto ?? 0;
          this.form.status = pago.status ?? 'PorConfirmar';
          this.form.concepto = pago.concepto ?? '';
          this.form.urlComprobante = pago.urlComprobante ?? '';
          this.form.nota = pago.nota ?? '';
          this.displayedResidentName.set(pago.residentName ? `${pago.residentName} ${pago.residentNumber ? '(' + pago.residentNumber + ')' : ''}` : '—');
          this.loadResidentsForCommunity();
        } else {
          this.errorMessage.set('No se encontró el pago.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el pago.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar pago' : 'Nuevo pago';
  }

  submit(): void {
    this.errorMessage.set(null);
    if (!this.form.residenteId?.trim()) {
      this.errorMessage.set('Debe seleccionar un residente.');
      return;
    }
    if (this.form.residenteId === 'all' && this.residentsOptions().length === 0) {
      this.errorMessage.set('No hay residentes en la comunidad para registrar pago.');
      return;
    }
    if (!this.form.fechaPago?.trim()) {
      this.errorMessage.set('La fecha de pago es obligatoria.');
      return;
    }
    if (this.form.monto < 0) {
      this.errorMessage.set('El monto no puede ser negativo.');
      return;
    }
    this.isSaving.set(true);
    const fechaIso = new Date(this.form.fechaPago).toISOString();
    const currentUser = this.authService.currentUser();

    if (this.isEditMode()) {
      const id = this.pagoId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdatePagosResidenteDto = {
        residenteId: this.form.residenteId.trim(),
        fechaPago: fechaIso,
        monto: Number(this.form.monto),
        status: this.form.status,
        concepto: this.form.concepto?.trim() || undefined,
        urlComprobante: this.form.urlComprobante?.trim() || undefined,
        nota: this.form.nota?.trim() || undefined,
        updatedByUserId: currentUser?.id ?? undefined
      };
      this.pagosService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/pagos-residente'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const residentIds =
        this.form.residenteId === 'all'
          ? this.residentsOptions()
              .map((r) => r.residentId ?? r.id)
              .filter((id): id is string => !!id)
          : [this.form.residenteId.trim()];

      if (residentIds.length === 0) {
        this.errorMessage.set('No hay residentes para registrar pago.');
        this.isSaving.set(false);
        return;
      }

      const createdByUserId = currentUser?.id ?? undefined;
      const dto: CreatePagosResidenteDto = {
        residenteId: residentIds[0],
        fechaPago: fechaIso,
        monto: Number(this.form.monto),
        status: this.form.status,
        concepto: this.form.concepto?.trim() || undefined,
        urlComprobante: this.form.urlComprobante?.trim() || undefined,
        nota: this.form.nota?.trim() || undefined,
        createdByUserId
      };

      if (residentIds.length === 1) {
        this.pagosService.create(dto).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/admincompany/pagos-residente'], this.getNavigateBackOptions());
          },
          error: () => {
            this.errorMessage.set('Error al crear el pago.');
            this.isSaving.set(false);
          }
        });
      } else {
        forkJoin(
          residentIds.map((rid) =>
            this.pagosService.create({ ...dto, residenteId: rid })
          )
        ).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/admincompany/pagos-residente'], this.getNavigateBackOptions());
          },
          error: () => {
            this.errorMessage.set('Error al crear uno o más pagos.');
            this.isSaving.set(false);
          }
        });
      }
    }
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad?: string; residente?: string } } {
    const q: { comunidad?: string; residente?: string } = {};
    const comunidad = this.route.snapshot.queryParams['comunidad'];
    const residente = this.route.snapshot.queryParams['residente'] || this.form.residenteId;
    if (comunidad) q.comunidad = comunidad;
    if (residente) q.residente = residente;
    return Object.keys(q).length ? { queryParams: q } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/pagos-residente'], this.getNavigateBackOptions());
  }
}

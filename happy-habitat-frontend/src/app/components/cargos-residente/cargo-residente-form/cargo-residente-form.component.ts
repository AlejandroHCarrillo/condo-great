import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of, from } from 'rxjs';
import { switchMap, catchError, takeUntil, concatMap, toArray } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CargosResidenteService } from '../../../services/cargos-residente.service';
import { ResidentsService } from '../../../services/residents.service';
import { AuthService } from '../../../services/auth.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { CommunityPricesService } from '../../../services/community-prices.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { CommunityPrice } from '../../../shared/interfaces/community-price.interface';
import { Residente } from '../../../shared/interfaces/residente.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { ESTATUS_CARGO_OPCIONES } from '../../../shared/interfaces/cargo-residente.interface';
import type { CreateCargoResidenteDto, UpdateCargoResidenteDto } from '../../../shared/interfaces/cargo-residente.interface';

@Component({
  selector: 'hh-cargo-residente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cargo-residente-form.component.html'
})
export class CargoResidenteFormComponent implements OnInit, OnDestroy {
  private cargosService = inject(CargosResidenteService);
  private residentsService = inject(ResidentsService);
  private authService = inject(AuthService);
  private adminContext = inject(AdminCompanyContextService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private communityPricesService = inject(CommunityPricesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  cargoId = signal<string | null>(null);
  residentIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  private residentsList = signal<Residente[]>([]);
  displayedResidentName = signal<string>('');
  selectedComunidadId = signal<string>('');
  selectedComunidadName = signal<string>('');
  /** Cargos/precios configurados para la comunidad (solo UI). */
  cargosComunidad = signal<CommunityPrice[]>([]);
  /** Cargo seleccionado en el combo (solo UI, no se persiste). */
  cargoComunidadId = '';

  readonly estatusOpciones = ESTATUS_CARGO_OPCIONES;

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  residentsOptions = computed(() => this.residentsList());

  form = {
    residentId: '' as string,
    fecha: '' as string,
    descripcion: '',
    monto: 0 as number,
    estatus: 'Activo'
  };

  /** Frecuencia (solo UI, no se persiste en el modelo). */
  frecuencia = 'Unico';

  /** Eventos (solo UI, número de veces al año según frecuencia). */
  eventos = 1;

  /** Valores por defecto de eventos según frecuencia. */
  readonly eventosPorFrecuencia: Record<string, number> = {
    Mensual: 12,
    Bimestral: 2,
    Trimestral: 4,
    Cuatrimestral: 3,
    Semestral: 2,
    Anual: 1
  };

  /** Meses a sumar por periodo según frecuencia (para calcular fechas de cada evento). */
  private readonly mesesPorFrecuencia: Record<string, number> = {
    Mensual: 1,
    Bimestral: 2,
    Trimestral: 3,
    Cuatrimestral: 4,
    Semestral: 6,
    Anual: 12
  };

  onFrecuenciaChange(): void {
    const valor = this.eventosPorFrecuencia[this.frecuencia];
    if (valor !== undefined) this.eventos = valor;
  }

  /** Suma meses a una fecha manteniendo el día; si el mes resultante no tiene ese día, se usa el último del mes. */
  private addMonths(date: Date, months: number): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setMonth(d.getMonth() + months);
    return d;
  }

  /** Formatea una fecha como "Febrero 2026" (mes en español con mayúscula inicial y año). */
  private formatMesAnio(date: Date): string {
    const month = new Intl.DateTimeFormat('es', { month: 'long' }).format(date);
    const year = date.getFullYear();
    const mesCapitalized = month.charAt(0).toUpperCase() + month.slice(1);
    return `${mesCapitalized} ${year}`;
  }

  /** Al elegir un cargo de la lista, rellenar descripción y monto con los datos del cargo. */
  onCargoComunidadChange(): void {
    const id = this.cargoComunidadId;
    if (!id) return;
    const cargo = this.cargosComunidad().find((c) => c.id === id);
    if (cargo) {
      this.form.descripcion = cargo.concepto ?? '';
      this.form.monto = cargo.monto ?? 0;
    }
  }

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
        this.cargoId.set(id);
        this.residentIdFromRoute.set(null);
        this.frecuencia = 'Unico';
        this.loadCargo(id);
      } else if (residentId) {
        this.isEditMode.set(false);
        this.cargoId.set(null);
        this.residentIdFromRoute.set(residentId);
        this.form.residentId = residentId;
        this.form.fecha = new Date().toISOString().slice(0, 10);
        this.form.descripcion = '';
        this.form.monto = 0;
        this.form.estatus = 'Activo';
        if (comunidadId) {
          this.selectedComunidadId.set(comunidadId);
          this.loadCommunityName(comunidadId);
          this.loadCargosComunidad(comunidadId);
        }
        this.frecuencia = 'Unico';
        this.loadResidentName(residentId);
        this.loadResidentsForCommunity();
      } else if (residenteQuery === 'all' && comunidadId) {
        this.isEditMode.set(false);
        this.cargoId.set(null);
        this.residentIdFromRoute.set(null);
        this.form.residentId = 'all';
        this.form.fecha = new Date().toISOString().slice(0, 10);
        this.form.descripcion = '';
        this.form.monto = 0;
        this.form.estatus = 'Activo';
        this.selectedComunidadId.set(comunidadId);
        this.adminContext.setSelectedCommunityId(comunidadId);
        this.frecuencia = 'Unico';
        this.loadCommunityName(comunidadId);
        this.loadCargosComunidad(comunidadId);
        this.loadResidentsForCommunityFromId(comunidadId);
      } else if (!id && !residentId) {
        // Ruta nuevo sin residentId: intentar comunidad desde query o contexto para cargar cargos y residentes
        const cid = comunidadId || this.adminContext.getSelectedCommunityId() || this.comunidadesAsociadas()[0]?.id;
        if (cid) {
          this.selectedComunidadId.set(cid);
          this.loadCommunityName(cid);
          this.loadCargosComunidad(cid);
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
        this.loadCargosComunidad(comunidadId);
        this.loadResidentsForCommunityFromId(comunidadId);
        if (residenteQuery === 'all') {
          this.form.residentId = 'all';
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
    this.loadCargosComunidad(communityId);
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

  private loadCargosComunidad(communityId: string): void {
    if (!communityId) return;
    this.communityPricesService.getByCommunityId(communityId).subscribe({
      next: (list) => this.cargosComunidad.set(list.filter((p) => p.isActive)),
      error: () => this.cargosComunidad.set([])
    });
  }

  private loadCargo(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cargosService.getById(id).subscribe({
      next: (cargo) => {
        if (cargo) {
          this.form.residentId = cargo.residentId ?? '';
          this.form.fecha = cargo.fecha ? cargo.fecha.slice(0, 10) : new Date().toISOString().slice(0, 10);
          this.form.descripcion = cargo.descripcion ?? '';
          this.form.monto = cargo.monto ?? 0;
          this.form.estatus = cargo.estatus ?? 'Activo';
          this.displayedResidentName.set(cargo.residentName ? `${cargo.residentName} ${cargo.residentNumber ? '(' + cargo.residentNumber + ')' : ''}` : '—');
          this.loadResidentsForCommunity();
        } else {
          this.errorMessage.set('No se encontró el cargo.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el cargo.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar cargo' : 'Nuevo cargo';
  }

  /** Nombre del residente para mostrar en el modal de confirmación. */
  get confirmacionResidenteNombre(): string {
    if (this.isEditMode()) return this.displayedResidentName();
    if (this.form.residentId === 'all') return 'Todos los residentes de la comunidad';
    const r = this.residentsOptions().find((x) => (x.residentId ?? x.id) === this.form.residentId);
    return r?.fullname ?? (this.form.residentId || '—');
  }

  /** Abre el modal de confirmación si la validación es correcta. */
  openConfirmModal(event: Event): void {
    event.preventDefault();
    this.errorMessage.set(null);
    if (!this.form.residentId?.trim()) {
      this.errorMessage.set('Debe seleccionar un residente.');
      return;
    }
    if (this.form.residentId === 'all' && this.residentsOptions().length === 0) {
      this.errorMessage.set('No hay residentes en la comunidad para crear cargos.');
      return;
    }
    if (!this.form.fecha?.trim()) {
      this.errorMessage.set('La fecha es obligatoria.');
      return;
    }
    if (this.form.monto < 0) {
      this.errorMessage.set('El monto no puede ser negativo.');
      return;
    }
    if (Number(this.form.monto) === 0) {
      const confirmarCero = window.confirm(
        'El monto es $0. ¿Confirma que desea guardar este cargo con monto cero?'
      );
      if (!confirmarCero) return;
    }
    const modal = document.getElementById('confirmSaveCargoModal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  closeConfirmModal(): void {
    const modal = document.getElementById('confirmSaveCargoModal') as HTMLDialogElement;
    if (modal) modal.close();
  }

  save(): void {
    this.closeConfirmModal();
    this.errorMessage.set(null);
    if (!this.form.residentId?.trim()) {
      this.errorMessage.set('Debe seleccionar un residente.');
      return;
    }
    if (this.form.residentId === 'all' && this.residentsOptions().length === 0) {
      this.errorMessage.set('No hay residentes en la comunidad para crear cargos.');
      this.isSaving.set(false);
      return;
    }
    if (!this.form.fecha?.trim()) {
      this.errorMessage.set('La fecha es obligatoria.');
      return;
    }
    if (this.form.monto < 0) {
      this.errorMessage.set('El monto no puede ser negativo.');
      return;
    }
    this.isSaving.set(true);

    const fechaIso = new Date(this.form.fecha).toISOString();

    if (this.isEditMode()) {
      const id = this.cargoId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateCargoResidenteDto = {
        residentId: this.form.residentId.trim(),
        fecha: fechaIso,
        descripcion: this.form.descripcion?.trim() ?? '',
        monto: Number(this.form.monto),
        estatus: this.form.estatus
      };
      this.cargosService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/cargos-residente'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const currentUser = this.authService.currentUser();
      const baseDesc = this.form.descripcion?.trim() ?? '';
      const baseMonto = Number(this.form.monto);
      const baseEstatus = this.form.estatus;
      const createdByUserId = currentUser?.id ?? undefined;

      const residentIds =
        this.form.residentId === 'all'
          ? this.residentsOptions()
              .map((r) => r.residentId ?? r.id)
              .filter((id): id is string => !!id)
          : [this.form.residentId.trim()];

      if (residentIds.length === 0) {
        this.errorMessage.set('No hay residentes para crear cargos.');
        this.isSaving.set(false);
        return;
      }

      const buildDtosForOneResident = (residentId: string): CreateCargoResidenteDto[] => {
        const baseDto: Omit<CreateCargoResidenteDto, 'fecha'> = {
          residentId,
          descripcion: baseDesc,
          monto: baseMonto,
          estatus: baseEstatus,
          createdByUserId
        };
        if (this.frecuencia === 'Unico') {
          return [{ ...baseDto, fecha: fechaIso }];
        }
        const meses = this.mesesPorFrecuencia[this.frecuencia] ?? 1;
        const [y, m, d] = this.form.fecha.split('-').map(Number);
        const initialDate = new Date(y, (m ?? 1) - 1, d ?? 1);
        const numEventos = Math.max(1, Math.floor(Number(this.eventos) || 1));
        const dtos: CreateCargoResidenteDto[] = [];
        for (let i = 0; i < numEventos; i++) {
          const eventDate = this.addMonths(initialDate, i * meses);
          const descripcion =
            numEventos > 1 ? `${baseDesc} ${this.formatMesAnio(eventDate)}` : baseDesc;
          dtos.push({ ...baseDto, descripcion, fecha: eventDate.toISOString() });
        }
        return dtos;
      };

      const allDtos = residentIds.flatMap((rid) => buildDtosForOneResident(rid));

      from(allDtos)
        .pipe(
          concatMap((dto) => this.cargosService.create(dto)),
          toArray()
        )
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/admincompany/cargos-residente'], this.getNavigateBackOptions());
          },
          error: () => {
            this.errorMessage.set('Error al crear uno o más cargos. Revise la lista de cargos.');
            this.isSaving.set(false);
          }
        });
    }
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad?: string; residente?: string } } {
    const q: { comunidad?: string; residente?: string } = {};
    const comunidad = this.route.snapshot.queryParams['comunidad'];
    const residente = this.route.snapshot.queryParams['residente'] || this.form.residentId;
    if (comunidad) q.comunidad = comunidad;
    if (residente) q.residente = residente;
    return Object.keys(q).length ? { queryParams: q } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/cargos-residente'], this.getNavigateBackOptions());
  }
}

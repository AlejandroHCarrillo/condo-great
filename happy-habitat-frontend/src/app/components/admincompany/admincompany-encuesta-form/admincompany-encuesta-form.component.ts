import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { EncuestasService } from '../../../services/encuestas.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type { CreateEncuestaDto, UpdateEncuestaDto } from '../../../shared/interfaces/encuesta.interface';

@Component({
  selector: 'hh-admincompany-encuesta-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-encuesta-form.component.html'
})
export class AdmincompanyEncuestaFormComponent implements OnInit, OnDestroy {
  private encuestasService = inject(EncuestasService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  encuestaId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  displayedCommunityName = signal<string>('');

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  form = {
    communityId: '' as string,
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: '',
    isActive: true
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((paramMap) => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.encuestaId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.encuestaId.set(id);
        this.loadEncuesta(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.titulo = '';
    this.form.descripcion = '';
    const today = new Date().toISOString().slice(0, 10);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    this.form.fechaInicio = today;
    this.form.fechaFin = nextMonth.toISOString().slice(0, 10);
    this.form.isActive = true;
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

  private loadEncuesta(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.encuestasService.getById(id).subscribe({
      next: (encuesta) => {
        if (encuesta) {
          this.form.communityId = encuesta.communityId ?? '';
          this.form.titulo = encuesta.titulo ?? '';
          this.form.descripcion = encuesta.descripcion ?? '';
          this.form.fechaInicio = encuesta.fechaInicio ? encuesta.fechaInicio.slice(0, 10) : '';
          this.form.fechaFin = encuesta.fechaFin ? encuesta.fechaFin.slice(0, 10) : '';
          this.form.isActive = encuesta.isActive ?? true;
          const name = encuesta.communityName?.trim() || this.getCommunityNameById(encuesta.communityId);
          this.displayedCommunityName.set(name || encuesta.communityId || '—');
        } else {
          this.errorMessage.set('No se encontró la encuesta.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la encuesta.');
        this.isLoading.set(false);
      }
    });
  }

  private getCommunityNameById(communityId: string): string {
    if (!communityId) return '';
    const list = this.comunidadesAsociadas();
    const found = list.find((c) => c.id === communityId);
    return found?.nombre ?? '';
  }

  get title(): string {
    return this.isEditMode() ? 'Editar encuesta' : 'Nueva encuesta';
  }

  /** Convierte fecha YYYY-MM-DD a ISO string para el backend. */
  private toIsoDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString();
    return new Date(dateStr + 'T00:00:00').toISOString();
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim();
    if (!communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    if (!this.form.titulo?.trim()) {
      this.errorMessage.set('El título es obligatorio.');
      return;
    }
    if (!this.form.fechaInicio || !this.form.fechaFin) {
      this.errorMessage.set('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    const fechaInicio = this.toIsoDate(this.form.fechaInicio);
    const fechaFin = this.toIsoDate(this.form.fechaFin);
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      this.errorMessage.set('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.encuestaId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateEncuestaDto = {
        communityId,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion?.trim() ?? '',
        fechaInicio,
        fechaFin,
        isActive: this.form.isActive
      };
      this.encuestasService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/encuestas'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateEncuestaDto = {
        communityId,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion?.trim() ?? '',
        fechaInicio,
        fechaFin,
        isActive: this.form.isActive
      };
      this.encuestasService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/encuestas'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear la encuesta.');
          this.isSaving.set(false);
        }
      });
    }
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/encuestas'], this.getNavigateBackOptions());
  }
}

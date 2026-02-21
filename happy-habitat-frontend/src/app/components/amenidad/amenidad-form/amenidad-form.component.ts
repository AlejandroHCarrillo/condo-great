import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AmenidadesService } from '../../../services/amenidades.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type { CreateAmenityDto, UpdateAmenityDto } from '../../../shared/interfaces/amenidad.interface';

@Component({
  selector: 'hh-amenidad-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './amenidad-form.component.html'
})
export class AmenidadFormComponent implements OnInit, OnDestroy {
  private amenidadesService = inject(AmenidadesService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  amenidadId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  form = {
    communityId: '' as string,
    nombre: '',
    descripcion: '',
    reglas: '',
    costo: null as number | null,
    fechaAlta: '',
    imagen: '' as string | undefined,
    capacidadMaxima: null as number | null,
    numeroReservacionesSimultaneas: null as number | null
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.amenidadId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.amenidadId.set(id);
        this.loadAmenidad(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.nombre = '';
    this.form.descripcion = '';
    this.form.reglas = '';
    this.form.costo = null;
    this.form.fechaAlta = '';
    this.form.imagen = '';
    this.form.capacidadMaxima = null;
    this.form.numeroReservacionesSimultaneas = null;
  }

  private loadCommunitiesForAdmin(userId: string): void {
    this.usersService.getUserById(userId).pipe(
      switchMap(userDto => {
        const ids = userDto.userCommunityIds;
        if (!ids?.length) return of([]);
        return forkJoin(ids.map(id => this.communitiesService.getCommunityById(id)));
      }),
      catchError(() => of([]))
    ).subscribe(dtos => {
      this.loadedCommunities.set(dtos.map(dto => mapCommunityDtoToComunidad(dto)));
    });
  }

  private loadAmenidad(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.amenidadesService.getAmenityById(id).subscribe({
      next: (amenidad) => {
        if (amenidad) {
          this.form.communityId = amenidad.communityId ?? '';
          this.form.nombre = amenidad.nombre ?? '';
          this.form.descripcion = amenidad.descripcion ?? '';
          this.form.reglas = amenidad.reglas ?? '';
          this.form.costo = amenidad.costo ?? null;
          this.form.fechaAlta = this.toInputDate(amenidad.fechaAlta);
          this.form.imagen = amenidad.imagen ?? '';
          this.form.capacidadMaxima = amenidad.capacidadMaxima ?? null;
          this.form.numeroReservacionesSimultaneas = amenidad.numeroReservacionesSimultaneas ?? null;
        } else {
          this.errorMessage.set('No se encontró la amenidad.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la amenidad.');
        this.isLoading.set(false);
      }
    });
  }

  private toInputDate(fecha: string): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  }

  get title(): string {
    return this.isEditMode() ? 'Editar amenidad' : 'Nueva amenidad';
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim();
    if (!communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    this.isSaving.set(true);

    const fechaIso = this.form.fechaAlta
      ? new Date(this.form.fechaAlta + 'T12:00:00').toISOString()
      : new Date().toISOString();

    if (this.isEditMode()) {
      const id = this.amenidadId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateAmenityDto = {
        nombre: this.form.nombre.trim(),
        descripcion: this.form.descripcion.trim(),
        reglas: this.form.reglas.trim(),
        costo: this.form.costo,
        fechaAlta: fechaIso,
        imagen: this.form.imagen?.trim() || null,
        communityId,
        capacidadMaxima: this.form.capacidadMaxima,
        numeroReservacionesSimultaneas: this.form.numeroReservacionesSimultaneas
      };
      this.amenidadesService.updateAmenity(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/amenidades'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateAmenityDto = {
        nombre: this.form.nombre.trim(),
        descripcion: this.form.descripcion.trim(),
        reglas: this.form.reglas.trim(),
        costo: this.form.costo,
        fechaAlta: fechaIso,
        imagen: this.form.imagen?.trim() || null,
        communityId,
        capacidadMaxima: this.form.capacidadMaxima,
        numeroReservacionesSimultaneas: this.form.numeroReservacionesSimultaneas
      };
      this.amenidadesService.createAmenity(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/amenidades'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear la amenidad.');
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
    this.router.navigate(['/admincompany/amenidades'], this.getNavigateBackOptions());
  }
}

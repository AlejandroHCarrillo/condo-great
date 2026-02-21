import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ComunicadosService } from '../../../services/comunicados.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { CreateComunicadoDto, UpdateComunicadoDto } from '../../../shared/interfaces/comunicado.interface';

@Component({
  selector: 'hh-comunicado-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicado-form.component.html'
})
export class ComunicadoFormComponent implements OnInit, OnDestroy {
  private comunicadosService = inject(ComunicadosService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  comunicadoId = signal<string | null>(null);
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
    communityId: '' as string | undefined,
    titulo: '',
    subtitulo: '',
    descripcion: '',
    fecha: '', // YYYY-MM-DD para input date
    imagen: '' as string | undefined
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
        this.comunicadoId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.comunicadoId.set(id);
        this.loadComunicado(id);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.titulo = '';
    this.form.subtitulo = '';
    this.form.descripcion = '';
    this.form.fecha = '';
    this.form.imagen = '';
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

  private loadComunicado(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.comunicadosService.getComunicadoById(id).subscribe({
      next: (comunicado) => {
        if (comunicado) {
          this.form.communityId = comunicado.communityId ?? '';
          this.form.titulo = comunicado.titulo ?? '';
          this.form.subtitulo = comunicado.subtitulo ?? '';
          this.form.descripcion = comunicado.descripcion ?? '';
          this.form.fecha = this.toInputDate(comunicado.fecha);
          this.form.imagen = comunicado.imagen ?? '';
        } else {
          this.errorMessage.set('No se encontró el comunicado.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el comunicado.');
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
    return this.isEditMode() ? 'Editar comunicado' : 'Nuevo comunicado';
  }

  save(): void {
    this.errorMessage.set(null);
    this.isSaving.set(true);

    const fechaIso = this.form.fecha ? new Date(this.form.fecha + 'T12:00:00').toISOString() : new Date().toISOString();
    const communityId = this.form.communityId?.trim() || undefined;

    if (this.isEditMode()) {
      const id = this.comunicadoId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateComunicadoDto = {
        communityId: communityId || null,
        titulo: this.form.titulo.trim(),
        subtitulo: this.form.subtitulo.trim(),
        descripcion: this.form.descripcion.trim(),
        fecha: fechaIso,
        imagen: this.form.imagen?.trim() || null
      };
      this.comunicadosService.updateComunicado(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/comunicados'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      if (!communityId) {
        this.errorMessage.set('Debe seleccionar una comunidad.');
        this.isSaving.set(false);
        return;
      }
      const dto: CreateComunicadoDto = {
        communityId: communityId || null,
        titulo: this.form.titulo.trim(),
        subtitulo: this.form.subtitulo.trim(),
        descripcion: this.form.descripcion.trim(),
        fecha: fechaIso,
        imagen: this.form.imagen?.trim() || null
      };
      this.comunicadosService.createComunicado(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/comunicados'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear el comunicado.');
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
    this.router.navigate(['/admincompany/comunicados'], this.getNavigateBackOptions());
  }
}

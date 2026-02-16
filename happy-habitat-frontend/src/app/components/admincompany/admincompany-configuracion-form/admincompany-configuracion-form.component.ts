import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommunityConfigurationsService } from '../../../services/community-configurations.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type {
  CreateCommunityConfigurationDto,
  UpdateCommunityConfigurationDto
} from '../../../shared/interfaces/community-configuration.interface';

@Component({
  selector: 'hh-admincompany-configuracion-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-configuracion-form.component.html'
})
export class AdmincompanyConfiguracionFormComponent implements OnInit, OnDestroy {
  private configsService = inject(CommunityConfigurationsService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  configId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  /** Nombre de la comunidad en modo edición (solo informativo). */
  displayedCommunityName = signal<string>('');

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  readonly tipoDatoOptions = [
    { value: 'string', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Sí/No' },
    { value: 'date', label: 'Fecha' },
    { value: 'json', label: 'JSON' }
  ];

  form = {
    communityId: '' as string,
    titulo: '',
    descripcion: '',
    valor: '',
    tipoDato: 'string'
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
        this.configId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.configId.set(id);
        this.loadConfig(id);
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
    this.form.valor = '';
    this.form.tipoDato = 'string';
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

  private loadConfig(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.configsService.getById(id).subscribe({
      next: (config) => {
        if (config) {
          this.form.communityId = config.communityId ?? '';
          this.form.titulo = config.titulo ?? '';
          this.form.descripcion = config.descripcion ?? '';
          this.form.valor = config.valor ?? '';
          this.form.tipoDato = config.tipoDato ?? 'string';
          const name = config.communityName?.trim() || this.getCommunityNameById(config.communityId);
          this.displayedCommunityName.set(name || config.communityId || '—');
        } else {
          this.errorMessage.set('No se encontró la configuración.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar la configuración.');
        this.isLoading.set(false);
      }
    });
  }

  get title(): string {
    return this.isEditMode() ? 'Editar configuración' : 'Nueva configuración';
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
    if (!this.form.tipoDato?.trim()) {
      this.errorMessage.set('El tipo de dato es obligatorio.');
      return;
    }
    this.isSaving.set(true);

    if (this.isEditMode()) {
      const id = this.configId();
      if (!id) {
        this.isSaving.set(false);
        return;
      }
      const dto: UpdateCommunityConfigurationDto = {
        communityId,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion?.trim() ?? '',
        valor: this.form.valor?.trim() ?? '',
        tipoDato: this.form.tipoDato.trim()
      };
      this.configsService.update(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/configuracion'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al guardar los cambios.');
          this.isSaving.set(false);
        }
      });
    } else {
      const dto: CreateCommunityConfigurationDto = {
        communityId,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion?.trim() ?? '',
        valor: this.form.valor?.trim() ?? '',
        tipoDato: this.form.tipoDato.trim()
      };
      this.configsService.create(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admincompany/configuracion'], this.getNavigateBackOptions());
        },
        error: () => {
          this.errorMessage.set('Error al crear la configuración.');
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
    this.router.navigate(['/admincompany/configuracion'], this.getNavigateBackOptions());
  }
}

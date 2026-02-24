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
import { FileService } from '../../../services/file.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import { comunicadoImageUploadPath } from '../../../constants/upload-paths';
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
  private fileService = inject(FileService);
  private imageUrlService = inject(ImageUrlService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  private static readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

  isEditMode = signal(false);
  comunicadoId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  imageError = signal<string | null>(null);
  private loadedCommunities = signal<Comunidad[]>([]);
  selectedImageFile = signal<File | null>(null);
  private imagePreviewObjectUrl = signal<string | null>(null);
  private imagePathSignal = signal<string>('');

  comunidadesAsociadas = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return [];
    if (user.communities?.length) return user.communities;
    return this.loadedCommunities().length ? this.loadedCommunities() : [];
  });

  imagenPreviewUrl = computed(() => {
    const file = this.selectedImageFile();
    if (file) {
      const url = this.imagePreviewObjectUrl();
      return url ?? null;
    }
    const path = this.imagePathSignal().trim();
    return path ? this.imageUrlService.getImageUrl(path) : null;
  });

  hasImageToShow = computed(() => !!this.selectedImageFile() || !!this.imagePathSignal().trim());

  form = {
    communityId: '' as string | undefined,
    titulo: '',
    subtitulo: '',
    contenido: '',
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
    this.clearImageSelection();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetFormExceptCommunity(): void {
    this.form.titulo = '';
    this.form.subtitulo = '';
    this.form.contenido = '';
    this.form.fecha = this.getTodayDateString();
    this.form.imagen = '';
    this.imagePathSignal.set('');
    this.clearImageSelection();
  }

  private getTodayDateString(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private clearImageSelection(): void {
    const url = this.imagePreviewObjectUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.imagePreviewObjectUrl.set(null);
    }
    this.selectedImageFile.set(null);
    this.imageError.set(null);
  }

  onImageSelect(event: Event): void {
    this.imageError.set(null);
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.imageError.set('Solo se permiten archivos de imagen.');
      input.value = '';
      return;
    }
    if (file.size > ComunicadoFormComponent.MAX_IMAGE_BYTES) {
      this.imageError.set('La imagen no debe superar 5 MB.');
      input.value = '';
      return;
    }
    const prevUrl = this.imagePreviewObjectUrl();
    if (prevUrl) URL.revokeObjectURL(prevUrl);
    this.imagePreviewObjectUrl.set(URL.createObjectURL(file));
    this.selectedImageFile.set(file);
    input.value = '';
  }

  removeImage(): void {
    this.form.imagen = '';
    this.imagePathSignal.set('');
    this.clearImageSelection();
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
          this.form.contenido = comunicado.contenido ?? '';
          this.form.fecha = this.toInputDate(comunicado.fecha);
          this.form.imagen = comunicado.imagen ?? '';
          this.imagePathSignal.set(this.form.imagen ?? '');
          this.clearImageSelection();
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
    this.imageError.set(null);
    const communityId = this.form.communityId?.trim();
    if (!this.isEditMode() && !communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }
    this.isSaving.set(true);

    const file = this.selectedImageFile();
    if (file && communityId) {
      const filename = this.imageUrlService.uniqueFileName(file.name);
      const path = comunicadoImageUploadPath(communityId, filename);
      this.fileService.uploadFile(file, path).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          this.form.imagen = res.relativePath ?? '';
          this.imagePathSignal.set(this.form.imagen);
          this.clearImageSelection();
          this.doSave(communityId);
        },
        error: () => {
          this.errorMessage.set('Error al subir la imagen.');
          this.isSaving.set(false);
        }
      });
      return;
    }
    this.doSave(communityId || undefined);
  }

  private doSave(communityId: string | undefined): void {
    const fechaIso = this.form.fecha ? new Date(this.form.fecha + 'T12:00:00').toISOString() : new Date().toISOString();

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
        contenido: this.form.contenido.trim(),
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
        contenido: this.form.contenido.trim(),
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

import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DocumentsService } from '../../../services/documents.service';
import { AuthService } from '../../../services/auth.service';
import { UsersService } from '../../../services/users.service';
import { CommunitiesService } from '../../../services/communities.service';
import { Comunidad } from '../../../interfaces/comunidad.interface';
import { RolesEnum } from '../../../enums/roles.enum';
import { mapCommunityDtoToComunidad } from '../../../shared/mappers/community.mapper';
import type { CreateDocumentoDto, UpdateDocumentoDto } from '../../../shared/interfaces/documento.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'hh-documento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documento-form.component.html'
})
export class DocumentoFormComponent implements OnInit, OnDestroy {
  private documentsService = inject(DocumentsService);
  private authService = inject(AuthService);
  private usersService = inject(UsersService);
  private communitiesService = inject(CommunitiesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  isEditMode = signal(false);
  documentId = signal<string | null>(null);
  communityIdFromRoute = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  isUploading = signal(false);
  errorMessage = signal<string | null>(null);
  /** Archivo seleccionado para subir (solo en nuevo documento o al reemplazar) */
  selectedFile = signal<File | null>(null);
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
    descripcion: '',
    fecha: '',
    userCreated: '',
    nombreDocumento: '',
    urlDoc: '',
    /** Categoría para la ruta de guardado (opcional) */
    category: ''
  };

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user?.selectedRole === RolesEnum.ADMIN_COMPANY && !user.communities?.length && user.id) {
      this.loadCommunitiesForAdmin(user.id);
    }
    if (user?.fullname && !this.form.userCreated) {
      this.form.userCreated = user.fullname.trim();
    }

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(paramMap => {
      const communityId = paramMap.get('communityId');
      const id = paramMap.get('id');
      if (communityId) {
        this.isEditMode.set(false);
        this.documentId.set(null);
        this.communityIdFromRoute.set(communityId);
        this.form.communityId = communityId;
        this.resetFormExceptCommunity();
      } else if (id) {
        this.isEditMode.set(true);
        this.documentId.set(id);
        this.loadDocument(id);
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
    this.form.fecha = '';
    this.form.userCreated = this.authService.currentUser()?.fullname?.trim() ?? '';
    this.form.nombreDocumento = '';
    this.form.urlDoc = '';
    this.form.category = '';
    this.selectedFile.set(null);
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

  private loadDocument(id: string): void {
    if (!id?.trim()) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.documentsService.getById(id).subscribe({
      next: (doc) => {
        if (doc) {
          this.form.communityId = doc.communityId ?? '';
          this.form.titulo = doc.titulo ?? '';
          this.form.descripcion = doc.descripcion ?? '';
          this.form.fecha = this.toInputDate(doc.fecha);
          this.form.userCreated = doc.userCreated ?? '';
          this.form.nombreDocumento = doc.nombreDocumento ?? '';
          this.form.urlDoc = doc.urlDoc ?? '';
        } else {
          this.errorMessage.set('No se encontró el documento.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el documento.');
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
    return this.isEditMode() ? 'Editar documento' : 'Nuevo documento';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.selectedFile.set(file ?? null);
    if (file) {
      this.form.nombreDocumento = file.name;
    }
    input.value = '';
    this.updateUrlDocFromPreview();
  }

  clearSelectedFile(): void {
    this.selectedFile.set(null);
    this.updateUrlDocFromPreview();
  }

  /** Base URL del backend sin /api (para armar URL de archivos estáticos) */
  private get baseUrl(): string {
    return (environment.apiUrl || '').replace(/\/api\/?$/, '');
  }

  /**
   * Vista previa de la URL donde se guardará el documento: comunidad/categoria/residente/nombreArchivo.
   * Se actualiza al cambiar comunidad, categoría o nombre del archivo.
   */
  getDocumentUrlPreview(): string {
    const communityId = this.form.communityId?.trim();
    if (!communityId) return '';
    const fileName = this.selectedFile()?.name || this.form.nombreDocumento?.trim();
    if (!fileName) return '';
    const categoria = this.sanitizePathSegment(this.form.category?.trim() || '');
    const residentIdSegment = 'general'; // Sin residente en el formulario por ahora
    const path = ['uploads', 'documents', communityId, categoria, residentIdSegment, fileName].join('/');
    return `${this.baseUrl}/${path}`;
  }

  /** Actualiza form.urlDoc con la vista previa cuando hay comunidad y nombre de archivo. */
  updateUrlDocFromPreview(): void {
    const communityId = this.form.communityId?.trim();
    const fileName = this.selectedFile()?.name || this.form.nombreDocumento?.trim();
    if (communityId && fileName) {
      this.form.urlDoc = this.getDocumentUrlPreview();
    }
  }

  private sanitizePathSegment(segment: string): string {
    if (!segment) return 'general';
    const sanitized = segment.replace(/[^a-zA-Z0-9\-_]/g, '');
    return sanitized || 'general';
  }

  save(): void {
    this.errorMessage.set(null);
    const communityId = this.form.communityId?.trim() || undefined;
    const file = this.selectedFile();

    if (!file && !this.form.urlDoc?.trim()) {
      this.errorMessage.set('Suba un archivo o indique la URL del documento.');
      return;
    }
    if (!this.form.titulo?.trim()) {
      this.errorMessage.set('El título es obligatorio.');
      return;
    }
    if (this.isEditMode() && !file && !this.form.nombreDocumento?.trim()) {
      this.errorMessage.set('Indique el nombre del archivo o suba uno nuevo.');
      return;
    }
    if (!this.isEditMode() && !communityId) {
      this.errorMessage.set('Debe seleccionar una comunidad.');
      return;
    }

    const doSave = (urlDoc: string, nombreDocumento: string) => {
      this.isSaving.set(true);
      const userCreated = this.authService.currentUser()?.fullname?.trim() || this.form.userCreated.trim();
      const fechaVal = this.isEditMode() && this.form.fecha
        ? new Date(this.form.fecha + 'T12:00:00').toISOString()
        : new Date().toISOString();
      const dto = {
        communityId: communityId || null,
        titulo: this.form.titulo.trim(),
        descripcion: this.form.descripcion.trim(),
        fecha: fechaVal,
        userCreated: userCreated || 'Usuario',
        nombreDocumento: nombreDocumento.trim(),
        urlDoc: urlDoc.trim()
      };

      if (this.isEditMode()) {
        const id = this.documentId();
        if (!id) {
          this.isSaving.set(false);
          return;
        }
        this.documentsService.update(id, dto as UpdateDocumentoDto).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/admincompany/documentos'], this.getNavigateBackOptions());
          },
          error: () => {
            this.errorMessage.set('Error al guardar los cambios.');
            this.isSaving.set(false);
          }
        });
      } else {
        this.documentsService.create(dto as CreateDocumentoDto).subscribe({
          next: () => {
            this.isSaving.set(false);
            this.router.navigate(['/admincompany/documentos'], this.getNavigateBackOptions());
          },
          error: () => {
            this.errorMessage.set('Error al crear el documento.');
            this.isSaving.set(false);
          }
        });
      }
    };

    if (file && communityId) {
      this.isUploading.set(true);
      this.documentsService
        .upload(file, communityId, null, this.form.category?.trim() || null)
        .subscribe({
          next: (res) => {
            const fullUrl = `${this.baseUrl}/${res.relativePath}`;
            this.form.urlDoc = fullUrl;
            this.form.nombreDocumento = res.originalFileName;
            this.isUploading.set(false);
            doSave(fullUrl, res.originalFileName);
          },
          error: () => {
            this.errorMessage.set('Error al subir el archivo.');
            this.isUploading.set(false);
          }
        });
    } else {
      doSave(this.form.urlDoc.trim(), this.form.nombreDocumento.trim());
    }
  }

  private getNavigateBackOptions(): { queryParams?: { comunidad: string } } {
    const communityId = this.communityIdFromRoute() || this.form.communityId?.trim();
    return communityId ? { queryParams: { comunidad: communityId } } : {};
  }

  cancel(): void {
    this.router.navigate(['/admincompany/documentos'], this.getNavigateBackOptions());
  }
}

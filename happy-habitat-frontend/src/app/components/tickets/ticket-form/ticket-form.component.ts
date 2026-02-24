import { Component, inject, OnInit, AfterViewInit, signal, DestroyRef, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TicketsService } from '../../../services/tickets.service';
import { FileService } from '../../../services/file.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { AdminCompanyContextService } from '../../../services/admin-company-context.service';
import { CategoriaTicketDto } from '../../../shared/interfaces/ticket.interface';
import {
  FileUploadComponent,
  type AllowedFileType,
  type MaxSizesByType
} from '../../../shared/components/file-upload/file-upload.component';
import { ticketBasePath, ticketBasePathFallback, ticketUploadPath } from '../../../constants/upload-paths';

const MAX_TICKET_ATTACHMENTS = 5;
const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 10;

@Component({
  selector: 'hh-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FileUploadComponent],
  templateUrl: './ticket-form.component.html'
})
export class TicketFormComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ticketsService = inject(TicketsService);
  private fileService = inject(FileService);
  private imageUrlService = inject(ImageUrlService);
  private adminContext = inject(AdminCompanyContextService);
  private destroyRef = inject(DestroyRef);

  /** Parámetros para el componente de archivos: imágenes y videos, máx 5, 5 MB imágenes y 10 MB videos. */
  readonly fileUploadMaxFiles = MAX_TICKET_ATTACHMENTS;
  readonly fileUploadAllowedTypes: AllowedFileType[] = ['image', 'video'];
  readonly fileUploadMaxSizes: MaxSizesByType = {
    image: MAX_IMAGE_MB * 1024 * 1024,
    video: MAX_VIDEO_MB * 1024 * 1024
  };
  /** Ruta base donde se guardarán los archivos (se completa con communityId y ticketId al subir). */
  fileUploadSavePath = computed(() => {
    const cid = this.communityId;
    if (cid && cid !== 'all') return ticketBasePath(cid);
    return ticketBasePathFallback();
  });

  /** Archivos seleccionados en el componente compartido (actualizado por filesChange). */
  selectedFiles = signal<File[]>([]);

  /** Comunidad para el ticket: parámetro de ruta o la seleccionada en el filtro (admin company). */
  get communityId(): string {
    return this.route.snapshot.paramMap.get('communityId') ?? this.adminContext.getSelectedCommunityId() ?? '';
  }
  categorias = signal<CategoriaTicketDto[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    categoriaTicketId: [0, [Validators.required, Validators.min(1)]],
    contenido: ['', [Validators.required, Validators.maxLength(4000)]]
  });

  ngOnInit(): void {
    this.ticketsService.getCategoriasTicket().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (list) => this.categorias.set(list),
      error: () => this.errorMessage.set('No se pudieron cargar las categorías.')
    });
  }

  ngAfterViewInit(): void {
    this.openRecomendacionesModal();
  }

  onFilesChange(files: File[]): void {
    this.selectedFiles.set(files);
  }

  openRecomendacionesModal(): void {
    const modal = document.getElementById('ticketRecomendacionesModal') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  closeRecomendacionesModal(): void {
    const modal = document.getElementById('ticketRecomendacionesModal') as HTMLDialogElement;
    if (modal) modal.close();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const filesToUpload = this.selectedFiles();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const communityId = this.communityId && this.communityId !== 'all' ? this.communityId : undefined;
    this.ticketsService.createTicket({
      categoriaTicketId: v.categoriaTicketId,
      contenido: v.contenido.trim() || undefined,
      ...(communityId ? { communityId } : {})
    }).pipe(
      switchMap((ticket) => {
        if (filesToUpload.length === 0) return of(ticket);
        const communityIdRes = ticket.communityId ?? this.communityId ?? '';
        const uploads = filesToUpload.map((file) => {
          const fileName = this.imageUrlService.uniqueFileName(file.name);
          const path = `${ticketUploadPath(communityIdRes, ticket.id)}/${fileName}`;
          return this.fileService.uploadFile(file, path);
        });
        return forkJoin(uploads).pipe(
          switchMap((responses) => {
            const imageUrls = responses.map((r) => r.relativePath);
            return this.ticketsService.updateTicket(ticket.id, { imageUrls });
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (ticket) => {
        this.isSubmitting.set(false);
        const isResidentSection = this.router.url.includes('/resident/tickets');
        const listPath = isResidentSection ? '/resident/tickets' : '/admincompany/residentes/tickets';
        this.router.navigate([listPath, ticket.id], {
          queryParams: isResidentSection ? {} : (this.communityId ? { comunidad: this.communityId } : {})
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('No se pudo crear el ticket o subir los archivos. Intente de nuevo.');
      }
    });
  }
}

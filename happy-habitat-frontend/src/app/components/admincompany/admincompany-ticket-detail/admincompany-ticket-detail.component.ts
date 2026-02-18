import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { TicketsService } from '../../../services/tickets.service';
import { FileService } from '../../../services/file.service';
import { UsersService } from '../../../services/users.service';
import { Ticket } from '../../../shared/interfaces/ticket.interface';
import { StatusTicketDto } from '../../../shared/interfaces/ticket.interface';
import { ComentarioDto } from '../../../shared/interfaces/ticket.interface';

@Component({
  selector: 'hh-admincompany-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admincompany-ticket-detail.component.html'
})
export class AdmincompanyTicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketsService = inject(TicketsService);
  private fileService = inject(FileService);
  private usersService = inject(UsersService);

  ticket = signal<Ticket | null>(null);
  statusList = signal<StatusTicketDto[]>([]);
  comentarios = signal<ComentarioDto[]>([]);
  isLoading = signal(true);
  isSavingStatus = signal(false);
  isSavingComment = signal(false);
  errorMessage = signal<string | null>(null);
  statusSavedMessage = signal<string | null>(null);
  nuevoComentario = signal('');

  /** ID del residente del usuario actual (para saber si es el creador del ticket). */
  currentResidentId = signal<string | null>(null);
  /** Solo el creador del ticket puede editar contenido y fotos. */
  isCreator = computed(() => {
    const t = this.ticket();
    const c = this.currentResidentId();
    return !!t && !!c && t.residentId === c;
  });
  isEditingMode = signal(false);
  editContenido = signal('');
  newImageFiles = signal<(File | null)[]>([null]);
  newImageLabels = signal<string[]>(['Sin archivos seleccionados']);
  isSavingEdit = signal(false);

  /** Imágenes para el nuevo comentario. */
  commentImageFiles = signal<(File | null)[]>([null]);
  commentImageLabels = signal<string[]>(['Sin archivos seleccionados']);

  ticketId = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? parseInt(id, 10) : null;
  });

  ngOnInit(): void {
    this.usersService.getCurrentUserResidentId().subscribe({
      next: (id) => this.currentResidentId.set(id),
      error: () => this.currentResidentId.set(null)
    });
    const id = this.ticketId();
    if (id) {
      this.loadTicket(id);
      this.loadComentarios(id);
    }
    this.ticketsService.getStatusTickets().subscribe({
      next: (list) => this.statusList.set(list),
      error: () => {}
    });
  }

  loadTicket(id: number): void {
    this.isLoading.set(true);
    this.ticketsService.getById(id).subscribe({
      next: (item) => {
        this.ticket.set(item ?? null);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/residentes/tickets']);
      }
    });
  }

  loadComentarios(ticketId: number): void {
    this.ticketsService.getComentariosByOrigen('Ticket', String(ticketId)).subscribe({
      next: (list) => this.comentarios.set(list),
      error: () => this.comentarios.set([])
    });
  }

  onStatusChange(newStatusId: number): void {
    const id = this.ticketId();
    const current = this.ticket();
    if (id == null || !current) return;
    if (current.statusId === newStatusId) return;
    this.isSavingStatus.set(true);
    this.errorMessage.set(null);
    this.ticketsService.updateTicket(id, { statusId: newStatusId }).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.isSavingStatus.set(false);
        this.statusSavedMessage.set('Guardado');
        setTimeout(() => this.statusSavedMessage.set(null), 2000);
      },
      error: () => {
        this.isSavingStatus.set(false);
        this.errorMessage.set('No se pudo guardar el estado. Intente de nuevo.');
      }
    });
  }

  submitComentario(): void {
    const texto = this.nuevoComentario().trim();
    if (!texto) return;
    const id = this.ticketId();
    if (id == null) return;
    const filesToUpload = this.commentImageFiles().filter((f): f is File => f != null && f.size > 0);
    this.isSavingComment.set(true);
    this.errorMessage.set(null);

    const basePath = `uploads/tickets/${id}/comentarios`;
    if (filesToUpload.length === 0) {
      this.ticketsService.createComentario({
        origen: 'Ticket',
        idOrigen: String(id),
        comentarioTexto: texto
      }).subscribe({
        next: () => {
          this.nuevoComentario.set('');
          this.commentImageFiles.set([null]);
          this.commentImageLabels.set(['Sin archivos seleccionados']);
          this.loadComentarios(id);
          this.isSavingComment.set(false);
        },
        error: () => {
          this.isSavingComment.set(false);
          this.errorMessage.set('No se pudo agregar el comentario.');
        }
      });
      return;
    }

    const uploads = filesToUpload.map((file) => {
      const path = `${basePath}/${this.uniqueFileName(file.name)}`;
      return this.fileService.uploadFile(file, path);
    });
    forkJoin(uploads).pipe(
      switchMap((responses) => {
        const imageUrls = responses.map((r) => r.relativePath);
        return this.ticketsService.createComentario({
          origen: 'Ticket',
          idOrigen: String(id),
          comentarioTexto: texto,
          imageUrls
        });
      })
    ).subscribe({
      next: () => {
        this.nuevoComentario.set('');
        this.commentImageFiles.set([null]);
        this.commentImageLabels.set(['Sin archivos seleccionados']);
        this.loadComentarios(id);
        this.isSavingComment.set(false);
      },
      error: () => {
        this.isSavingComment.set(false);
        this.errorMessage.set('No se pudo agregar el comentario o subir las imágenes.');
      }
    });
  }

  addCommentImage(): void {
    this.commentImageLabels.update((l) => [...l, 'Sin archivos seleccionados']);
    this.commentImageFiles.update((f) => [...f, null]);
  }

  removeCommentImageSlot(index: number): void {
    this.commentImageLabels.update((labels) => {
      const next = labels.filter((_, i) => i !== index);
      return next.length > 0 ? next : ['Sin archivos seleccionados'];
    });
    this.commentImageFiles.update((files) => {
      const next = files.filter((_, i) => i !== index);
      return next.length > 0 ? next : [null];
    });
  }

  onCommentImageSelect(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const labels = [...this.commentImageLabels()];
      const files = [...this.commentImageFiles()];
      while (labels.length <= index) {
        labels.push('Sin archivos seleccionados');
        files.push(null);
      }
      labels[index] = file.name;
      files[index] = file;
      this.commentImageLabels.set(labels);
      this.commentImageFiles.set(files);
    }
  }

  formatDate(value: string | undefined): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return isNaN(d.getTime()) ? value : d.toLocaleString('es');
    } catch {
      return value;
    }
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    this.router.navigate(['/admincompany/residentes/tickets'], {
      queryParams: comunidadId ? { comunidad: comunidadId } : {}
    });
  }

  scrollToEditar(): void {
    this.startEdit();
    document.getElementById('ticket-editar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  startEdit(): void {
    const t = this.ticket();
    if (!t) return;
    this.editContenido.set(t.contenido ?? '');
    this.newImageFiles.set([null]);
    this.newImageLabels.set(['Sin archivos seleccionados']);
    this.isEditingMode.set(true);
  }

  cancelEdit(): void {
    this.isEditingMode.set(false);
  }

  private uniqueFileName(originalName: string): string {
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '.jpg';
    const guid = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `${guid}${ext}`;
  }

  saveEdit(): void {
    const id = this.ticketId();
    const t = this.ticket();
    if (id == null || !t) return;
    const newFiles = this.newImageFiles().filter((f): f is File => f != null && f.size > 0);
    this.isSavingEdit.set(true);
    this.errorMessage.set(null);
    const newContenido = this.editContenido().trim() || undefined;
    const existingUrls = t.imageUrls ?? [];
    if (newFiles.length === 0) {
      this.ticketsService.updateTicket(id, { contenido: newContenido }).subscribe({
        next: (updated) => {
          this.ticket.set(updated);
          this.isEditingMode.set(false);
          this.isSavingEdit.set(false);
        },
        error: () => {
          this.isSavingEdit.set(false);
          this.errorMessage.set('No se pudo guardar. Intente de nuevo.');
        }
      });
      return;
    }
    const uploads = newFiles.map((file) => {
      const path = `uploads/tickets/${id}/${this.uniqueFileName(file.name)}`;
      return this.fileService.uploadFile(file, path);
    });
    forkJoin(uploads).pipe(
      switchMap((responses) => {
        const newUrls = responses.map((r) => r.relativePath);
        const allUrls = [...existingUrls, ...newUrls];
        return this.ticketsService.updateTicket(id, { contenido: newContenido, imageUrls: allUrls });
      })
    ).subscribe({
      next: (updated) => {
        this.ticket.set(updated);
        this.isEditingMode.set(false);
        this.isSavingEdit.set(false);
      },
      error: () => {
        this.isSavingEdit.set(false);
        this.errorMessage.set('No se pudo guardar o subir las fotos. Intente de nuevo.');
      }
    });
  }

  addNewImage(): void {
    this.newImageLabels.update((l) => [...l, 'Sin archivos seleccionados']);
    this.newImageFiles.update((f) => [...f, null]);
  }

  removeNewImageSlot(index: number): void {
    this.newImageLabels.update((labels) => {
      const next = labels.filter((_, i) => i !== index);
      return next.length > 0 ? next : ['Sin archivos seleccionados'];
    });
    this.newImageFiles.update((files) => {
      const next = files.filter((_, i) => i !== index);
      return next.length > 0 ? next : [null];
    });
  }

  onNewImageSelect(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const labels = [...this.newImageLabels()];
      const files = [...this.newImageFiles()];
      while (labels.length <= index) {
        labels.push('Sin archivos seleccionados');
        files.push(null);
      }
      labels[index] = file.name;
      files[index] = file;
      this.newImageLabels.set(labels);
      this.newImageFiles.set(files);
    }
  }

  /** Devuelve las URLs de imágenes del comentario (compatibles con API en camelCase o PascalCase). */
  getCommentImageUrls(c: ComentarioDto): string[] {
    const urls = (c as { imageUrls?: string[] | null; ImageUrls?: string[] }).imageUrls
      ?? (c as { ImageUrls?: string[] }).ImageUrls;
    return Array.isArray(urls) ? urls : [];
  }

  /** URL para mostrar imágenes del ticket o comentarios (rutas relativas o absolutas). */
  getImageUrl(relativePath: string): string {
    const path = (relativePath || '').trim().replace(/\\/g, '/');
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = (environment.apiUrl || '').replace(/\/api\/?$/, '');
    const pathNorm = path.replace(/^\/+/, '');
    return pathNorm ? `${base}/${pathNorm}` : '';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      const parent = img.parentElement;
      if (parent && !parent.querySelector('.image-error-msg')) {
        const msg = document.createElement('span');
        msg.className = 'image-error-msg text-sm text-base-content/60 italic';
        msg.textContent = 'No se pudo cargar la imagen';
        parent.appendChild(msg);
      }
    }
  }
}

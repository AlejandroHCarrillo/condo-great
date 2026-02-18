import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketsService } from '../../../services/tickets.service';
import { CategoriaTicketDto } from '../../../shared/interfaces/ticket.interface';

@Component({
  selector: 'hh-admincompany-ticket-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admincompany-ticket-form.component.html'
})
export class AdmincompanyTicketFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private ticketsService = inject(TicketsService);

  communityId = this.route.snapshot.paramMap.get('communityId') ?? '';
  categorias = signal<CategoriaTicketDto[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  imageLabels = signal<string[]>(['Sin archivos seleccionados']);
  /** Archivos por slot (mismo orden que imageLabels), para futura subida. */
  imageFiles = signal<(File | null)[]>([null]);
  isDragOver = signal(false);

  form = this.fb.nonNullable.group({
    categoriaTicketId: [0, [Validators.required, Validators.min(1)]],
    contenido: ['', [Validators.required, Validators.maxLength(4000)]]
  });

  ngOnInit(): void {
    this.ticketsService.getCategoriasTicket().subscribe({
      next: (list) => this.categorias.set(list),
      error: () => this.errorMessage.set('No se pudieron cargar las categorías.')
    });
  }

  onImageSelect(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      const labels = [...this.imageLabels()];
      const files = [...this.imageFiles()];
      while (labels.length <= index) {
        labels.push('Sin archivos seleccionados');
        files.push(null);
      }
      labels[index] = file.name;
      files[index] = file;
      this.imageLabels.set(labels);
      this.imageFiles.set(files);
    }
  }

  addImage(): void {
    this.imageLabels.update(l => [...l, 'Sin archivos seleccionados']);
    this.imageFiles.update(f => [...f, null]);
  }

  removeImageSlot(index: number): void {
    this.imageLabels.update(labels => {
      const next = labels.filter((_, i) => i !== index);
      return next.length > 0 ? next : ['Sin archivos seleccionados'];
    });
    this.imageFiles.update(files => {
      const next = files.filter((_, i) => i !== index);
      return next.length > 0 ? next : [null];
    });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const items = event.dataTransfer?.files;
    if (!items?.length) return;
    const imageFilesList = Array.from(items).filter(f => f.type.startsWith('image/'));
    if (imageFilesList.length === 0) return;
    const labels = [...this.imageLabels()];
    const files = [...this.imageFiles()];
    for (const file of imageFilesList) {
      labels.push(file.name);
      files.push(file);
    }
    this.imageLabels.set(labels);
    this.imageFiles.set(files);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.ticketsService.createTicket({
      categoriaTicketId: v.categoriaTicketId,
      contenido: v.contenido.trim() || undefined
    }).subscribe({
      next: (ticket) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admincompany/residentes/tickets', ticket.id], {
          queryParams: this.communityId ? { comunidad: this.communityId } : {}
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('No se pudo crear el ticket. Intente de nuevo.');
      }
    });
  }
}

import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Tipos de archivo permitidos. Por defecto solo documentos. */
export type AllowedFileType = 'image' | 'video' | 'document';

/** Tamaños máximos por tipo (bytes). Por defecto: 5 MB documentos/imágenes, 10 MB videos. */
export interface MaxSizesByType {
  image?: number;
  video?: number;
  document?: number;
}

const DEFAULT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;  // 5 MB
const DEFAULT_MAX_VIDEO_BYTES = 10 * 1024 * 1024; // 10 MB
const DEFAULT_MAX_DOCUMENT_BYTES = 5 * 1024 * 1024; // 5 MB

function getFileCategory(file: File): AllowedFileType {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'document';
}

function getAcceptAttribute(types: AllowedFileType[]): string {
  const parts: string[] = [];
  if (types.includes('image')) parts.push('image/*');
  if (types.includes('video')) parts.push('video/*');
  if (types.includes('document')) {
    parts.push(
      '.pdf,.doc,.docx,.xls,.xlsx',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  }
  return parts.join(',');
}

function getTypeLabel(types: AllowedFileType[]): string {
  const labels: string[] = [];
  if (types.includes('image')) labels.push('imágenes');
  if (types.includes('video')) labels.push('videos');
  if (types.includes('document')) labels.push('documentos');
  return labels.join(', ') || 'documentos';
}

@Component({
  selector: 'hh-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent {
  /** Número máximo de archivos. Por defecto 10. */
  maxFiles = input<number>(10);

  /** Tipos permitidos. Por defecto solo documentos. */
  allowedTypes = input<AllowedFileType[]>(['document']);

  /** Ruta donde se guardarán los archivos (obligatoria). Si no se define se muestra mensaje. */
  savePath = input<string>('');

  /** Tamaños máximos por tipo (bytes). Por defecto: 5 MB docs/imágenes, 10 MB videos. */
  maxSizesByType = input<MaxSizesByType | undefined>(undefined);

  /** Emite la lista actual de archivos seleccionados (solo los válidos, sin null). */
  filesChange = output<File[]>();

  /** Identificador único para inputs (evitar colisiones si hay varios en la página). */
  componentId = input<string>('file-upload');

  labels = signal<string[]>(['Sin archivos seleccionados']);
  files = signal<(File | null)[]>([null]);
  isDragOver = signal(false);
  fileError = signal<string | null>(null);

  /** Ruta definida para mostrar/ocultar mensaje de advertencia. */
  hasValidPath = computed(() => (this.savePath() ?? '').trim().length > 0);

  /** Atributo accept para el input file según allowedTypes. */
  acceptAttr = computed(() => getAcceptAttribute(this.allowedTypes()));

  /** Etiqueta de tipos para mensajes (ej. "imágenes, videos"). */
  typesLabel = computed(() => getTypeLabel(this.allowedTypes()));

  /** Tamaño máximo en MB para un tipo (para mensajes). */
  maxSizeMbForCategory = (category: AllowedFileType): number => {
    const sizes = this.maxSizesByType();
    const defaultMap: MaxSizesByType = {
      image: DEFAULT_MAX_IMAGE_BYTES,
      video: DEFAULT_MAX_VIDEO_BYTES,
      document: DEFAULT_MAX_DOCUMENT_BYTES
    };
    const bytes = sizes?.[category] ?? defaultMap[category] ?? DEFAULT_MAX_DOCUMENT_BYTES;
    return bytes / (1024 * 1024);
  };

  /** Texto con límites por tipo para la ayuda (ej. "5 MB imágenes/documentos, 10 MB videos"). */
  helpSizeText = computed(() => {
    const types = this.allowedTypes();
    const parts: string[] = [];
    if (types.includes('image')) parts.push(`${this.maxSizeMbForCategory('image')} MB imágenes`);
    if (types.includes('video')) parts.push(`${this.maxSizeMbForCategory('video')} MB videos`);
    if (types.includes('document')) parts.push(`${this.maxSizeMbForCategory('document')} MB documentos`);
    return parts.join(', ');
  });

  /** Obtiene el límite en bytes para un archivo según su tipo. */
  private getMaxBytesForFile(file: File): number {
    const category = getFileCategory(file);
    const sizes = this.maxSizesByType();
    const defaultMap: Record<AllowedFileType, number> = {
      image: DEFAULT_MAX_IMAGE_BYTES,
      video: DEFAULT_MAX_VIDEO_BYTES,
      document: DEFAULT_MAX_DOCUMENT_BYTES
    };
    return sizes?.[category] ?? defaultMap[category];
  }

  private isAllowedType(file: File): boolean {
    const category = getFileCategory(file);
    return this.allowedTypes().includes(category);
  }

  private isFileSizeValid(file: File): boolean {
    if (file.size <= 0) return false;
    const max = this.getMaxBytesForFile(file);
    return file.size <= max;
  }

  private emitFiles(): void {
    const valid = this.files().filter((f): f is File => f != null && f.size > 0);
    this.filesChange.emit(valid);
  }

  onFileSelect(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.fileError.set(null);
    if (!this.isAllowedType(file)) {
      this.fileError.set(
        `Solo se permiten ${this.typesLabel()}. "${file.name}" no es un tipo válido.`
      );
      input.value = '';
      return;
    }
    const maxMb = this.maxSizeMbForCategory(getFileCategory(file));
    if (!this.isFileSizeValid(file)) {
      this.fileError.set(
        `El archivo "${file.name}" supera el límite de ${maxMb} MB.`
      );
      input.value = '';
      return;
    }
    const labels = [...this.labels()];
    const files = [...this.files()];
    while (labels.length <= index) {
      labels.push('Sin archivos seleccionados');
      files.push(null);
    }
    labels[index] = file.name;
    files[index] = file;
    this.labels.set(labels);
    this.files.set(files);
    this.emitFiles();
    input.value = '';
  }

  addSlot(): void {
    if (this.labels().length >= this.maxFiles()) return;
    this.fileError.set(null);
    this.labels.update((l) => [...l, 'Sin archivos seleccionados']);
    this.files.update((f) => [...f, null]);
  }

  removeSlot(index: number): void {
    this.fileError.set(null);
    this.labels.update((labels) => {
      const next = labels.filter((_, i) => i !== index);
      return next.length > 0 ? next : ['Sin archivos seleccionados'];
    });
    this.files.update((files) => {
      const next = files.filter((_, i) => i !== index);
      return next.length > 0 ? next : [null];
    });
    this.emitFiles();
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
    const items = Array.from(event.dataTransfer?.files ?? []);
    if (items.length === 0) return;
    this.fileError.set(null);
    const toAdd: File[] = [];
    for (const file of items) {
      if (!this.isAllowedType(file)) {
        this.fileError.set(
          `Solo se permiten ${this.typesLabel()}. "${file.name}" no es un tipo válido.`
        );
        return;
      }
      const maxMb = this.maxSizeMbForCategory(getFileCategory(file));
      if (!this.isFileSizeValid(file)) {
        this.fileError.set(
          `El archivo "${file.name}" supera el límite de ${maxMb} MB.`
        );
        return;
      }
      toAdd.push(file);
    }
    const currentFiles = this.files();
    const currentCount = currentFiles.filter((f): f is File => f != null && f.size > 0).length;
    const slotsLeft = this.maxFiles() - currentCount;
    if (slotsLeft <= 0) {
      this.fileError.set(`Máximo ${this.maxFiles()} archivos.`);
      return;
    }
    const toInsert = toAdd.slice(0, slotsLeft);
    const labels = [...this.labels()];
    const files = [...this.files()];
    let inserted = 0;
    for (let i = 0; i < files.length && inserted < toInsert.length; i++) {
      if (files[i] == null || (files[i] as File).size === 0) {
        files[i] = toInsert[inserted];
        labels[i] = toInsert[inserted].name;
        inserted++;
      }
    }
    while (inserted < toInsert.length && labels.length < this.maxFiles()) {
      labels.push(toInsert[inserted].name);
      files.push(toInsert[inserted]);
      inserted++;
    }
    if (toAdd.length > toInsert.length) {
      this.fileError.set(
        `Máximo ${this.maxFiles()} archivos. Se agregaron ${inserted} de ${toAdd.length}.`
      );
    }
    this.labels.set(labels);
    this.files.set(files);
    this.emitFiles();
  }

  /** Devuelve la lista actual de archivos válidos (para uso desde el padre si lo necesita). */
  getSelectedFiles(): File[] {
    return this.files().filter((f): f is File => f != null && f.size > 0);
  }

  /** Vuelve al estado inicial (un slot vacío). Útil tras enviar un formulario. */
  reset(): void {
    this.fileError.set(null);
    this.labels.set(['Sin archivos seleccionados']);
    this.files.set([null]);
    this.emitFiles();
  }
}

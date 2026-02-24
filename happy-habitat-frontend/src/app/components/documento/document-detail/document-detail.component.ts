import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentsService } from '../../../services/documents.service';
import { Documento } from '../../../shared/interfaces/documento.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-document-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './document-detail.component.html'
})
export class DocumentDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private documentsService = inject(DocumentsService);
  private authService = inject(AuthService);

  document = signal<Documento | null>(null);
  isLoading = signal<boolean>(true);
  isDownloading = signal<boolean>(false);
  downloadError = signal<string | null>(null);

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) this.loadDocument(id);
    });
  }

  loadDocument(id: string): void {
    this.isLoading.set(true);
    this.documentsService.getById(id).subscribe({
      next: (item) => {
        this.document.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/documentos']);
      }
    });
  }

  getComunidadNombre(doc: Documento): string {
    return doc.communityName ?? this.authService.currentUser()?.communities?.find(c => c.id === doc.communityId)?.nombre ?? 'Sin comunidad';
  }

  formatFecha(fecha: string): string {
    if (!fecha) return '-';
    try {
      const d = new Date(fecha);
      return isNaN(d.getTime()) ? fecha : d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return fecha;
    }
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/documentos'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/documentos']);
    }
  }

  downloadDocument(): void {
    const doc = this.document();
    if (!doc?.id) return;
    this.downloadError.set(null);
    this.isDownloading.set(true);
    this.documentsService.download(doc.id, doc.nombreDocumento || undefined).subscribe({
      next: () => this.isDownloading.set(false),
      error: (err) => {
        this.isDownloading.set(false);
        if (err?.status === 403) {
          this.downloadError.set('No tiene permiso para descargar este documento.');
        } else if (err?.status === 401) {
          this.downloadError.set('Debe iniciar sesión para descargar.');
        } else if (err?.status === 404) {
          this.downloadError.set('El archivo no está en el servidor. Use «Abrir en nueva pestaña» si el enlace está disponible.');
        } else {
          this.downloadError.set('No se pudo descargar el archivo.');
        }
      }
    });
  }
}

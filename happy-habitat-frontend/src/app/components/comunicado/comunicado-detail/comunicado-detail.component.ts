import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../../services/comunicados.service';
import { ImageUrlService } from '../../../services/image-url.service';
import { Comunicado } from '../../../shared/interfaces/comunicado.interface';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'hh-comunicado-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './comunicado-detail.component.html'
})
export class ComunicadoDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private comunicadosService = inject(ComunicadosService);
  private authService = inject(AuthService);
  private imageUrlService = inject(ImageUrlService);

  comunicado = signal<Comunicado | null>(null);
  isLoading = signal<boolean>(true);

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadComunicado(id);
      }
    });
  }

  loadComunicado(id: string): void {
    this.isLoading.set(true);
    this.comunicadosService.getComunicadoById(id).subscribe({
      next: (item) => {
        this.comunicado.set(item);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admincompany/comunicados']);
      }
    });
  }

  getComunidadNombre(comunicado: Comunicado): string {
    return comunicado.communityName ?? this.authService.currentUser()?.communities?.find(c => c.id === comunicado.communityId)?.nombre ?? 'Sin comunidad';
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

  /** Imagen placeholder cuando no hay imagen o falla la carga. */
  readonly placeholderImage = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
    '<rect width="200" height="150" fill="#e2e8f0"/>' +
    '<path d="M70 45h60v60H70V45zm2 2v56h56V47H72zm20 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-18 22l12-14 8 10 12-16 14 20H72l2-10z" fill="#94a3b8"/>' +
    '</svg>'
  );

  getImagenUrl(relativePath: string | null | undefined): string {
    if (!relativePath?.trim()) return '';
    return this.imageUrlService.getImageUrl(relativePath);
  }

  getComunicadoImageSrc(comunicado: Comunicado | null): string {
    if (!comunicado?.imagen) return this.placeholderImage;
    return this.getImagenUrl(comunicado.imagen);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.placeholderImage;
  }

  goBack(): void {
    const comunidadId = this.route.snapshot.queryParams['comunidad'];
    if (comunidadId) {
      this.router.navigate(['/admincompany/comunicados'], { queryParams: { comunidad: comunidadId } });
    } else {
      this.router.navigate(['/admincompany/comunicados']);
    }
  }
}

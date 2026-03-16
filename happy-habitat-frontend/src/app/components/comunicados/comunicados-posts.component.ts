import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComunicadosService } from '../../services/comunicados.service';
import { Comunicado } from '../../shared/interfaces/comunicado.interface';
import { catchError, of, tap } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'hh-comunicados-posts',
  imports: [CommonModule, DatePipe],
  templateUrl: './comunicados-posts.component.html',
  styles: ``
})
export class ComunicadosPostsComponent {
  private comunicadosService = inject(ComunicadosService);

  // Signal para rastrear el estado de carga
  private isLoadingState = signal(true);

  // Usar toSignal para convertir el observable a una señal
  // Obtiene los primeros 20 comunicados ordenados del más reciente al más antiguo
  private comunicadosResource = toSignal(
    this.comunicadosService.getComunicadosPaginated(1, 20).pipe(
      catchError((error) => {
        console.error('Error loading comunicados', error);
        this.isLoadingState.set(false);
        return of([]);
      }),
      tap(() => {
        // Cuando el observable emite un valor, la carga está completa
        this.isLoadingState.set(false);
      })
    ),
    { initialValue: [] as Comunicado[] }
  );

  // Comunicados obtenidos del resource
  comunicados = computed(() => {
    return this.comunicadosResource() ?? [];
  });

  // Estado de carga basado en el signal de estado
  isLoading = computed(() => {
    return this.isLoadingState();
  });

  /** Imagen placeholder cuando el comunicado no tiene imagen o falla la carga. */
  readonly placeholderImage = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">' +
    '<rect width="200" height="150" fill="#e2e8f0"/>' +
    '<path d="M70 45h60v60H70V45zm2 2v56h56V47H72zm20 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm0 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-18 22l12-14 8 10 12-16 14 20H72l2-10z" fill="#94a3b8"/>' +
    '</svg>'
  );

  getFechaDate(fecha: string): Date {
    return new Date(fecha);
  }

  getImagePath(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('/')) return path;
    return `/${path}`;
  }

  /** Devuelve la URL de la imagen del comunicado o la imagen placeholder si no hay. */
  getComunicadoImageSrc(comunicado: Comunicado): string {
    return comunicado?.imagen ? this.getImagePath(comunicado.imagen) : this.placeholderImage;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.placeholderImage;
    }
  }
}

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComunicadosService } from '../../services/comunicados.service';
import { Comunicado } from '../../shared/interfaces/comunicado.interface';
import { catchError, of, tap } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'hh-comunicados-list',
  imports: [CommonModule, DatePipe],
  templateUrl: './comunicados-list.component.html',
  styles: ``
})
export class ComunicadosListComponent {
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

  /**
   * Obtiene la ruta correcta de la imagen
   * Asegura que la ruta comience con / si no lo hace
   */
  getImagePath(path: string | null | undefined): string {
    if (!path) return '';
    // Si la ruta ya comienza con /, la devolvemos tal cual
    if (path.startsWith('/')) {
      return path;
    }
    // Si no, agregamos el / al inicio
    return `/${path}`;
  }

  /**
   * Convierte la fecha string ISO a Date para el pipe de fecha
   * El backend envía fechas en formato ISO string
   */
  getFechaDate(fecha: string): Date {
    return new Date(fecha);
  }

  /**
   * Maneja errores al cargar imágenes
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.warn('Error loading comunicado image:', img.src);
      // Ocultar la imagen si falla
      img.style.display = 'none';
    }
  }
}

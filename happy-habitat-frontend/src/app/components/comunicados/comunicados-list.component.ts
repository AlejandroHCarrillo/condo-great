import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../services/comunicados.service';
import { AuthService } from '../../services/auth.service';
import { Comunicado } from '../../shared/interfaces/comunicado.interface';
import { catchError, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CommunityFilterComponent } from '../../shared/components/community-filter/community-filter.component';

@Component({
  selector: 'hh-comunicados-list',
  imports: [CommonModule, DatePipe, RouterLink, CommunityFilterComponent],
  templateUrl: './comunicados-list.component.html',
  styles: ``
})
export class ComunicadosListComponent implements OnInit {
  private comunicadosService = inject(ComunicadosService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  selectedComunidadId = signal<string>('');
  private comunicadosState = signal<Comunicado[]>([]);
  private isLoadingState = signal(false);

  comunidadesAsociadas = computed(
    () => (this.authService.currentUser()?.communities ?? []) as { id?: string; nombre: string }[]
  );

  comunicados = computed(() => this.comunicadosState());
  isLoading = computed(() => this.isLoadingState());

  constructor() {
    effect(() => {
      const id = this.selectedComunidadId();
      if (id) {
        this.loadByCommunity(id);
      } else {
        this.comunicadosState.set([]);
      }
    });
  }

  ngOnInit(): void {
    const initial = this.route.snapshot.queryParams['comunidad'];
    if (initial) this.selectedComunidadId.set(initial);
    this.route.queryParams.subscribe((params) => {
      this.selectedComunidadId.set(params['comunidad'] ?? '');
    });
  }

  onComunidadChange(comunidadId: string): void {
    this.selectedComunidadId.set(comunidadId);
    this.router.navigate([], { queryParams: { comunidad: comunidadId || null }, queryParamsHandling: 'merge' });
  }

  private loadByCommunity(communityId: string): void {
    this.isLoadingState.set(true);
    this.comunicadosService.getComunicadosByCommunityId(communityId).pipe(
      catchError((err) => {
        console.error('Error loading comunicados', err);
        return of([]);
      })
    ).subscribe((list) => {
      this.comunicadosState.set(list ?? []);
      this.isLoadingState.set(false);
    });
  }

  /** Imagen placeholder cuando el comunicado no tiene imagen o falla la carga. */
  readonly placeholderImage = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
    '<rect width="80" height="80" fill="#e2e8f0"/>' +
    '<path d="M25 22h30v36H25V22zm2 2v32h26V24H27zm4 4h18v4H31v-4zm0 6h18v4H31v-4zm0 6h12v4H31v-4z" fill="#94a3b8"/>' +
    '</svg>'
  );

  /**
   * Obtiene la ruta correcta de la imagen
   * Asegura que la ruta comience con / si no lo hace
   */
  getImagePath(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('/')) return path;
    return `/${path}`;
  }

  /**
   * Devuelve la URL de la imagen del comunicado o la imagen placeholder si no hay.
   */
  getComunicadoImageSrc(comunicado: Comunicado): string {
    return comunicado?.imagen ? this.getImagePath(comunicado.imagen) : this.placeholderImage;
  }

  /**
   * Convierte la fecha string ISO a Date para el pipe de fecha
   * El backend envía fechas en formato ISO string
   */
  getFechaDate(fecha: string): Date {
    return new Date(fecha);
  }

  /**
   * Maneja errores al cargar imágenes; muestra el placeholder.
   */
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = this.placeholderImage;
    }
  }
}

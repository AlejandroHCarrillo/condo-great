import { Injectable, signal, computed } from '@angular/core';

/**
 * Guarda la comunidad seleccionada en el área Admin Company para mantenerla
 * al navegar entre Comunicados, Residentes y Amenidades.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminCompanyContextService {
  /** ID de la comunidad actualmente seleccionada (o '' / 'all'). */
  private readonly selectedCommunityId = signal<string>('');
  /** Nombre de la comunidad seleccionada (para mostrar en el header). */
  private readonly selectedCommunityName = signal<string>('');

  /** Lectura de la comunidad seleccionada. */
  readonly selectedId = computed(() => this.selectedCommunityId());
  /** Nombre de la comunidad seleccionada para mostrar en el header. */
  readonly selectedName = computed(() => this.selectedCommunityName());

  /**
   * Actualiza la comunidad seleccionada.
   * @param id ID de la comunidad (o '' / 'all').
   * @param name Nombre de la comunidad; si no se pasa, se limpia (el header no mostrará la línea).
   */
  setSelectedCommunityId(id: string, name?: string): void {
    this.selectedCommunityId.set(id ?? '');
    this.selectedCommunityName.set(name ?? '');
  }

  getSelectedCommunityId(): string {
    return this.selectedCommunityId();
  }
}

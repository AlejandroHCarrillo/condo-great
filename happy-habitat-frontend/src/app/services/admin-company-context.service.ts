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

  /** Lectura de la comunidad seleccionada. */
  readonly selectedId = computed(() => this.selectedCommunityId());

  setSelectedCommunityId(id: string): void {
    this.selectedCommunityId.set(id ?? '');
  }

  getSelectedCommunityId(): string {
    return this.selectedCommunityId();
  }
}

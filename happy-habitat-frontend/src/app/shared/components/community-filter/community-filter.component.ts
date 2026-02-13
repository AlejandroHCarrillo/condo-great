import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** Item mínimo para el select (id y nombre). */
export interface CommunityFilterItem {
  id?: string;
  nombre: string;
}

@Component({
  selector: 'hh-community-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-filter.component.html'
})
export class CommunityFilterComponent {
  /** Lista de comunidades para el select. */
  communities = input.required<CommunityFilterItem[]>();
  /** Valor seleccionado (id o 'all'). */
  selectedId = input.required<string>();
  /** Si true, muestra la opción "Todas las comunidades". */
  showAllOption = input<boolean>(false);

  /** Emite el id seleccionado cuando cambia (string o 'all'). */
  selectedIdChange = output<string>();

  onSelectionChange(value: string): void {
    this.selectedIdChange.emit(value);
  }
}

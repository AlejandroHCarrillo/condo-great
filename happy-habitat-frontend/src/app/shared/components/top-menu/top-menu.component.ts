import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface TopMenuItem {
  route: string;
  label: string;
  icon: string;
  /** Texto opcional del badge (ej. número de notificaciones). */
  badge?: string;
}

@Component({
  selector: 'hh-top-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-menu.component.html'
})
export class TopMenuComponent {
  /** Lista de ítems del menú (ruta, etiqueta, icono). */
  menuItems = input.required<TopMenuItem[]>();
}

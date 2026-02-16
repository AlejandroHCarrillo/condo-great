import { Component } from '@angular/core';
import { TopMenuComponent, type TopMenuItem } from '../../../shared/components/top-menu/top-menu.component';

@Component({
  selector: 'hh-resident-top-menu',
  imports: [TopMenuComponent],
  templateUrl: './resident-top-menu.component.html'
})
export class ResidentTopMenuComponent {
  readonly menuItems: TopMenuItem[] = [
    { route: 'visitantes', label: 'Visitantes', icon: 'fa-solid fa-user-group' },
    { route: 'mascotas', label: 'Mascotas', icon: 'fa-solid fa-paw' },
    { route: 'autos', label: 'Autos', icon: 'fa-solid fa-car' },
    { route: 'preferencias', label: 'Preferencias', icon: 'fa-solid fa-sliders' },
    { route: 'encuestas', label: 'Encuestas', icon: 'fa-solid fa-clipboard-list' },
    { route: 'pagos', label: 'Pagos', icon: 'fa-solid fa-money-bill-1-wave' },
    { route: 'tickets', label: 'Tickets', icon: 'fa-solid fa-ticket' },
    { route: 'reservaciones', label: 'Reservar', icon: 'fa-regular fa-address-book' }
  ];
}

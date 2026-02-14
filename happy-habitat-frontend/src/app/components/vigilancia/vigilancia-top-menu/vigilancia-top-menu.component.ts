import { Component } from '@angular/core';
import { TopMenuComponent, type TopMenuItem } from '../../../shared/components/top-menu/top-menu.component';

@Component({
  selector: 'hh-vigilancia-top-menu',
  imports: [TopMenuComponent],
  templateUrl: './vigilancia-top-menu.component.html'
})
export class VigilanciaTopMenuComponent {
  readonly menuItems: TopMenuItem[] = [
    { route: 'residentes', label: 'Residentes', icon: 'fa-solid fa-people-group' },
    { route: 'reservaciones', label: 'Reservaciones', icon: 'fa-solid fa-calendar-check' },
    { route: 'incidentes', label: 'Incidentes', icon: 'fa-solid fa-triangle-exclamation' },
    { route: 'tickets', label: 'Tickets', icon: 'fa-solid fa-ticket' }
  ];
}

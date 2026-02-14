import { Component } from '@angular/core';
import { TopMenuComponent, type TopMenuItem } from '../../../shared/components/top-menu/top-menu.component';

@Component({
  selector: 'hh-amenidades-top-menu',
  imports: [TopMenuComponent],
  templateUrl: './amenidades-top-menu.component.html'
})
export class AmenidadesTopMenuComponent {
  readonly menuItems: TopMenuItem[] = [
    { route: 'list', label: 'Amenidades', icon: 'fa-solid fa-people-roof', badge: '5' }
  ];
}

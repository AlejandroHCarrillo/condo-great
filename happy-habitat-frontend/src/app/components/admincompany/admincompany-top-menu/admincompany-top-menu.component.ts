import { Component } from '@angular/core';
import { TopMenuComponent, type TopMenuItem } from '../../../shared/components/top-menu/top-menu.component';

@Component({
  selector: 'hh-admincompany-top-menu',
  imports: [TopMenuComponent],
  templateUrl: './admincompany-top-menu.component.html'
})
export class AdmincompanyTopMenuComponent {
  readonly menuItems: TopMenuItem[] = [
    { route: 'comunicados', label: 'Comunicados', icon: 'fa-solid fa-bullhorn' },
    { route: 'residentes', label: 'Residentes', icon: 'fa-solid fa-address-book' },
    { route: 'amenidades', label: 'Amenidades', icon: 'fa-solid fa-people-roof' },
    { route: 'proveedores', label: 'Proveedores', icon: 'fa-solid fa-phone-volume' },
    { route: 'documentos', label: 'Documentos', icon: 'fa-solid fa-file-lines' },
    { route: 'configuracion', label: 'Configuración', icon: 'fa-solid fa-gear' },
    { route: 'reportes', label: 'Reportes', icon: 'fa-solid fa-chart-line' }
  ];
}

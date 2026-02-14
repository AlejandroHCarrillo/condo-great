import { Component } from '@angular/core';
import { TopMenuComponent, type TopMenuItem } from '../../../shared/components/top-menu/top-menu.component';

@Component({
  selector: 'hh-sysadmin-top-menu',
  imports: [TopMenuComponent],
  templateUrl: './system-admin-top-menu.component.html'
})
export class SystemAdminTopMenuComponent {
  readonly menuItems: TopMenuItem[] = [
    { route: 'comunidades', label: 'Comunidades', icon: 'fa-solid fa-building' },
    { route: 'usuarios', label: 'Administradores', icon: 'fa-solid fa-building-user' }
  ];
}

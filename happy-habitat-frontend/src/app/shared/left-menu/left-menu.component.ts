import { Component, computed, inject } from '@angular/core';
import { menuItem } from '../interfaces/menu-item.interface';
import { menuOptions } from '../data/menu-options.data';
import { Router } from '@angular/router';
import { MenuItemComponent } from "./menu-item/menu-item.component";
import { MenuPanicButtonComponent } from "./menu-panic-button/panic-button.component";

@Component({
  selector: 'hh-left-menu',
  imports: [MenuItemComponent, MenuPanicButtonComponent],
  templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
  private router = inject(Router);

  /** En rutas de administración (admincompany) no mostramos "Inicio" (home). */
  menu = computed(() => {
    const url = this.router.url;
    if (url.startsWith('/admincompany')) {
      return menuOptions.filter((item) => item.path !== 'home');
    }
    return [...menuOptions];
  });
}

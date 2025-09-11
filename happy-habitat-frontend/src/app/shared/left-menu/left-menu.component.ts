import { Component, Inject } from '@angular/core';
import { menuItem } from '../interfaces/menu-item.interface';
import { menuOptions } from '../data/menu-options.data';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItemComponent } from "./menu-item/menu-item.component";

@Component({
  selector: 'hh-left-menu',
  imports: [MenuItemComponent],
  templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
  menu : menuItem[] = [...menuOptions];

}

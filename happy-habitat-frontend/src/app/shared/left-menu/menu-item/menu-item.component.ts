import { Component, input } from '@angular/core';
import { menuItem } from '../../interfaces/menu-item.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'hh-menu-item',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-item.component.html'
})
export class MenuItemComponent {
  menuitem = input.required<menuItem>();

}

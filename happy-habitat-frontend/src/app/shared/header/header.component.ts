import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { UserInfoComponent } from "./user-info/user-info.component";

@Component({
  selector: 'hh-header',
  imports: [NavBarComponent, UserInfoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  title = 'Happy Habitat'
  subtitle = 'Administrando comunidades en armonia';
}

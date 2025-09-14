import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { UserInfoComponent } from "./user-info/user-info.component";
import { BreadcrumsComponent } from "../breadcrums/breadcrums.component";

@Component({
  selector: 'hh-header',
  imports: [NavBarComponent, UserInfoComponent, BreadcrumsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  title = 'Happy Habitat'
}

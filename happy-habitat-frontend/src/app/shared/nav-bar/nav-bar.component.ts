import { Component } from '@angular/core';
import { BreadcrumsComponent } from "../breadcrums/breadcrums.component";

@Component({
  selector: 'hh-nav-bar',
  imports: [BreadcrumsComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

}

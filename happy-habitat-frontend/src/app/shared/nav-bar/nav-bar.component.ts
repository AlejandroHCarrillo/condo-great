import { Component } from '@angular/core';
import { BreadcrumsComponent } from "../breadcrums/breadcrums.component";
import { RouterLink } from '@angular/router';
@Component({
  selector: 'hh-nav-bar',
  imports: [BreadcrumsComponent, RouterLink],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent {
  title = "Happy Habitat";

  onSeleccion(event: Event) {
    const valor = (event.target as HTMLSelectElement).value;
    console.log('Theme:', valor);
    document.documentElement.setAttribute('data-theme', valor);
  }
}

import { Component } from '@angular/core';
import { comunicadosdata } from '../../shared/data/announcement.data';
import { ComunicadosPostsComponent } from '../../components/comunicados/comunicados-posts.component';
import { ReservacionesComponent } from "../../components/reservaciones/reservaciones.component";

@Component({
  selector: 'hh-home-page',
  imports: [ComunicadosPostsComponent, ReservacionesComponent],
  templateUrl: './home-page.component.html',
  styles: ``
})
export class HomePageComponent {
  comunicados = [...comunicadosdata];
}

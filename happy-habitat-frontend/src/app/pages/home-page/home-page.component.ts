import { Component } from '@angular/core';
import { anunciosdata } from '../../shared/data/announcement.data';
import { AnunciosListComponent } from "../../components/anuncios/anuncios-list/anuncios-list.component";
import { AvisosListComponent } from "../../components/avisos/avisos-list/avisos-list.component";

@Component({
  selector: 'hh-home-page',
  imports: [AnunciosListComponent],
  templateUrl: './home-page.component.html',
  styles: ``
})
export class HomePageComponent {
  anuncios = [...anunciosdata]
}

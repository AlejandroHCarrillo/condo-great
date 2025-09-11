import { Component } from '@angular/core';
import { anunciosdata } from '../../shared/data/announcement.data';

@Component({
  selector: 'hh-home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styles: ``
})
export class HomePageComponent {
  anuncios = [...anunciosdata]
}

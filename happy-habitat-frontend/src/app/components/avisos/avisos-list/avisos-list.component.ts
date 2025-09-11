import { Component } from '@angular/core';
import { avisos } from '../../../shared/data/advise.data';

@Component({
  selector: 'hh-avisos-list',
  imports: [],
  templateUrl: './avisos-list.component.html',
  styles: ``
})
export class AvisosListComponent {
  avisos = avisos;
}

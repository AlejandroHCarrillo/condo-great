import { Component, input, signal } from '@angular/core';
import { Comunicado } from '../../shared/interfaces/comunicado.interface';
import { comunicadosdata } from '../../shared/data/announcement.data';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'hh-comunicados-posts',
  imports: [DatePipe],
  templateUrl: './comunicados-posts.component.html',
  styles: ``
})
export class ComunicadosPostsComponent {
  // comunicados = input.required<Comunicado[]>();
  comunicados = signal([...comunicadosdata]);
}

import { Component, signal } from '@angular/core';
import { Comunicado } from '../../shared/interfaces/comunicado.interface';
import { DatePipe } from '@angular/common';
import { comunicadosdata } from '../../shared/data/announcement.data';

@Component({
  selector: 'hh-comunicados-list',
  imports: [DatePipe],
  templateUrl: './comunicados-list.component.html',
  styles: ``
})
export class ComunicadosListComponent {
  // comunicados = input.required<Comunicado[]>();  
  comunicados = signal<Comunicado[]>([...comunicadosdata]);  
}

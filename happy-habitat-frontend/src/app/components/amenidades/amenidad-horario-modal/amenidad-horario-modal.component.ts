import { Component, input } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { Horario } from '../../../shared/interfaces/horario.interface';

@Component({
  selector: 'hh-amenidad-horario-modal',
  imports: [JsonPipe],
  templateUrl: './amenidad-horario-modal.component.html',
  styles: ``
})
export class AmenidadHorarioModalComponent {
  horarios = input.required<Horario[]>();
  // amenidadId = input.required<string>();
  // horarios = [...horarioAmenidadesData].filter(x => x.amenidadId = this.amenidadId());
}

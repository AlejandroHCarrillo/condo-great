import { Component, input } from '@angular/core';
import { Horario } from '../../../shared/interfaces/horario.interface';

@Component({
  selector: 'hh-amenidad-horario-modal',
  standalone: true,
  imports: [],
  templateUrl: './amenidad-horario-modal.component.html'
})
export class AmenidadHorarioModalComponent {
  horarios = input.required<Horario[]>();
  // amenidadId = input.required<string>();
  // horarios = [...horarioAmenidadesData].filter(x => x.amenidadId = this.amenidadId());
}

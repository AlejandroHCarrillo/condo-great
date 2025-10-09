import { Horario } from './../../shared/interfaces/horario.interface';
import { JsonPipe } from '@angular/common';
import { amenidadesdata } from '../../shared/data/amenidades.data';
import { Component, signal } from '@angular/core';
import { AmenidadHorarioModalComponent } from "./amenidad-horario-modal/amenidad-horario-modal.component";
import { horarioAmenidadesData } from '../../shared/data/horario-amenidades.data';

@Component({
  selector: 'app-amenidades-grid',
  imports: [JsonPipe, AmenidadHorarioModalComponent],
  templateUrl: './amenidades-grid.component.html',
  styles: ``
})
export class AmenidadesGridComponent {
  amenidades = signal([...amenidadesdata]);
  horariosAmenidades = [...horarioAmenidadesData];

  getHorariosAmenidad(amenidadId: string) : Horario[] {
    
    console.log(amenidadId);    
    let h = [...this.horariosAmenidades.filter(x => x.amenidadId === amenidadId)];
    console.log(h.length);
    console.log(h);
    
    return h[0].horario;
  }
}

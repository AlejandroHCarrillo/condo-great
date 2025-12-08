import { Component } from '@angular/core';
import { preferenciasData, preferenciasUsuariosData } from '../../../shared/data/preferencias.data';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-registro-preferencias',
  imports: [JsonPipe],
  templateUrl: './registro-preferencias.component.html',
  styles: ``
})
export class RegistroPreferenciasComponent {
  preferenciasList = preferenciasData;
  preferenciasUsuario = preferenciasUsuariosData;

}

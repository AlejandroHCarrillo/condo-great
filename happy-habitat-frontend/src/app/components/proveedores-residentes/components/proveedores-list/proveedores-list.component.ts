import { Component, input } from '@angular/core';
import { EntradaDirectorio } from '../../../../shared/interfaces/entrada-directorio.inteface';
import * as router from '@angular/router';

@Component({
  selector: 'hh-proveedores-list',
  imports: [router.RouterLink],
  templateUrl: './proveedores-list.component.html'
})
export class ProveedoresListComponent {
  proveedores = input.required<EntradaDirectorio[]>();
  
  errorMessage = input<string|unknown|null|undefined>('');
  isLoading = input<boolean>(false);
  isEmpty = input<boolean|unknown|null|undefined>(false);

  abrirModal(){
    console.log('Abrir modal...');
    
  }
}

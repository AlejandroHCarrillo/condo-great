import { Router } from '@angular/router';
import type { Comunidad } from '../../../interfaces/comunidad.interface';
import { comunidadesData } from '../../../shared/data/comunidades.data';
import { Component, inject, input, signal } from '@angular/core';
import { PaginationComponent } from "../../../shared/pagination/pagination.component";

@Component({
  selector: 'hh-comunidades-list',
  imports: [PaginationComponent],
  templateUrl: './comunidades-list.component.html',
  styles: ``
})
export class ComunidadesListComponent {
  router = inject(Router);
  
  comunidades = signal<Comunidad[]>(comunidadesData);
  errorMessage = input<string|unknown|null|undefined>('');
  isLoading = input<boolean>(false);
  isEmpty = input<boolean|unknown|null|undefined>(false);

  abrirModal(){
    console.log('Abrir modal...');   
  }

  new() {
    this.router.navigate(['/sysadmin/newuh']);
  }

  edit(unidadId: string ) {
    this.router.navigate(['/sysadmin/edituh/', unidadId]);
  }

  delete(unidadId : string) {
    console.log("Eliminar esta unidad", unidadId);
    
  }
}

import { Component, inject, signal } from '@angular/core';
import { amenidadesdata } from '../../shared/data/amenidades.data';
import { Amenidad } from '../../shared/interfaces/amenidad.interface';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-amenidades-list',
  imports: [DatePipe],
  templateUrl: './amenidades-list.component.html',
  styles: ``
})
export class AmenidadesListComponent {

  router = inject(Router);
  
  amenidades = signal<Amenidad[]>([...amenidadesdata]);

  new() {
    this.router.navigate(['/amenidades/new']);
  }

  edit(id: string ) {
    const url = `/amenidades/edit/${id}`
    console.log("Navegar a: ", url);
    this.router.navigate([url]);
  }

  delete(userId : string) {
    console.log("Eliminar esta amenidad", userId);    
  }
}

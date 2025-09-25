import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { Usuario } from '../../shared/interfaces/usuario-interface';
import { usuariosData } from '../../shared/data/usuarios.data';

@Component({
  selector: 'app-user-list',
  imports: [PaginationComponent],
  templateUrl: './user-list.component.html',
  styles: ``
})
export class UserListComponent {
  router = inject(Router);
  
  usuarios = signal<Usuario[]>(usuariosData);
  errorMessage = input<string|unknown|null|undefined>('');
  isLoading = input<boolean>(false);
  isEmpty = input<boolean|unknown|null|undefined>(false);

  abrirModal(){
    console.log('Abrir modal...');   
  }

  new() {
    const url = `/sysadmin/newusuario`
    console.log("Navegar a: ", url);
    
    this.router.navigate(['/sysadmin/newusuario']);
  }

  edit(userId: string ) {
    const url = `/sysadmin/editusuario/${userId}`
    console.log("Navegar a: ", url);

    this.router.navigate([url]);
  }

  delete(userId : string) {
    console.log("Eliminar esta unidad", userId);
    
  }
}


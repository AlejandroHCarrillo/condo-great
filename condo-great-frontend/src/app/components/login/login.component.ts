import { Component, OnInit } from '@angular/core';
// import { FormsModule, NgForm } from '@angular/forms';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/services.index';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
// import { AuthService } from '../../.. services/services.index';
// import { Usuario } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit  {
  email: string = "";
  recuerdame: boolean = false;

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    if ( this.email.length > 1 ) {
      this.recuerdame = true;
    }
  }

  // constructor(
  //   public router: Router,
  //   public authService: AuthService
  // ) { }

  // ngOnInit(): void {
  //   this.email = localStorage.getItem('email') || '';
  //   if ( this.email.length > 1 ) {
  //     this.recuerdame = true;
  //   }
  // }


  ingresar( forma: NgForm) {
    if ( forma.invalid ) {
      return;
    }

    let usuario = new Usuario("", forma.value.email, forma.value.password );
    // this.authService.login( usuario, forma.value.recuerdame )
    // .then((correcto:any) => this.router.navigate(['/home']));

      // .subscribe( (correcto:any) => this.router.navigate(['/dashboard'])  );
    // this.router.navigate([ '/dashboard' ]);

  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'hh-panic-button',
  imports: [],
  templateUrl: './panic-button.component.html',
  styles: ``
})
export class MenuPanicButtonComponent {


  panic() {
    console.log('Envia señal a seguridad'); 
  }
}

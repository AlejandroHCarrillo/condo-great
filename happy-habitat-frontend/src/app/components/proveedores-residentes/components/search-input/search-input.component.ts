import { Component, effect, input, linkedSignal, OnInit, output, signal } from '@angular/core';

@Component({
  selector: 'hh-search-input',
  imports: [],
  templateUrl: './search-input.component.html',
  styles: ``
})
export class SearchInputComponent  {
  placeholder = input('Buscar por ...');
  debounceTime = input(300);
  initialValue = input<string>('');

  buscar = output<string>();

  // Usar LinkedSignal cuando tenemos una señal que debe ser inicializada 
  inputValue = linkedSignal<string>(() =>this.initialValue()?? '');

  debounceEffect = effect((onCleanup) => {
    const value = this.inputValue();  // Esta es la señal que se esta observando 
    const timeout = setTimeout(() => { // Retarda la emision del valor hasta que dejempos de 
      this.buscar.emit(value);
      console.log(value);      
    }, this.debounceTime());
    onCleanup(() => clearTimeout(timeout)); // Limpia el timeout para evitar emisiones duplicadas
  });

}

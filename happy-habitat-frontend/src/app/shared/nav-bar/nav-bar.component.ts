import { Component, OnInit } from '@angular/core';
import { BreadcrumsComponent } from "../breadcrums/breadcrums.component";
@Component({
  selector: 'hh-nav-bar',
  imports: [],
  templateUrl: './nav-bar.component.html'
})
export class NavBarComponent implements OnInit {
  ngOnInit(): void {
    this.checkThemeStored();
  }
  title = "Happy Habitat";
  themeKey = 'HHTheme';
  
  themeSelected = localStorage.getItem(this.themeKey);
  checkThemeStored(){
    if(this.themeSelected != undefined ){
      document.documentElement.setAttribute('data-theme', this.themeSelected);          
    }
  }

  onSeleccion(event: Event) {
    const valor = (event.target as HTMLSelectElement).value;
    console.log('Theme:', valor);
    document.documentElement.setAttribute('data-theme', valor);    
    localStorage.setItem(this.themeKey, valor);
  }


}

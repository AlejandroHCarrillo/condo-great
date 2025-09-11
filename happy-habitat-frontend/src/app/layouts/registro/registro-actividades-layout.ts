import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RegistroTopMenuComponent } from "../../components/registro/registro-top-menu/registro-top-menu.component";

@Component({
  selector: 'hh-registro-actividades-layout',
  imports: [RouterOutlet, RegistroTopMenuComponent],
  templateUrl: './registro-actividades-layout.html',
})
export class RegistroActividadesLayoutComponent { }

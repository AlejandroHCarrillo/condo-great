import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VigilanciaTopMenuComponent } from "../../components/vigilancia/vigilancia-top-menu/vigilancia-top-menu.component";

@Component({
  selector: 'hh-vigilancia-actividades-layout',
  imports: [RouterOutlet, VigilanciaTopMenuComponent],
  templateUrl: './vigilancia-actividades-layout.html',
})
export class VigilanciaActividadesLayoutComponent { }


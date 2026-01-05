import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ResidentTopMenuComponent } from "../../components/resident/resident-top-menu/resident-top-menu.component";

@Component({
  selector: 'hh-resident-actividades-layout',
  imports: [RouterOutlet, ResidentTopMenuComponent],
  templateUrl: './resident-actividades-layout.html',
})
export class ResidentActividadesLayoutComponent { }

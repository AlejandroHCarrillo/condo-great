import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdmincompanyTopMenuComponent } from "../../components/admincompany/admincompany-top-menu/admincompany-top-menu.component";

@Component({
  selector: 'hh-admincompany-actividades-layout',
  imports: [RouterOutlet, AdmincompanyTopMenuComponent],
  templateUrl: './admincompany-actividades-layout.html',
})
export class AdmincompanyActividadesLayoutComponent { }


import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenuComponent } from '../../components/admincompany/top-menu/top-menu.component';

@Component({
  selector: 'hh-admincompany-actividades-layout',
  imports: [RouterOutlet, TopMenuComponent],
  templateUrl: './admincompany-actividades-layout.html',
})
export class AdmincompanyActividadesLayoutComponent { }


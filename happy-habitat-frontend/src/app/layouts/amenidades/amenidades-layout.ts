import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmenidadesTopMenuComponent } from "../../components/amenidades/amenidades-top-menu/amenidades-top-menu.component";

@Component({
  selector: 'hh-amenidades-layout',
  imports: [RouterOutlet, AmenidadesTopMenuComponent],
  templateUrl: './amenidades-layout.html',
})
export class AmenidadesLayoutComponent { }

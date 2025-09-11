import { Component } from '@angular/core';
import { AvisosListComponent } from "../../components/avisos/avisos-list/avisos-list.component";

@Component({
  selector: 'hh-right-bar',
  imports: [AvisosListComponent],
  templateUrl: './right-bar.component.html',
  styleUrl: './right-bar.component.css'
})
export class RightBarComponent {

}

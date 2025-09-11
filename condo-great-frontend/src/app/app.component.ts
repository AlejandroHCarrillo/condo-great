import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { LeftMenuComponent } from "./components/left-menu/left-menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FooterComponent, LeftMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'condo-great';
}

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { LeftMenuComponent } from "./shared/left-menu/left-menu.component";
import { FooterComponent } from './shared/footer/footer.component';
import { RightBarComponent } from "./shared/right-bar/right-bar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, LeftMenuComponent, FooterComponent, RightBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'happy-habitat';
}

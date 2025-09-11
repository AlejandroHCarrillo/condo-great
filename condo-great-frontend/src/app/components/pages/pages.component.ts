import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { LeftMenuComponent } from '../left-menu/left-menu.component';

@Component({
  selector: 'app-pages',
  imports: [RouterOutlet, FooterComponent, LeftMenuComponent],
  templateUrl: './pages.component.html',
  styleUrl: './pages.component.css'
})
export class PagesComponent {
  title = 'Condo Great';

}

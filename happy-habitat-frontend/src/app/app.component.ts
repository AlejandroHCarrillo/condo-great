import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/header/header.component';
import { LeftMenuComponent } from "./shared/left-menu/left-menu.component";
import { FooterComponent } from './shared/footer/footer.component';
import { RightBarComponent } from "./shared/right-bar/right-bar.component";
import { NotificationContainerComponent } from './shared/components/notification-container/notification-container.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    LeftMenuComponent, 
    FooterComponent, 
    RightBarComponent,
    NotificationContainerComponent,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'happy-habitat';
  private router = inject(Router);
  
  // Verificar si la ruta actual es de autenticación - Usar signal para reactividad
  isAuthRoute = signal<boolean>(false);

  constructor() {
    // Suscribirse a los cambios de ruta para detectar si estamos en /auth
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAuthRoute.set(event.url?.startsWith('/auth') || false);
      });
    
    // Verificar la ruta inicial
    this.isAuthRoute.set(this.router.url?.startsWith('/auth') || false);
  }
}

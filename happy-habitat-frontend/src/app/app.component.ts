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
    let previousUrl = this.router.url;
    
    // Suscribirse a los cambios de ruta para detectar si estamos en /auth
    // y guardar la URL anterior para la página 404
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentUrl = event.url;
        this.isAuthRoute.set(currentUrl?.startsWith('/auth') || false);
        
        // Guardar la URL anterior en sessionStorage para la página 404
        // Solo si no es la misma URL y no es una ruta de autenticación
        if (previousUrl && previousUrl !== currentUrl && !currentUrl.startsWith('/auth')) {
          sessionStorage.setItem('hh_previous_url', previousUrl);
        }
        
        previousUrl = currentUrl;
      });
    
    // Verificar la ruta inicial
    this.isAuthRoute.set(this.router.url?.startsWith('/auth') || false);
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

const PREVIOUS_URL_KEY = 'hh_previous_url';

@Component({
  selector: 'hh-not-found-page',
  imports: [CommonModule],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.css'
})
export class NotFoundPageComponent implements OnInit {
  private location = inject(Location);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // URL que intentó acceder el usuario
  attemptedUrl: string = '';
  // URL anterior desde donde vino (si existe)
  previousUrl: string | null = null;
  // Indica si hay una URL anterior disponible
  hasPreviousUrl: boolean = false;

  ngOnInit(): void {
    // Obtener la URL que intentó acceder
    this.attemptedUrl = this.router.url;

    // Intentar obtener la URL anterior de sessionStorage
    // Esta se guarda automáticamente por el interceptor o guard de navegación
    const storedPreviousUrl = sessionStorage.getItem(PREVIOUS_URL_KEY);
    
    if (storedPreviousUrl && storedPreviousUrl !== this.attemptedUrl) {
      this.previousUrl = storedPreviousUrl;
      this.hasPreviousUrl = true;
    } else {
      // Si no hay URL guardada, verificar si hay historial del navegador
      // Usaremos Location.back() como fallback
      this.hasPreviousUrl = window.history.length > 1;
    }

    // Suscribirse a eventos de navegación para actualizar la URL intentada
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url !== this.attemptedUrl) {
          this.attemptedUrl = event.url;
        }
      });
  }

  goBack(): void {
    if (this.previousUrl && this.previousUrl !== this.attemptedUrl) {
      // Si tenemos una URL anterior guardada, navegar a ella
      this.router.navigateByUrl(this.previousUrl);
    } else if (this.hasPreviousUrl) {
      // Si hay historial del navegador, usar Location.back()
      this.location.back();
    } else {
      // Si no hay historial, redirigir a home
      this.router.navigate(['/home']);
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}

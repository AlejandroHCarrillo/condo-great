import { Component, inject, computed, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface AdmincompanyMenuItem {
  route: string;
  label: string;
  icon: string;
}

const GESTIONAR_ROUTES = ['comunicados', 'residentes', 'amenidades', 'proveedores', 'documentos'] as const;

@Component({
  selector: 'hh-admincompany-top-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admincompany-top-menu.component.html'
})
export class AdmincompanyTopMenuComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private navSubscription?: Subscription;

  /** Menú principal: Gestionar + Documentos, Configuración, Encuestas, Reportes */
  readonly mainMenuItems: AdmincompanyMenuItem[] = [
    { route: 'comunicados', label: 'Gestionar', icon: 'fa-solid fa-screwdriver-wrench' },
    { route: 'configuracion', label: 'Configuración', icon: 'fa-solid fa-gear' },
    { route: 'encuestas', label: 'Encuestas', icon: 'fa-solid fa-clipboard-list' },
    { route: 'reportes', label: 'Reportes', icon: 'fa-solid fa-chart-line' }
  ];

  /** Barra secundaria (cuando estamos en Gestionar): Comunicados, Residentes, Amenidades, Proveedores */
  readonly secondaryMenuItems: AdmincompanyMenuItem[] = [
    { route: 'comunicados', label: 'Comunicados', icon: 'fa-solid fa-bullhorn' },
    { route: 'residentes', label: 'Residentes', icon: 'fa-solid fa-address-book' },
    { route: 'residentes/tickets', label: 'Tickets', icon: 'fa-solid fa-ticket' },
    { route: 'amenidades', label: 'Amenidades', icon: 'fa-solid fa-people-roof' },
    { route: 'proveedores', label: 'Proveedores', icon: 'fa-solid fa-phone-volume' }, 
    { route: 'documentos', label: 'Documentos', icon: 'fa-solid fa-file-lines' },
  ];

  private readonly currentUrl = signal(this.router.url);

  /** Primer segmento después de admincompany, o 'residentes/tickets' cuando estamos en esa ruta. */
  readonly activeSecondaryKey = computed(() => {
    const url = this.currentUrl();
    const segments = url.split('/').filter(Boolean);
    const idx = segments.indexOf('admincompany');
    if (idx < 0 || idx + 1 >= segments.length) return null;
    const first = segments[idx + 1];
    const second = idx + 2 < segments.length ? segments[idx + 2] : null;
    if (first === 'residentes' && second === 'tickets') return 'residentes/tickets';
    return first;
  });

  /** Mostrar barra secundaria cuando la ruta actual es una de gestionar (primer segmento = comunicados, residentes, amenidades, proveedores). */
  readonly showSecondaryBar = computed(() => {
    const url = this.currentUrl();
    const segments = url.split('/').filter(Boolean);
    const idx = segments.indexOf('admincompany');
    const firstChild = idx >= 0 && idx + 1 < segments.length ? segments[idx + 1] : null;
    return firstChild != null && (GESTIONAR_ROUTES as readonly string[]).includes(firstChild);
  });

  ngOnInit(): void {
    this.updateUrlFromRouter();
    this.cdr.markForCheck();
    this.navSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateUrlFromRouter();
        this.cdr.markForCheck();
      });
  }

  private updateUrlFromRouter(): void {
    this.currentUrl.set(this.router.url);
  }

  ngOnDestroy(): void {
    this.navSubscription?.unsubscribe();
  }

  /** "Gestionar" está activo si estamos en cualquiera de las rutas de la barra secundaria (para usar en template). */
  readonly isGestionarActive = this.showSecondaryBar;
}


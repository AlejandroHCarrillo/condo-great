import { Component, inject, computed, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

export interface AdmincompanyMenuItem {
  route: string;
  label: string;
  icon: string;
}

const GESTIONAR_ROUTES = ['comunicados', 'residentes', 'amenidades', 'proveedores', 'documentos', 'cargos-residente'] as const;

@Component({
  selector: 'hh-top-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-menu.component.html'
})
export class TopMenuComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private navSubscription?: Subscription;

  /** Menú principal: Gestionar, Configuración, Encuestas, Reportes (con submenú) */
  readonly mainMenuItems: AdmincompanyMenuItem[] = [
    { route: 'comunicados', label: 'Gestionar', icon: 'fa-solid fa-screwdriver-wrench' },
    { route: 'configuracion', label: 'Configuración', icon: 'fa-solid fa-gear' },
    { route: 'precios', label: 'Precios', icon: 'fa-solid fa-tags' },
    { route: 'encuestas', label: 'Encuestas', icon: 'fa-solid fa-clipboard-list' },
    { route: 'reportes', label: 'Reportes', icon: 'fa-solid fa-chart-line' }
  ];

  /** Submenú de Reportes (rutas apuntan a Not Found hasta que existan los reportes). */
  readonly reportesSubmenuItems: { route: string; label: string; icon: string }[] = [
    { route: 'reportes/morosos', label: 'Morosos', icon: 'fa-solid fa-user-clock' },
    { route: 'reportes/finanzas', label: 'Finanzas', icon: 'fa-solid fa-coins' },
    { route: 'reportes/tickets', label: 'Tickets', icon: 'fa-solid fa-ticket' },
    { route: 'reportes/pago-proveedores', label: 'Pago a Proveedores', icon: 'fa-solid fa-truck' },
    { route: 'reportes/ingresos', label: 'Ingresos', icon: 'fa-solid fa-arrow-trend-up' },
    { route: 'reportes/gastos', label: 'Gastos', icon: 'fa-solid fa-arrow-trend-down' },
    { route: 'reportes/resumen', label: 'Resumen', icon: 'fa-solid fa-chart-pie' }
  ];

  /** Barra secundaria (cuando estamos en Gestionar): Comunicados, Residentes, Amenidades, Proveedores */
  readonly secondaryMenuItems: AdmincompanyMenuItem[] = [
    { route: 'comunicados', label: 'Comunicados', icon: 'fa-solid fa-bullhorn' },
    { route: 'residentes', label: 'Residentes', icon: 'fa-solid fa-address-book' },
    { route: 'residentes/tickets', label: 'Tickets', icon: 'fa-solid fa-ticket' },
    { route: 'cargos-residente', label: 'Cargos', icon: 'fa-solid fa-receipt' },
    { route: 'amenidades', label: 'Amenidades', icon: 'fa-solid fa-people-roof' },
    { route: 'proveedores', label: 'Proveedores', icon: 'fa-solid fa-phone-volume' }, 
    { route: 'documentos', label: 'Documentos', icon: 'fa-solid fa-file-lines' },
  ];

  /** Primer segmento de la ruta activa (hijo del layout): desde ActivatedRoute para que siempre coincida con la navegación. */
  private readonly firstSegment = signal<string | null>(null);

  /** Clave activa en la barra secundaria: primer segmento o 'residentes/tickets' cuando aplica. */
  readonly activeSecondaryKey = computed(() => {
    const first = this.firstSegment();
    if (first === null) return null;
    const child = this.route.snapshot.firstChild;
    const secondPath = child?.url?.[1]?.path;
    if (first === 'residentes' && secondPath === 'tickets') return 'residentes/tickets';
    return first;
  });

  /** Mostrar barra secundaria cuando la ruta actual es una de Gestionar. */
  readonly showSecondaryBar = computed(() => {
    const first = this.firstSegment();
    return first != null && (GESTIONAR_ROUTES as readonly string[]).includes(first);
  });

  ngOnInit(): void {
    this.updateFromRoute();
    this.cdr.markForCheck();
    this.navSubscription = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        this.updateFromRoute();
        this.cdr.markForCheck();
      });
  }

  private updateFromRoute(): void {
    const child = this.route.snapshot.firstChild;
    const first = child?.url?.[0]?.path ?? child?.routeConfig?.path?.split('/')[0] ?? null;
    this.firstSegment.set(first ?? null);
  }

  ngOnDestroy(): void {
    this.navSubscription?.unsubscribe();
  }

  /** "Gestionar" está activo si estamos en cualquiera de las rutas de la barra secundaria (para usar en template). */
  readonly isGestionarActive = this.showSecondaryBar;

  /** "Reportes" está activo si estamos en cualquier ruta reportes o reportes/* */
  readonly isReportesActive = computed(() => this.firstSegment() === 'reportes');
}

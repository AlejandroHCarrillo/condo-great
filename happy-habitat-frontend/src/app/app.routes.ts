import { Routes } from '@angular/router';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { RolesEnum } from './enums/roles.enum';
import { ComunicadosListComponent } from './components/comunicados/comunicados-list.component';
import { ProveedoresServiciosComponent } from './components/proveedores-residentes/components/proveedores-servicios.component';
import { PostsListComponent } from './shared/post/posts-list.component';
import { DocumentsPageComponent } from './pages/documents-page/documents-page.component';

export const routes: Routes = [
    // Rutas públicas de autenticación con layout propio (sin header/menu/footer)
    // Estas rutas NO requieren autenticación
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth-routes')
    },
    // Ruta raíz - redirigir a home (el authGuard en /home manejará la autenticación)
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    // Rutas protegidas con lazy loading
    {
        path: 'home',
        loadComponent: () => import('./pages/home-page/home-page.component').then(m => m.HomePageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
        canActivate: [authGuard]
    },
    {
        path: 'resident',
        loadChildren: () => import('./components/resident/resident-routes'),
        canActivate: [authGuard]
    },
    {
        path: 'sysadmin',
        loadChildren: () => import('./components/system-administation/system-admin-routes'),
        canActivate: [roleGuard([RolesEnum.SYSTEM_ADMIN, RolesEnum.ADMIN_COMPANY])]
    },
    {
        path: 'admincompany',
        loadChildren: () => import('./components/admincompany/admincompany-routes'),
        canActivate: [roleGuard([RolesEnum.ADMIN_COMPANY])]
    },
    {
        path: 'vigilancia',
        loadChildren: () => import('./components/vigilancia/vigilancia-routes'),
        canActivate: [roleGuard([RolesEnum.VIGILANCE])]
    },
    {
        path: 'amenidades',
        loadChildren: () => import('./components/amenidades/amenidades-routes'),
        canActivate: [authGuard]
    },
    {
        path: 'comunicados',
        component: ComunicadosListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'proveedores',
        component: ProveedoresServiciosComponent,
        canActivate: [authGuard]
    },
    {
        path: 'anuncios',
        component: ComunicadosListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'social',
        component: PostsListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'documents',
        component: DocumentsPageComponent,
        canActivate: [authGuard]
    },
    {
        path: '**',
        component: NotFoundPageComponent
    }
];

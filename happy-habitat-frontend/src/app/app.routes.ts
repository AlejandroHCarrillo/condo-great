import { ProveedoresListComponent } from './components/proveedores-residentes/components/proveedores-list/proveedores-list.component';
import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ProveedoresServiciosComponent } from './components/proveedores-residentes/components/proveedores-servicios.component';
import { AvisosListComponent } from './components/avisos/avisos-list/avisos-list.component';
import { ComunicadosListComponent } from './components/comunicados/comunicados-list.component';
import { PostsListComponent } from './shared/post/posts-list.component';
import { DocumentsPageComponent } from './pages/documents-page/documents-page.component';
import { ComunicadosPostsComponent } from './components/comunicados/comunicados-posts.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { RolesEnum } from './enums/roles.enum';

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
    // Rutas protegidas
    {
        path: 'home',
        component: HomePageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        component: DashboardPageComponent,
        canActivate: [authGuard]
    },
    {
        path: 'registro',
        loadChildren: () => import('./components/registro/registro-routes'),
        canActivate: [authGuard]
    },
    {
        path: 'sysadmin',
        loadChildren: () => import('./components/system-administation/system-admin-routes'),
        canActivate: [roleGuard([RolesEnum.SYSTEM_ADMIN, RolesEnum.ADMIN_COMPANY])]
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

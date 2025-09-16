import { ProveedoresListComponent } from './components/proveedores-residentes/components/proveedores-list/proveedores-list.component';
import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ProveedoresServiciosComponent } from './components/proveedores-residentes/components/proveedores-servicios.component';
import { AvisosListComponent } from './components/avisos/avisos-list/avisos-list.component';
import { AnunciosListComponent } from './components/anuncios/anuncios-list/anuncios-list.component';
import { PostsListComponent } from './shared/post/posts-list.component';
import { DocumentsPageComponent } from './pages/documents-page/documents-page.component';

export const routes: Routes = [
    {
        path: '',
        component: HomePageComponent
    },
    // {
    //     path: 'dashboard',
    //     loadChildren: () => import('./pages/dashboard-page'),   
    // },
    {
        path: 'home',
        component: HomePageComponent
    },
    {
        path: 'dashboard',
        component: DashboardPageComponent
    },
    {
        path: 'registro',
        loadChildren: () => import('./components/registro/registro-routes'),   
    },
    {
        path: 'proveedores',
        component: ProveedoresServiciosComponent,   
    },
    {
        path: 'anuncios',
        component: AnunciosListComponent,   
    },
    {
        path: 'social',
        component: PostsListComponent,   
    },
    {
        path: 'documents',
        component: DocumentsPageComponent,   
    },
    {
        path: '**',
        // component: NotFoundPageComponent
        redirectTo: ''
    }
];

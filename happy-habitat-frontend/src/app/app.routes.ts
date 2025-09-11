import { ProveedoresListComponent } from './components/proveedores-residentes/components/proveedores-list/proveedores-list.component';
import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ProveedoresServiciosComponent } from './components/proveedores-residentes/components/proveedores-servicios.component';

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
        path: '**',
        // component: NotFoundPageComponent
        redirectTo: ''
    }
];

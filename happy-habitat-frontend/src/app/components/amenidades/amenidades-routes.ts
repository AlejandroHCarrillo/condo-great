import { Routes } from '@angular/router';
import { AmenidadesLayoutComponent } from '../../layouts/amenidades/amenidades-layout';
import { AmenidadesListComponent } from './amenidades-list.component';
import { AmenidadesGridComponent } from './amenidades-grid.component';
import { AmenidadComponent } from './amenidad.component';

export const registroRoutes: Routes = [
    {
        path: '',
        component: AmenidadesLayoutComponent,
        children:[
        {
            path: 'list',
            component: AmenidadesListComponent
        },
        {
            path: 'grid',
            component: AmenidadesGridComponent
        }, 
        {
            path: 'new',
            component: AmenidadComponent
        }, 
        {
            path: 'edit/:id',
            component: AmenidadComponent
        }, 
        {
            path: 'delete/:id',
            component: AmenidadComponent
        }, 
        // {
        //     path: 'by/:code',
        //     component: CountryPageComponent
        // }
        { 
            path :'**',
            redirectTo: 'grid'
        }
    ]
    },
];

export default registroRoutes;
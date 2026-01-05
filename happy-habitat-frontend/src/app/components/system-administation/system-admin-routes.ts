import { Routes } from '@angular/router';
import { SystemAdministrationLayoutComponent } from '../../layouts/sysadmin/system-admin-layout';
import { UserComponent } from '../users/user.component';
import { ComunidadesListComponent } from './comunidades/comunidades-list.component';
import { ComunidadComponent } from './comunidades/comunidad.component';
import { UserListComponent } from '../users/user-list.component';
import { BannersListComponent } from './banners/banners-list.component';

export const registroRoutes: Routes = [
    {
        path: '',
        component: SystemAdministrationLayoutComponent,
        children:[
        {
            path: 'unidadhabitacional',
            component: ComunidadesListComponent
        },
        {
            path: 'newuh',
            component: ComunidadComponent
        },
        {
            path: 'edituh/:id',
            component: ComunidadComponent
        },
        {
            path: 'usuarios',
            component: UserListComponent
        }, 
        {
            path: 'newusuario',
            component: UserComponent
        }, 
        {
            path: 'editusuario/:id',
            component: UserComponent
        },
        {
            path: 'banners',
            component: BannersListComponent
        }, 

        { 
            path :'**',
            redirectTo: 'unidadhabitacional'
        }
    ]
    },
];

export default registroRoutes;
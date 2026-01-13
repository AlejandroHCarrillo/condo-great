import { Routes } from '@angular/router';
import { SystemAdministrationLayoutComponent } from '../../layouts/sysadmin/system-admin-layout';
import { UserComponent } from '../users/user.component';
import { ComunidadComponent } from './comunidades/comunidad.component';
import { ContratoComponent } from './contratos/contrato.component';
import { UserListComponent } from '../users/user-list.component';
import { BannersListComponent } from './banners/banners-list.component';
import { StatementComponent } from './statement/statement.component';

export const registroRoutes: Routes = [
    {
        path: '',
        component: SystemAdministrationLayoutComponent,
        children:[
        {
            path: 'comunidades/contratos/:comunidadId',
            component: ContratoComponent
        },
        {
            path: 'comunidades/statement/:comunidadId',
            component: StatementComponent
        },
        {
            path: 'comunidades/statement/contrato/:contratoId',
            component: StatementComponent
        },
        {
            path: 'comunidades',
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
            path :'**',
            redirectTo: 'comunidades'
        }
    ]
    },
];

export default registroRoutes;
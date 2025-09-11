import { Routes } from '@angular/router';
import { RegistroActividadesLayoutComponent } from '../../layouts/registro/registro-actividades-layout';
import { RegistroVisitanteComponent } from './registro-visitante/registro-visitante.component';
import { RegistroMudanzaComponent } from './registro-mudanza/registro-mudanza.component';
import { RegistroPaqueteriaComponent } from './registro-paqueteria/registro-paqueteria.component';

export const registroRoutes: Routes = [
    {
        path: '',
        component: RegistroActividadesLayoutComponent,
        children:[
        {
            path: 'visitantes',
            component: RegistroVisitanteComponent
        },
        {
            path: 'mudanza',
            component: RegistroMudanzaComponent
        }, {
            path: 'paqueteria',
            component: RegistroPaqueteriaComponent
        }, 
        // {
        //     path: 'by/:code',
        //     component: CountryPageComponent
        // }
    ]
    },
    { 
        path :'**',
        redirectTo: 'visitantes'
    }
];

export default registroRoutes;
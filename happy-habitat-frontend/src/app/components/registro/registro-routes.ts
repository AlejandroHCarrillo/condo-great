import { Routes } from '@angular/router';
import { RegistroActividadesLayoutComponent } from '../../layouts/registro/registro-actividades-layout';
import { RegistroVisitanteComponent } from './registro-visitante/registro-visitante.component';
import { RegistroMascotaComponent } from './registro-mascota/registrar-mascota.component';
import { RegistroAutoComponent } from './registro-auto/registrar-auto.component';
import { RegistroPreferenciasComponent } from './registro-preferencias/registro-preferencias.component';

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
            path: 'preferencias',
            component: RegistroPreferenciasComponent
        },
        {
            path: 'mascotas',
            component: RegistroMascotaComponent
        },
        {
            path: 'autos',
            component: RegistroAutoComponent
        }, 
        // {
        //     path: 'by/:code',
        //     component: CountryPageComponent
        // }
        { 
            path :'**',
            redirectTo: 'visitantes'
        }
    ]
    },
];

export default registroRoutes;